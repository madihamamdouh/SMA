import {View, Text} from 'react-native'
import React from 'react'
import {Link, useLocalSearchParams} from "expo-router";

const SubscriptionDetails = () => {
    const {id} = useLocalSearchParams<{ id: string }>();
    return (
        <View>
            <Text>Subscription Details: {id}</Text>
            <Link href="/" className="mt-6">Go back</Link>
            <Link href="/" className="mt-6">Go back</Link>
        </View>
    )
}
    export default SubscriptionDetails
