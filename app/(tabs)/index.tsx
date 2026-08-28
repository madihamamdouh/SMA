import "@/global.css";
import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import dayjs from "dayjs";
import images from "@/constants/images";
import { HOME_USER } from "@/constants/data";
import { icons } from "@/constants/icons";
import { useSubscriptionStore } from "@/lib/subscriptionStore";
import { calculateMonthlySpend, formatCurrency, getNextRenewalDate } from "@/lib/utils";
import { useUser, useAuth } from "@clerk/expo";
import { styled } from "nativewind";
import { usePostHog } from "posthog-react-native";
import { useEffect, useMemo, useState } from "react";
import {
     ActivityIndicator,
     FlatList,
     Image,
     Pressable,
     Text,
     View
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import UpcomingModal from "@/components/UpcomingModal";

const SafeAreaView = styled(RNSafeAreaView);
export default function App() {
     const mostRecentActivityDate = (sub: Subscription) =>
          Date.parse(sub.createdAt ?? sub.startDate ?? '') || 0
     const { user } = useUser();
     const { getToken } = useAuth();
     const posthog = usePostHog();
     const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
          string | null>(null);
     const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
     const [isUpcomingModalVisible, setIsUpcomingVisible] = useState(false);
     const { subscriptions, isLoading, error, addSubscription, fetchSubscriptions } = useSubscriptionStore();
     const dispalyName =
          user?.firstName ||
          user?.fullName ||
          user?.emailAddresses[0]?.emailAddress ||
          "User";

     useEffect(() => {
          (async () => {
               const token = await getToken();

               if (!token) return;
               fetchSubscriptions(token);
          })();
     }, []);

     // Get upcoming subscriptions (active subscriptions with renewal date within next 7 days)
     const upcomingSubscriptions = useMemo(() => {
          const now = dayjs();
          const nextWeek = now.add(7, 'days');
          return subscriptions.filter(sub =>
               sub.status === 'active' &&
               dayjs(sub.renewalDate).isAfter(now) &&
               dayjs(sub.renewalDate).isBefore(nextWeek)
          ).sort((a, b) => dayjs(a.renewalDate).diff(dayjs(b.renewalDate)));
     }, [subscriptions]);

     const handleSubscriptionPress = (item: Subscription) => {
          const isExpanding = expandedSubscriptionId !== item.id;
          if (isExpanding) {
               posthog.capture("subscription_card_expanded", {
                    subscription_id: item.id,
                    subscription_name: item.name,
                    category: item.category ?? null,
                    billing: item.billing,
               });
          }
          setExpandedSubscriptionId((currentId) =>
               currentId === item.id ? null : item.id,
          );
     };

     const handleCreateSubscription = async (newSubscription: Subscription) => {
          const token = await getToken();
          if (!token) return;
          try {
               await addSubscription(token, newSubscription);
               posthog.capture("subscription_created", {
                    subscription_id: newSubscription.id,
                    subscription_name: newSubscription.name,
                    category: newSubscription.category ?? null,
                    price: newSubscription.price,
               });
          } catch (err) {
               console.error("Failed to create subscripton:", err);
          }
     };
     const recentHistory = useMemo(() =>
          [...subscriptions]
               .sort((a, b) => mostRecentActivityDate(b) - mostRecentActivityDate(a))
               .slice(0, 4)

          , [subscriptions]);
     const monthlySpend = useMemo(
          () => calculateMonthlySpend(subscriptions), [subscriptions]
     );

     const nextRenewal = useMemo(
          () => getNextRenewalDate(subscriptions), [subscriptions]
     );
     const listHeader = useMemo(() => (
          <>
               <View className="home-header">
                    <View className="home-user">
                         <Image
                              source={
                                   user?.imageUrl ? { uri: user.imageUrl } : images.avatar
                              }
                              className="home-avatar"
                         />
                         <Text className="home-user-name">
                              {" "}
                              {dispalyName || HOME_USER.name}
                         </Text>
                    </View>
                    <Pressable onPress={() => setIsCreateModalVisible(true)}>
                         <Image source={icons.add} className="home-add-icon" />
                    </Pressable>
               </View>
               <View className="home-balance-card">
                    <Text className="home-balance-label">Monthly Spending</Text>
                    <View className="home-balance-row">
                         <Text className="home-balance-amount">
                              {" "}
                              {formatCurrency(monthlySpend)}
                         </Text>
                         <Text className="home-balance-date">
                              {nextRenewal ? dayjs(nextRenewal).format("MM/DD") : "_"}
                         </Text>
                    </View>
               </View>
               <View className="mb-5">
                    <ListHeading title="Upcoming" onViewAll={() => setIsUpcomingVisible(true)} />
                    <FlatList
                         data={upcomingSubscriptions}
                         renderItem={({ item }) => (
                              <UpcomingSubscriptionCard
                                   {...item}
                                   icon={item.icon}
                                   daysLeft={dayjs(item.renewalDate).diff(dayjs(), 'days')}
                              />
                         )}
                         keyExtractor={(item) => item.id}
                         horizontal
                         showsHorizontalScrollIndicator={false}
                         ListEmptyComponent={<Text className="home-empty-state">No Upcoming Renewal</Text>}
                    />
               </View>
               <ListHeading title="All Subscriptions" onViewAll={() => router.push("/(tabs)/subscriptions")} />
          </>
     ), [monthlySpend, nextRenewal, upcomingSubscriptions, user, dispalyName])

     return (
          <SafeAreaView className="flex-1 p-5 bg-background">
               <CreateSubscriptionModal
                    visible={isCreateModalVisible}
                    onClose={() => setIsCreateModalVisible(false)}
                    onSubmit={handleCreateSubscription}
               />
               <UpcomingModal
                    visible={isUpcomingModalVisible}
                    onClose={() => setIsUpcomingVisible(false)}
                    subscriptions={subscriptions}
               />

               <FlatList
                    ListHeaderComponent={listHeader}
                    data={recentHistory}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                         <SubscriptionCard
                              {...item}
                              expanded={expandedSubscriptionId === item.id}
                              onPress={() => handleSubscriptionPress(item)}
                         />
                    )}
                    extraData={expandedSubscriptionId}
                    ItemSeparatorComponent={() => <View className="h-4" />}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={() => {
                         if (isLoading) {
                              return (
                                   <View className="items-center py-10">
                                        <ActivityIndicator size="large" color="#081126" />
                                   </View>
                              );
                         }
                         if (error) {
                              return (
                                   <View className="items-center py-10">
                                        <Text className="home-empty-state">
                                             Something Went Wrong.
                                        </Text>
                                        <Pressable className="mt-3"
                                             onPress={async () => {
                                                  const token = await getToken();
                                                  if (token) fetchSubscriptions(token);
                                             }}
                                        >
                                             <Text className="text-primary font-sans-bold">
                                                  Tap to Retry
                                             </Text>
                                        </Pressable>
                                   </View>
                              );
                         }
                         return <Text>No Subscriptions.</Text>
                    }}
                    contentContainerClassName="pb-20"
               />
          </SafeAreaView>
     );
}
