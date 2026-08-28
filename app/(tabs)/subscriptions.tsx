import SubscriptionCard from "@/components/SubscriptionCard";
import "@/global.css";
import { useSubscriptionStore } from "@/lib/subscriptionStore";
import { useAuth } from "@clerk/expo";
import { useFocusEffect } from "expo-router";
import { styled } from "nativewind";
import { usePostHog } from "posthog-react-native";
import { useCallback, useMemo, useRef, useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import SwipeableFlatList, { SwipeableFlatListRef } from "rn-gesture-swipeable-flatlist/reanimated";

const SafeAreaView = styled(RNSafeAreaView);

const Subscriptions = () => {
     const posthog = usePostHog();
     const listRef = useRef<SwipeableFlatListRef<Subscription> | null>(null);
     const [searchQuery, setSearchQuery] = useState("");
     const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
          string | null
     >(null);
     const [cancellingId, setCancellingId] = useState<string | null>(null);
     const { subscriptions, updateSubscription, deleteSubscription } = useSubscriptionStore();
     const { getToken } = useAuth();
     const filteredSubscriptions = useMemo(() => {
          const query = searchQuery.trim().toLowerCase();
          if (!query) return subscriptions;

          return subscriptions.filter((sub) => {
               const searchable = [
                    sub.name,
                    sub.category,
                    sub.plan,
                    sub.billing,
                    sub.status,
                    sub.paymentMethod,
               ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

               return searchable.includes(query);
          });
     }, [searchQuery, subscriptions]);
     const handleCancelPress = async (item: Subscription) => {
          const token = await getToken();
          if (!token) return;
          const newStatus = item.status === "cancelled" ? "active" : "cancelled";
          setCancellingId(item.id);
          try {
               await updateSubscription(token, item.id, { status: newStatus })
          } catch (err) {
               console.error("Failed to update Subscription:", err);
          }
          finally {
               setCancellingId(null);
          }
     };
     const handleDeletePress = (item: Subscription) => {
          Alert.alert(
               "Delete Subscription",
               `Are you sure you want to delete ${item.name}?`,
               [
                    { text: "Cancel", style: "cancel" },
                    {
                         text: "Delete",
                         style: "destructive",
                         onPress: async () => {
                              const token = await getToken();
                              if (!token) return;
                              try {
                                   await deleteSubscription(token, item.id);
                              } catch (err) {
                                   console.log("Failed to delete subscription", err)
                              }
                         },
                    },
               ]
          );
     };

     const renderRightActions = (item: Subscription) => (
          <Pressable
               onPress={() => handleDeletePress(item)}
               className="bg-red-500 justify-center items-center px-6 rounded-2xl ml-3" >
               <Text className="text-white font-sans-bold"> Delete</Text>
          </Pressable>
     );
     useFocusEffect(
          useCallback(() => {
               const timer = setTimeout(() => {
                    listRef.current?.closeAnyOpenRows();
               }, 0);
               return () => {
                    clearTimeout(timer)
                    listRef.current?.closeAnyOpenRows();
               }
          }, [])
     );

     return (
          <SafeAreaView className="flex-1 bg-background p-5">
               <Text className="mb-5 text-3xl font-sans-bold text-primary">
                    Subscriptions
               </Text>

               <TextInput
                    className="auth-input mb-5"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search subscriptions..."
                    placeholderTextColor="rgba(0,0,0,0.4)"
                    autoCapitalize="none"
                    autoCorrect={false}
                    clearButtonMode="while-editing"
               />

               <SwipeableFlatList
                    ref={listRef}
                    data={filteredSubscriptions}
                    keyExtractor={(item) => item.id}
                    renderRightActions={(item) => renderRightActions(item)}
                    renderItem={({ item }) => (
                         <SubscriptionCard
                              {...item}
                              expanded={expandedSubscriptionId === item.id}
                              onPress={() => {
                                   const isExpanding = expandedSubscriptionId !== item.id;
                                   if (isExpanding) {
                                        posthog.capture("subscription_card_expanded", {
                                             subscription_id: item.id,
                                             subscription_name: item.name,
                                             category: item.category ?? "",
                                             billing: item.billing,
                                        });
                                   }
                                   setExpandedSubscriptionId((currentId) =>
                                        currentId === item.id ? null : item.id,
                                   );
                              }}
                              onCancelPress={() => handleCancelPress(item)}
                              isCancelling={cancellingId === item.id}
                         />
                    )}
                    extraData={expandedSubscriptionId}
                    ItemSeparatorComponent={() => <View className="h-4" />}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={() => (
                         <Text className="home-empty-state">
                              {searchQuery.trim()
                                   ? "No subscriptions match your search."
                                   : "No Subscriptions."}
                         </Text>
                    )}
                    contentContainerClassName="pb-20"
               />
          </SafeAreaView>
     );
};

export default Subscriptions;