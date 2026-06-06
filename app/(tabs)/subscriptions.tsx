import {View, Text} from 'react-native'
import React from 'react'
import {SafeAreaView as RNSafeAreaView} from "react-native-safe-area-context";
import {styled} from "nativewind";

const Subscriptions = () => {
    const SafeAreaView = styled(RNSafeAreaView) ;
    return (
        <SafeAreaView className="bg-background flex-1 p-5">
            <Text>Subscriptions</Text>
        </SafeAreaView>
    )
}
export default Subscriptions
