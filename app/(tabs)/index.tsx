import "@/global.css"
import {Image, Text, View} from "react-native";
import {SafeAreaView as RNSafeAreaView} from "react-native-safe-area-context";
import {styled} from "nativewind";
import images from "@/constants/images";
import {HOME_BALANCE, HOME_USER, UPCOMING_SUBSCRIPTIONS} from "@/constants/data";
import {icons} from "@/constants/icons";
import {formatCurrency} from "@/lib/utils";
import dayjs from "dayjs";
import ListHeading from "@/components/ListHeading";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";

export default function App() {
    const SafeAreaView = styled(RNSafeAreaView);
    return (
        <SafeAreaView className="flex-1 p-5 bg-background">
            <View className="home-header">
                <View className="home-user">
                    <Image source={images.avatar} className="home-avatar" />
                    <Text className="home-user-name" > {HOME_USER.name}</Text>
                </View>
                <Image source={icons.add} className="home-add-icon"/>
            </View>
            <View className="home-balance-card">
                <Text className="home-balance-label">Balance</Text>

                <View className="home-balance-row">
                    <Text className="home-balance-amount"> {formatCurrency(HOME_BALANCE.amount)}</Text>
                    <Text className="home-balance-date">
                        {dayjs(HOME_BALANCE.nextRenewalDate).format("MM/DD")}
                    </Text>
                </View>
            </View>
            <View>
                <ListHeading title="Upcoming news"/>
                <UpcomingSubscriptionCard data={UPCOMING_SUBSCRIPTIONS[0]}/>
            </View>
            <View>
                <ListHeading title="All Subscription"/>
            </View>
        </SafeAreaView>
    );
}