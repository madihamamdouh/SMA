
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";



const CHANNAL_ID = "renewals";
const PREFES_KEY = "reminderPrefs";
const REMINDER_HOUR = 9;
export const DEFAULT_REMINDER_PREFS: ReminderPref = {
     denabled: true,
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
          const raw = await SecureStore.getItemAsync(PREFES_KEY);
          return raw ? { ...DEFAULT_REMINDER_PREFS, ...JSON.parse(raw) } : DEFAULT_REMINDER_PREFS;

     } catch (e) {
          console.error("Error getting reminder preferences:", e);
          return DEFAULT_REMINDER_PREFS;
     }

}
export const setReminderPrefs = async (prefs: ReminderPref) => {
     await SecureStore.setItemAsync(PREFES_KEY, JSON.stringify(prefs));
}
export const ensureNotificationPremission = async (): Promise<boolean> => {
     if (!Device.isDevice) return false; //for emulator or semulator no op
     if (Platform.OS === "android") {
          await Notifications.setNotificationChannelAsync(CHANNAL_ID, {
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

