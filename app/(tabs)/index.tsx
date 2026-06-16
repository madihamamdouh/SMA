import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import {
     HOME_BALANCE,
     HOME_USER
} from "@/constants/data";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import "@/global.css";
import { useSubscriptionStore } from "@/lib/subscriptionStore";
import { formatCurrency } from "@/lib/utils";
import { useUser } from "@clerk/expo";
import dayjs from "dayjs";
import { styled } from "nativewind";
import { usePostHog } from "posthog-react-native";
import { useMemo, useState } from "react";
import {
     FlatList,
     Image,
     Pressable,
     Text,
     View
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

export default function App() {
     const { user } = useUser();
     const posthog = usePostHog();
     const SafeAreaView = styled(RNSafeAreaView);
     const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
          string | null>(null);
     const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
     const { subscriptions, addSubscription } = useSubscriptionStore();
     
     const dispalyName =
          user?.firstName ||
          user?.fullName ||
          user?.emailAddresses[0]?.emailAddress ||
          "User";

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

     const handleCreateSubscription = (newSubscription: Subscription) => {
          addSubscription(newSubscription);
          posthog.capture("subscription_created", {
               subscription_id: newSubscription.id,
               subscription_name: newSubscription.name,
               category: newSubscription.category ?? null,
               price: newSubscription.price,
          });
     };

     return (
          <SafeAreaView className="flex-1 p-5 bg-background">
               <CreateSubscriptionModal
                    visible={isCreateModalVisible}
                    onClose={() => setIsCreateModalVisible(false)}
                    onSubmit={handleCreateSubscription}
               />

               <FlatList
                    ListHeaderComponent={() => (
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
                                   <Text className="home-balance-label">Balance</Text>

                                   <View className="home-balance-row">
                                        <Text className="home-balance-amount">
                                             {" "}
                                             {formatCurrency(HOME_BALANCE.amount)}
                                        </Text>
                                        <Text className="home-balance-date">
                                             {dayjs(HOME_BALANCE.nextRenewalDate).format("MM/DD")}
                                        </Text>
                                   </View>
                              </View>

                              <View className="mb-5">
                                   <ListHeading title="Upcoming" />
                                   <FlatList
                                        data={upcomingSubscriptions}
                                        renderItem={({ item }) => (
                                             <UpcomingSubscriptionCard daysLeft={dayjs(item.renewalDate).diff(dayjs(), 'days')}  {...item} />
                                        )}
                                        keyExtractor={(item) => item.id}
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        ListEmptyComponent={
                                             <Text className="home-empty-state">No Upcoming Renewal</Text>
                                        }
                                   />
                              </View>

                              <ListHeading title="All Subscriptions" />
                         </>
                    )}
                    data={subscriptions}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                         <SubscriptionCard
                              {...item}
                              expanded={expandedSubscriptionId === item.id}
                              onPress={()=>handleSubscriptionPress(item)}
                         />
                    )}
                    extraData={expandedSubscriptionId}
                    ItemSeparatorComponent={() => <View className="h-4" />}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={() => <Text>No Subscriptions.</Text>}
                    contentContainerClassName="pb-20"
               />
          </SafeAreaView>
     );
}

