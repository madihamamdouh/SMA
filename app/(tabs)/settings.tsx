import images from "@/constants/images";
import {
     DEFAULT_REMINDER_PREFS,
     ensureNotificationPermission,
     getReminderPrefs,
     getScheduledCount,
     sendTestNotification,
     setReminderPrefs,
     syncRenewalReminder
} from "@/lib/notifications";
import { useSubscriptionStore } from "@/lib/subscriptionStore";
import { useClerk, useUser } from "@clerk/expo";
import { styled } from "nativewind";
import { usePostHog } from "posthog-react-native";
import React, { useEffect, useState } from "react";
import { Image, Pressable, Switch, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);
const LEAD_OPTIONS = [7, 3, 1];

const Settings = () => {
     const { signOut } = useClerk();
     const { user } = useUser();
     const posthog = usePostHog();
     const [prefs, setPrefs] = useState<ReminderPref>(DEFAULT_REMINDER_PREFS);
     const subscriptions = useSubscriptionStore((s) => s.subscriptions);
     const [scheduledCount, setScheduledCount] = useState(0);

     const refreshCount = async()=>{
          setScheduledCount(await getScheduledCount());
     }
     const handleSignOut = async () => {
          posthog.capture('user_signed_out');
          await signOut();
          posthog.reset();
     };
     const dispalyName =
          user?.firstName ||
          user?.fullName ||
          user?.emailAddresses[0]?.emailAddress ||
          "User";
     const email = user?.emailAddresses[0]?.emailAddress || "No email";

     useEffect(() => {
          getReminderPrefs().then(setPrefs).catch(console.error);
          refreshCount();
     }, []);
     
     const applyPrefs = async (next: ReminderPref) => {
          if (next.enabled) {
               const granted = await ensureNotificationPermission();
               if (!granted) {
                    next = { ...next, enabled: false };
               }
          }
          setPrefs(next);
          await setReminderPrefs(next);
          await syncRenewalReminder(subscriptions);
          await refreshCount();
          posthog.capture("reminder_prefs_changed", {
               enabled: next.enabled,
               lead_days: next.leadDays,
          });
     };

     const toggleLead = (day: number) => {
          const isRemoving = prefs.leadDays.includes(day);
          //dont let user reaches a state where a reminder are "on" but never fire.
          if (isRemoving && prefs.leadDays.length === 1) return;

          const leadDays = isRemoving
               ? prefs.leadDays.filter((d: number) => d !== day)
               : [...prefs.leadDays, day].sort((a, b) => b - a);
          applyPrefs({ ...prefs, leadDays });
     };
     return (
          <SafeAreaView className="flex-1 bg-background p-5">
               <Text className="text-3xl font-sans-bold text-primary mb-6">
                    Settings
               </Text>

               {/* User Info Section */}
               <View className="auth-card mb-5">
                    <View className="flex-row items-center gap-4 mb-4">
                         <Image
                              className="size-16 rounded-full"
                              source={user?.imageUrl ? { uri: user.imageUrl } : images.avatar}
                         />
                         <View className="flex-1">
                              <Text className="text-lg font-sans-bold text-primary">
                                   {dispalyName}
                              </Text>
                              <Text className="text-sm font-sans-medium text-muted-foreground">
                                   {email}
                              </Text>
                         </View>
                    </View>
               </View>

               {/* ---------- Renewal reminders ---------- */}
               <View className="auth-card mb-5">
                    <View className="flex-row items-center justify-between mb-3">
                         <Text className="text-lg font-sans-bold text-primary">
                              Renewal reminders
                         </Text>
                         <Switch
                              value={prefs.enabled}
                              onValueChange={(enabled) => applyPrefs({ ...prefs, enabled })}
                              trackColor={{ true: "#3b4a9c" }}
                         />
                    </View>

                    {prefs.enabled && (
                         <>
                              <Text className="text-sm font-sans-medium text-muted-foreground mb-2">
                                   Remind me before renewal
                              </Text>
                              <View className="flex-row gap-2">
                                   {LEAD_OPTIONS.map((day) => {
                                        const active = prefs.leadDays.includes(day);
                                        return (
                                             <Pressable
                                                  key={day}
                                                  onPress={() => toggleLead(day)}
                                                  className={`px-4 py-2 rounded-full ${active ? "bg-primary" : "bg-muted"
                                                       }`}
                                             >
                                                  <Text
                                                       className={`text-sm font-sans-semibold ${active ? "text-white" : "text-muted-foreground"
                                                            }`}
                                                  >
                                                       {day} {day === 1 ? "day" : "days"}
                                                  </Text>
                                             </Pressable>
                                        );
                                   })}
                              </View>
                              <Text className="text-s font-medium text-muted-foreground mt-3">
                                   {
                                        scheduledCount === 0
                                        ? "No Reminders scheduled"
                                        :`${scheduledCount} reminder${scheduledCount === 1? "": "s"} scheduled`
                                   }

                              </Text>

                              <Pressable className="mt-4" onPress={sendTestNotification}>
                                   <Text className="text-primary font-sans-bold text-sm">
                                        Send a test notification
                                   </Text>
                              </Pressable>
                         </>
                    )}
               </View>
                 {/* account section */}
               <View className="auth-card mb-5">
                    <Text className="text-lg font-sans-bold text-primary mb-3">
                         Account
                    </Text>
                    <View className="gap-2">
                         <View className="flex-row items-center justify-between py-2">
                              <Text className="text-sm font-sans-medium text-muted-foreground">
                                   Account ID
                              </Text>
                              <Text
                                   className="text-sm font-sans-medium text-primary"
                                   numberOfLines={1}
                                   ellipsizeMode="tail"
                              >
                                   {user?.id?.substring(0, 20)}...
                              </Text>
                         </View>
                         <View className="flex-row justify-between items-center py-2">
                              <Text className="text-sm font-sans-medium text-muted-foreground">
                                   Joined
                              </Text>
                              <Text className="text-sm font-sans-medium text-primary">
                                   {user?.createdAt
                                        ? new Date(user.createdAt).toLocaleDateString()
                                        : "N/A"}
                              </Text>
                         </View>
                    </View>
               </View>

               <Pressable className="auth-button bg-destructive" onPress={handleSignOut}>
                    <Text className="auth-button-text">Sign Out</Text>
               </Pressable>
          </SafeAreaView>
     );
};
export default Settings;
