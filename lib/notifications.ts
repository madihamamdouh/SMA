
import dayjs from "dayjs";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { formatCurrency } from "./utils";


const CHANNEL_ID = "renewals";
const PREFS_KEY = "reminderPrefs";
const REMINDER_HOUR = 9;
const MAX_SCHEDULED = 60;
export const DEFAULT_REMINDER_PREFS: ReminderPref = {
     enabled: true,
     leadDays: [1, 3, 7],
};
Notifications.setNotificationHandler({
     handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
     }),
});

// Android channels are created once and persist at OS level. Doing it at
// module load removes the hidden dependency on ensureNotificationPermission
// having run first — syncRenewalReminder can schedule on any app open.

if (Platform.OS === "android") {
     Notifications.setNotificationChannelAsync(CHANNEL_ID, {
          name: "Renewals reminders",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#3b4a9c",
     }).catch((e) => console.warn("Failed to create a notification channel:", e));
}

export const getReminderPrefs = async (): Promise<ReminderPref> => {
     try {
          const raw = await SecureStore.getItemAsync(PREFS_KEY);
          return raw ? { ...DEFAULT_REMINDER_PREFS, ...JSON.parse(raw) } : DEFAULT_REMINDER_PREFS;

     } catch (e) {
          console.error("Error getting reminder preferences:", e);
          return DEFAULT_REMINDER_PREFS;
     }

}
export const setReminderPrefs = async (prefs: ReminderPref) => {
     await SecureStore.setItemAsync(PREFS_KEY, JSON.stringify(prefs));
}
export const ensureNotificationPermission = async (): Promise<boolean> => {
     if (!Device.isDevice) return false; //for emulator or semulator no op
     const { status: existing } = await Notifications.getPermissionsAsync();
     if (existing === "granted") return true;
     const { status } = await Notifications.requestPermissionsAsync();
     return status === "granted";
}

const buildFireDate = (renewalDate: string, daysBefore: number) =>
     dayjs(renewalDate)
          .subtract(daysBefore, "day")
          .hour(REMINDER_HOUR)
          .minute(0)
          .second(0)
          .millisecond(0);

const buildContent = (sub: Subscription, daysBefore: number) => {

     const when = daysBefore === 1 ? "tomorrow" : `in ${daysBefore} days from now`;
     const amount = formatCurrency(sub.price, sub.currency);
     return {
          title: `${sub.name} renews ${when}`,
          body: `${amount} on ${dayjs(sub.renewalDate).format("MMM D")}. Cancel now if you don't want it.`,
     };
};


const runSync = async (subscriptions: Subscription[]) => {
     const prefs = await getReminderPrefs();

     // Cancel our reminders and rebuild from scratch — but leave a pending
     // test notification alone, it isn't ours to clear.    
     const existing = await Notifications.getAllScheduledNotificationsAsync();
     await Promise.all(
          existing
               .filter((n) => !n.content.data?.test)
               .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
     )

     if (!prefs.enabled) return;

     const { status } = await Notifications.getPermissionsAsync();
     if (status !== "granted") return;

     const now = dayjs();
     //pass 1: work out everything we would schedule.
     const planned: {
          fireAt: dayjs.Dayjs;
          sub: Subscription;
          daysBefore: number;
     }[] = [];
     for (const sub of subscriptions) {
          if (sub.status !== "active" || !sub.renewalDate) continue;
          const before = planned.length;

          for (const daysBefore of prefs.leadDays) {
               const fireAt = buildFireDate(sub.renewalDate, daysBefore);

               //skip anything already in the past, or it fires immedtialy.
               if (!fireAt.isAfter(now)) continue;
               planned.push({ fireAt, sub, daysBefore })

          }
          if (planned.length === before && dayjs(sub.renewalDate).isAfter(now)) {
               const daysLeft = Math.max(1, dayjs(sub.renewalDate).diff(now, "day"));
               planned.push({
                    fireAt: now.add(2, "minute"),
                    sub,
                    daysBefore: daysLeft,
               })
          }
     }
     // Pass 2: soonest first, then keep only what iOS will honour. Anything
     // dropped is the most distant, and re-syncs on the next app open long
     // before it comes due.
     planned.sort((a, b) => a.fireAt.diff(b.fireAt));

     for (const { fireAt, sub, daysBefore } of planned.slice(0, MAX_SCHEDULED)) {
          await Notifications.scheduleNotificationAsync({
               content: {
                    ...buildContent(sub, daysBefore),
                    data: { subscriptionId: sub.id },
                    ...(Platform.OS === "android" && { channelId: CHANNEL_ID }),

               },
               trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date: fireAt.toDate(),
                    ...(Platform.OS === "android" && { channelId: CHANNEL_ID }),

               },
          });
     };

};
let syncQueue: Promise<void> = Promise.resolve();

// Every caller shares one queue, so two syncs can never interleave —
// otherwise one run's cancel pass can wipe another run's partial work.
export const syncRenewalReminder = (subscriptions: Subscription[]): Promise<void> => {
     syncQueue = syncQueue
          .then(() => runSync(subscriptions))
          .catch((e) => console.warn("Reminder sync failed:", e));
     return syncQueue;
}

export const debugScheduled = async () => {
     const all = await Notifications.getAllScheduledNotificationsAsync();
     console.log("Scheduled:",
          all.map((n) => ({ title: n.content.title, trigger: n.trigger })),
     );
};
export const getScheduledCount = async (): Promise<number> => {
     const all = await Notifications.getAllScheduledNotificationsAsync();
     return all.filter((n) => !n.content.data?.test).length;
}

export const sendTestNotification = async () => {
     const granted = await ensureNotificationPermission();
     if (!granted) {
          console.warn("Notification not permitted");
          return;
     };
     await Notifications.scheduleNotificationAsync({
          content: {
               title: "SMA notifications are working",
               body: "This is what a renewal reminder looks like",
               data: { test: true },
               ...(Platform.OS === 'android' && { channelId: CHANNEL_ID })
          },
          trigger: {
               type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
               seconds: 10,
               ...(Platform.OS === "android" && { channelId: CHANNEL_ID })

          },
     });
};
