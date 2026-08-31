import ListHeading from '@/components/ListHeading'
import SubscriptionCard from '@/components/SubscriptionCard'
import WeeklyBarChart from '@/components/WeeklyBarChart'
import { colors } from '@/constants/theme'
import "@/global.css"
import { useSubscriptionStore } from '@/lib/subscriptionStore'
import { calculateMonthlySpend, formatCurrency } from '@/lib/utils'
import { useAuth } from '@clerk/expo'
import { styled } from 'nativewind'
import React, { useEffect, useMemo, useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context'
import { api } from '@/lib/api'
import dayjs from 'dayjs'

const SafeAreaView = styled(RNSafeAreaView);
const mostRecentActivityDate = (sub: Subscription) =>
     Date.parse(sub.startDate ?? sub.startDate ?? '') || 0
const Insights = () => {
     const { subscriptions } = useSubscriptionStore()
     const [categoryData, setCategoryData] = useState<{ label: string; amount: number }[]>([]);
     const [showAllHistory, setShowAllHistory] = useState(false);
     
     const { getToken } = useAuth();

     useEffect(() => {
          (async () => {
               const token = await getToken();
               if (!token) return;
               try {
                    const data = await api.getInsights(token);
                    const mapped = data.categoryBreakdown.map((item: any) => ({
                         label: item._id || "Other",
                         amount: item.total,
                    }));
                    setCategoryData(mapped);

               } catch (err) {
                    console.error("Failed to fetch insights:", err)
               }
          })();
     }, []);

     const recentHistory = useMemo(() => {
          const sorted = [...subscriptions].sort(
               (a, b) => mostRecentActivityDate(b) - mostRecentActivityDate(a)
          );
          return showAllHistory ? sorted : sorted.slice(0, 3);

     }, [subscriptions, showAllHistory]);

     const monthlySpend = useMemo(
          () => calculateMonthlySpend(subscriptions), [subscriptions]
     );

     return (
          <SafeAreaView className="bg-background flex-1 p-5 ">
               <Text className="mb-5 text-3xl font-sans-bold text-primary">Monthly Insights</Text>

               <ScrollView showsVerticalScrollIndicator={false} className='mb-10'>
                    <ListHeading title="Weekly spending" />

                    <View style={{ backgroundColor: colors.muted, borderRadius: 14, padding: 16, marginBottom: 16 }}>
                         <WeeklyBarChart data={categoryData} />
                    </View>

                    <View style={{ backgroundColor: colors.card, borderRadius: 14, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
                         <View className="flex-row justify-between items-center">
                              <Text className="text-xl font-sans-semibold text-primary">Expenses</Text>
                              <Text className="text-base font-sans-medium text-primary">
                                   {formatCurrency(monthlySpend)}
                              </Text>
                         </View>
                         <View className="flex-row justify-between items-center mt-6">
                              <Text className="text-sm font-sans-medium text-muted-foreground">
                                  {dayjs().format("MMM YYYY")}
                              </Text>
                         </View>
                    </View>

                    <ListHeading title="History" onViewAll={() => setShowAllHistory((prev)=> !prev)} />

                    <View style={{ marginTop: 12 }}>
                         {recentHistory.map((sub) => (
                              <View key={sub.id} className="mb-4">
                                   <SubscriptionCard
                                        {...sub}
                                        expanded={false}
                                        onPress={() => { }}
                                   />
                              </View>
                         ))}
                    </View>
               </ScrollView>
          </SafeAreaView>
     )
}

export default Insights