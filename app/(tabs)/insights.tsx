import ListHeading from '@/components/ListHeading'
import SubscriptionCard from '@/components/SubscriptionCard'
import WeeklyBarChart from '@/components/WeeklyBarChart'
import { colors } from '@/constants/theme'
import "@/global.css"
import { useSubscriptionStore } from '@/lib/subscriptionStore'
import { styled } from 'nativewind'
import React from 'react'
import { ScrollView, Text, View } from 'react-native'
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context'

const SafeAreaView = styled(RNSafeAreaView)

const WEEKLY_BALANCE: WeeklyBalancePoint[] = [
     { day: 'Mon', amount: 120 },
     { day: 'Tue', amount: 280 },
     { day: 'Wed', amount: 340 },
     { day: 'Thu', amount: 460 },
     { day: 'Fri', amount: 380 },
     { day: 'Sat', amount: 300 },
     { day: 'Sun', amount: 200 },
]

const mostRecentActivityDate = (sub: Subscription) =>
     Date.parse(sub.renewalDate ?? sub.startDate ?? '') || 0

const Insights = () => {
     const { subscriptions } = useSubscriptionStore()
     const recentHistory = [...subscriptions]
          .sort((a, b) => mostRecentActivityDate(b) - mostRecentActivityDate(a))
          .slice(0, 3)

     return (
          <SafeAreaView className="bg-background flex-1 p-5">
               <Text className="mb-5 text-3xl font-sans-bold text-primary">Monthly Insights</Text>

               <ScrollView showsVerticalScrollIndicator={false}>
                    <ListHeading title="Weekly spending" />

                    <View style={{ backgroundColor: colors.muted, borderRadius: 14, padding: 16, marginBottom: 16 }}>
                         <WeeklyBarChart data={WEEKLY_BALANCE} />
                    </View>

                    <View style={{ backgroundColor: colors.card, borderRadius: 14, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
                         <View className="flex-row justify-between items-center">
                              <Text className="text-xl font-sans-semibold text-primary">Expenses</Text>
                              <Text className="text-base font-sans-medium text-primary">$-424.63</Text>
                         </View>
                         <View className="flex-row justify-between items-center mt-6">
                              <Text className="text-sm font-sans-medium text-muted-foreground">
                                   March 2026
                              </Text>
                              <Text className="text-sm font-sans-medium text-muted-foreground">
                                   +12%
                              </Text>
                         </View>
                    </View>

                    <ListHeading title="History" />

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