import ListHeading from '@/components/ListHeading'
import SubscriptionCard from '@/components/SubscriptionCard'
import { colors } from '@/constants/theme'
import "@/global.css"
import { useSubscriptionStore } from '@/lib/subscriptionStore'
import { styled } from 'nativewind'
import React from 'react'
import { ScrollView, Text, View } from 'react-native'
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context'
import Svg, { Line, Path, Text as SvgText } from 'react-native-svg'

const SafeAreaView = styled(RNSafeAreaView)

const WEEKLY_BALANCE = [
     { day: 'Mon', amount: 120 },
     { day: 'Tue', amount: 280 },
     { day: 'Wed', amount: 340 },
     { day: 'Thu', amount: 460 },
     { day: 'Fri', amount: 380 },
     { day: 'Sat', amount: 300 },
     { day: 'Sun', amount: 200 },
]

const CHART_WIDTH = 300
const CHART_HEIGHT = 170
const MARGIN = { top: 12, right: 8, bottom: 22, left: 34 }
const PLOT_WIDTH = CHART_WIDTH - MARGIN.left - MARGIN.right
const PLOT_HEIGHT = CHART_HEIGHT - MARGIN.top - MARGIN.bottom

const roundedTopBarPath = (x: number, y: number, width: number, height: number, radius: number) => {
     const r = Math.min(radius, height)
     return `M${x},${y + r} Q${x},${y} ${x + r},${y} L${x + width - r},${y} Q${x + width},${y} ${x + width},${y + r} L${x + width},${y + height} L${x},${y + height} Z`
}

const WeeklyBarChart = ({ data }: { data: typeof WEEKLY_BALANCE }) => {
     const maxAmount = Math.max(...data.map((d) => d.amount))
     const yMax = Math.ceil(maxAmount / 100) * 100
     const yTicks = [0, yMax / 2, yMax]
     const peakIndex = data.reduce((best, d, i) => (d.amount > data[best].amount ? i : best), 0)

     const bandWidth = PLOT_WIDTH / data.length
     const barWidth = bandWidth * 0.5

     return (
          <Svg width="100%" height={CHART_HEIGHT} viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}>
               {yTicks.map((tick) => {
                    const y = MARGIN.top + PLOT_HEIGHT - (tick / yMax) * PLOT_HEIGHT
                    return (
                         <React.Fragment key={tick}>
                              <Line
                                   x1={MARGIN.left}
                                   y1={y}
                                   x2={CHART_WIDTH - MARGIN.right}
                                   y2={y}
                                   stroke="rgba(8,17,38,0.08)"
                                   strokeWidth={1}
                              />
                              <SvgText x={MARGIN.left - 6} y={y + 3} fontSize={9} fill={colors.mutedForeground} textAnchor="end">
                                   {tick}
                              </SvgText>
                         </React.Fragment>
                    )
               })}

               {data.map((d, i) => {
                    const barHeight = (d.amount / yMax) * PLOT_HEIGHT
                    const x = MARGIN.left + i * bandWidth + (bandWidth - barWidth) / 2
                    const y = MARGIN.top + PLOT_HEIGHT - barHeight
                    return (
                         <React.Fragment key={d.day}>
                              <Path
                                   d={roundedTopBarPath(x, y, barWidth, barHeight, 4)}
                                   fill={i === peakIndex ? colors.accent : 'rgba(8,17,38,0.12)'}
                              />
                              <SvgText
                                   x={x + barWidth / 2}
                                   y={CHART_HEIGHT - MARGIN.bottom + 14}
                                   fontSize={9}
                                   fill={colors.mutedForeground}
                                   textAnchor="middle"
                              >
                                   {d.day}
                              </SvgText>
                         </React.Fragment>
                    )
               })}
          </Svg>
     )
}

const Insights = () => {
     const { subscriptions } = useSubscriptionStore()

     return (
          <SafeAreaView className="bg-background flex-1 p-5">
               <Text className="mb-5 text-3xl font-sans-bold text-primary">Monthly Insights</Text>

               <ScrollView showsVerticalScrollIndicator={false}>
                    <ListHeading title="Upcoming" />

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
                         {subscriptions.slice(0, 3).map((sub) => (
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