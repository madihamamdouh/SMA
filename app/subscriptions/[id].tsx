import { icons } from "@/constants/icons";
import { useSubscriptionStore } from "@/lib/subscriptionStore";
import { api } from "@/lib/api";
import {
     formatCurrency,
     formatStatusLabel,
     formatSubscriptionDateTime,
     resolveColor,
     resolveIcon,
} from "@/lib/utils";
import { useAuth } from "@clerk/expo";
import clsx from "clsx";
import dayjs from "dayjs";
import { router, useLocalSearchParams } from "expo-router";
import { styled } from "nativewind";
import { usePostHog } from "posthog-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
     ActivityIndicator,
     Alert,
     Image,
     Pressable,
     ScrollView,
     Text,
     View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

/** One label/value line. Mirrors the rows in SubscriptionCard. */
const DetailRow = ({ label, value }: { label: string; value?: string }) => {
     if (!value?.trim()) return null;
     return (
          <View className="sub-row">
               <View className="sub-row-copy">
                    <Text className="sub-label">{label}</Text>
                    <Text
                         className="sub-value text-right"
                         ellipsizeMode="tail"
                         numberOfLines={1}
                    >
                         {value}
                    </Text>
               </View>
          </View>
     );
};

const SubscriptionDetails = () => {
     const { id } = useLocalSearchParams<{ id: string }>();
     const posthog = usePostHog();
     const { getToken } = useAuth();

     const subscriptions = useSubscriptionStore((s) => s.subscriptions);
     const updateSubscription = useSubscriptionStore((s) => s.updateSubscription);
     const deleteSubscription = useSubscriptionStore((s) => s.deleteSubscription);

     // The store is the source of truth while the app is running. But opening
     // this screen straight from a notification can start the app cold, with
     // an empty store — so we keep a locally fetched fallback.
     const fromStore = useMemo(
          () => subscriptions.find((s) => s.id === id),
          [subscriptions, id],
     );
     const [fetched, setFetched] = useState<Subscription | null>(null);
     const [isLoading, setIsLoading] = useState(false);
     const [error, setError] = useState<string | null>(null);
     const [isCancelling, setIsCancelling] = useState(false);

     const sub = fromStore ?? fetched;

     const loadOne = useCallback(async () => {
          if (!id) return;
          setIsLoading(true);
          setError(null);
          try {
               const token = await getToken();
               if (!token) return;
               setFetched(await api.getSubscriptionById(token, id));
          } catch (err) {
               setError((err as Error).message);
          } finally {
               setIsLoading(false);
          }
     }, [id, getToken]);

     useEffect(() => {
          if (!fromStore && !fetched) loadOne();
     }, [fromStore, fetched, loadOne]);

     useEffect(() => {
          if (id) posthog.capture("subscription_detail_viewed", { subscription_id: id });
     }, [id, posthog]);

     const daysUntilRenewal = useMemo(() => {
          if (!sub?.renewalDate) return null;
          const diff = dayjs(sub.renewalDate).startOf("day").diff(dayjs().startOf("day"), "day");
          return diff >= 0 ? diff : null;
     }, [sub?.renewalDate]);

     const renewalLabel = useMemo(() => {
          if (sub?.status === "cancelled") return "Cancelled";
          if (daysUntilRenewal === null) return "No upcoming renewal";
          if (daysUntilRenewal === 0) return "Renews today";
          if (daysUntilRenewal === 1) return "Renews tomorrow";
          return `Renews in ${daysUntilRenewal} days`;
     }, [sub?.status, daysUntilRenewal]);

     const handleCancelPress = async () => {
          if (!sub) return;
          const token = await getToken();
          if (!token) return;
          const newStatus = sub.status === "cancelled" ? "active" : "cancelled";
          setIsCancelling(true);
          try {
               const updated = await updateSubscription(token, sub.id, { status: newStatus });
               // Keep the cold-open copy in step with the change.
               setFetched((prev) => (prev ? { ...prev, status: newStatus } : prev));
               posthog.capture("subscription_status_changed", {
                    subscription_id: sub.id,
                    status: newStatus,
               });
               return updated;
          } catch (err) {
               console.error("Failed to update subscription:", err);
               Alert.alert("Something went wrong", "Could not update this subscription.");
          } finally {
               setIsCancelling(false);
          }
     };

     const handleDeletePress = () => {
          if (!sub) return;
          Alert.alert(
               "Delete Subscription",
               `Are you sure you want to delete ${sub.name}?`,
               [
                    { text: "Cancel", style: "cancel" },
                    {
                         text: "Delete",
                         style: "destructive",
                         onPress: async () => {
                              const token = await getToken();
                              if (!token) return;
                              try {
                                   await deleteSubscription(token, sub.id);
                                   posthog.capture("subscription_deleted", { subscription_id: sub.id });
                                   // replace, not back — this screen no longer has anything to show.
                                   router.replace("/(tabs)/subscriptions");
                              } catch (err) {
                                   console.error("Failed to delete subscription:", err);
                                   Alert.alert("Something went wrong", "Could not delete this subscription.");
                              }
                         },
                    },
               ],
          );
     };

     /* ----------------------------- states ----------------------------- */

     if (isLoading && !sub) {
          return (
               <SafeAreaView className="flex-1 bg-background items-center justify-center">
                    <ActivityIndicator size="large" color="#3b4a9c" />
               </SafeAreaView>
          );
     }

     if (!sub) {
          return (
               <SafeAreaView className="flex-1 bg-background p-5 items-center justify-center">
                    <Text className="text-lg font-sans-bold text-primary mb-2">
                         Subscription not found
                    </Text>
                    <Text className="text-sm font-sans-medium text-muted-foreground mb-6 text-center">
                         {error ?? "It may have been deleted."}
                    </Text>
                    <Pressable
                         className="rounded-full bg-primary px-6 py-3"
                         onPress={() => router.replace("/(tabs)/subscriptions")}
                    >
                         <Text className="font-sans-bold text-background">
                              Back to subscriptions
                         </Text>
                    </Pressable>
               </SafeAreaView>
          );
     }

     const isCancelled = sub.status === "cancelled";

     /* ------------------------------ view ------------------------------ */

     return (
          <SafeAreaView className="flex-1 bg-background">
               <ScrollView
                    className="flex-1 px-5"
                    contentContainerClassName="pb-10"
                    showsVerticalScrollIndicator={false}
               >
                    {/* header */}
                    <View className="flex-row items-center justify-between py-2">
                         <Pressable
                              onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
                              className="size-12 p-3 rounded-full border border-border items-center justify-center"
                              hitSlop={8}
                         >
                              <Image source={icons.back} className="size-5" />
                         </Pressable>
                         <Text className="text-lg font-sans-bold text-primary">Details</Text>
                         <View className="size-12" />
                    </View>

                    {/* hero */}
                    <View className="home-balance-card mt-2">
                         <View className="flex-row items-center gap-4">
                              <View
                                   className="size-16 rounded-2xl items-center justify-center"
                                   style={{ backgroundColor: resolveColor(sub.category) }}
                              >
                                   <Image source={resolveIcon(sub.icon)} className="size-10" />
                              </View>
                              <View className="flex-1 min-w-0">
                                   <Text className="text-2xl font-sans-extrabold text-white" numberOfLines={1}>
                                        {sub.name}
                                   </Text>
                                   <Text className="text-base font-sans-medium text-white/80" numberOfLines={1}>
                                        {sub.category?.trim() || sub.plan?.trim() || "Subscription"}
                                   </Text>
                              </View>
                         </View>

                         <View className="home-balance-row">
                              <Text className="home-balance-amount">
                                   {formatCurrency(sub.price, sub.currency)}
                              </Text>
                              <Text className="home-balance-date">{sub.billing}</Text>
                         </View>

                         <View className="self-start rounded-full bg-white/20 px-4 py-1.5">
                              <Text className="text-sm font-sans-semibold text-white">
                                   {renewalLabel}
                              </Text>
                         </View>
                    </View>

                    {/* details */}
                    <View className="auth-card">
                         <Text className="text-lg font-sans-bold text-primary mb-4">
                              Subscription
                         </Text>
                         <View className="sub-details">
                              <DetailRow label="Plan" value={sub.plan} />
                              <DetailRow label="Category" value={sub.category} />
                              <DetailRow label="Payment" value={sub.paymentMethod} />
                              <DetailRow
                                   label="Started"
                                   value={sub.startDate ? formatSubscriptionDateTime(sub.startDate) : undefined}
                              />
                              <DetailRow
                                   label="Renewal"
                                   value={sub.renewalDate ? formatSubscriptionDateTime(sub.renewalDate) : undefined}
                              />
                              <DetailRow
                                   label="Status"
                                   value={sub.status ? formatStatusLabel(sub.status) : undefined}
                              />
                         </View>
                    </View>

                    {/* actions */}
                    <Pressable
                         onPress={handleCancelPress}
                         disabled={isCancelling}
                         className={clsx(
                              "sub-cancel-btn",
                              isCancelled ? "bg-accent" : "bg-primary",
                              isCancelling && "opacity-50",
                         )}
                    >
                         {isCancelling ? (
                              <ActivityIndicator color="#fff" />
                         ) : (
                              <Text className="sub-cancel-text">
                                   {isCancelled ? "Reactivate Subscription" : "Cancel Subscription"}
                              </Text>
                         )}
                    </Pressable>

                    <Pressable className="mt-4 items-center py-3" onPress={handleDeletePress}>
                         <Text className="font-sans-bold text-destructive">
                              Delete Subscription
                         </Text>
                    </Pressable>
               </ScrollView>
          </SafeAreaView>
     );
};

export default SubscriptionDetails;
