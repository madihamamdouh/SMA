
import dayjs from "dayjs";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { formatCurrency } from "./utils";


const CHANNEL_ID = "renewals";
const PREFS_KEY = "reminderPrefs";
const REMINDER_HOUR = 9;
const MAX_SCHEDULED=60;
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
     if (Platform.OS === "android") {
          await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
               name: "Renewals Reminder",
               importance: Notifications.AndroidImportance.HIGH,
               vibrationPattern: [0, 250, 250, 250],
               lightColor: "#FF231F7C",
          });
     }
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
          body: `${amount} on ${dayjs(sub.renewalDate).format("MMM D",)}. Cancel now if you don't want it.`,
     };
};


export const syncRenewalReminder = async (subscriptions: Subscription[]) => {
     const prefs = await getReminderPrefs();

     //always cancel all existing notifications and reschedule based on current subscriptions and preferences
     await Notifications.cancelAllScheduledNotificationsAsync();

     if (!prefs.enabled) return;

     const { status } = await Notifications.getPermissionsAsync();
     if (status !== "granted") return;

     const now = dayjs();
     //pass 1: work out everything we would schedule.
     const planned:{
          fireAt:dayjs.Dayjs;
          sub: Subscription;
          daysBefore:number;
     } []= [];
     for (const sub of subscriptions) {
          if (sub.status !== "active" || !sub.renewalDate) continue;

          for (const daysBefore of prefs.leadDays) {
               const fireAt = buildFireDate(sub.renewalDate, daysBefore);

               //skip anything already in the past, or it fires immedtialy.
               if (!fireAt.isAfter(now)) continue;
               planned.push({fireAt,sub,daysBefore})

          }
     }
     // Pass 2: soonest first, then keep only what iOS will honour. Anything
     // dropped is the most distant, and re-syncs on the next app open long
     // before it comes due.
     planned.sort((a,b)=>a.fireAt.diff(b.fireAt));
     
     for(const {fireAt, sub, daysBefore} of planned.slice(0, MAX_SCHEDULED)){
          await Notifications.scheduleNotificationAsync({
               content:{
                    ...buildContent(sub, daysBefore),
                    data: {subscriptionId:sub.id},
                    ...(Platform.OS === "android" && {channelId: CHANNEL_ID} ),

               },
               trigger:{
                    type:Notifications.SchedulableTriggerInputTypes.DATE,
                    date:fireAt.toDate(),
                    ...(Platform.OS === "android" && {channelId: CHANNEL_ID} ),

               },
          });
     };

};

export const debugScheduled = async ()=>{
     const all = await Notifications.getAllScheduledNotificationsAsync();
     console.log("Schedualed:", 
          all.map((n)=> ({title: n.content.title, trigger: n.trigger})),
     );
};

export const sendTestNotification = async ()=>{
   const granted= await ensureNotificationPermission();
   if(!granted){
     console.warn("Notification not permitted");
     return
   };
     await Notifications.scheduleNotificationAsync({
          content:{
               title:"SMA aeminder are on",
               body:"This is what a renewal reminders looks like",
               ...(Platform.OS === 'android' && {channelId:CHANNEL_ID})
          },
          trigger:{
               type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
               seconds:10,
               ...(Platform.OS ==="android" && {channelId:CHANNEL_ID})

          },
     });
};
