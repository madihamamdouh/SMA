import { formatCurrency, resolveIcon } from "@/lib/utils";
import clsx from "clsx";
import React from 'react';
import { Image, Text, View } from 'react-native';

const UpcomingSubscriptionCard = ({name, price, daysLeft, icon, currency, fullWidth}: UpcomingSubscriptionProps) => {
    return (
        <View className="upcoming-card" style={fullWidth?{width:"90%", alignSelf:"center", marginInline:"auto"}: undefined}>
           <View className="upcoming-row">
               <Image source={resolveIcon(icon)} className="upcoming-icon"/>
               <View>
                   <Text className="upcoming-price">
                       {formatCurrency(price,currency)}
                   </Text>
                   <Text className="upcoming-meta" numberOfLines={1}>
                       {daysLeft >1 ? `${daysLeft} days left`: 'last day'}
                   </Text>
               </View>
           </View>
            <Text className="upcoming-name" numberOfLines={1}>{name}</Text>
        </View>
    )
}
export default UpcomingSubscriptionCard