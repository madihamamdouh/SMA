import { colors } from '@/constants/theme';
import React from 'react';
import { Text } from 'react-native';
import Svg, { Line, Path, Text as SvgText } from 'react-native-svg';
const CHART_WIDTH = 300
const CHART_HEIGHT = 170
const MARGIN = { top: 12, right: 8, bottom: 22, left: 34 }
const PLOT_WIDTH = CHART_WIDTH - MARGIN.left - MARGIN.right
const PLOT_HEIGHT = CHART_HEIGHT - MARGIN.top - MARGIN.bottom

const roundedTopBarPath = (x: number, y: number, width: number, height: number, radius: number) => {
     const r = Math.min(radius, height)
     return `M${x},${y + r} Q${x},${y} ${x + r},${y} L${x + width - r},${y} Q${x + width},${y} ${x + width},${y + r} L${x + width},${y + height} L${x},${y + height} Z`
}

const WeeklyBarChart = ({ data }: WeeklyBarChartProps) => {
     if (data.length === 0) {
          return (
               <Text className="home-empty-state"> No Spending Data yet </Text>
          );
     }
     const maxAmount = Math.max(...data.map((d) => d.amount))
     const yMax = Math.ceil(maxAmount / 10) * 10
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
                         <React.Fragment key={d.label}>
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
                                   textLength={9}
                              >
                                   {d.label.length > 8 ? d.label.slice(0, 9) + "..." : d.label}
                              </SvgText>
                         </React.Fragment>
                    )
               })}
          </Svg>
     )
}

export default WeeklyBarChart
