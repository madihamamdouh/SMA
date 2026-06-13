import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { Link, useLocalSearchParams } from "expo-router";
import { usePostHog } from "posthog-react-native";

const SubscriptionDetails = () => {
    const { id } = useLocalSearchParams<{ id: string }>();
    const posthog = usePostHog();

    useEffect(() => {
        if (id) {
            posthog.capture('subscription_detail_viewed', { subscription_id: id });
        }
    }, [id, posthog]);

    return (
        <View>
            <Text>Subscription Details: {id}</Text>
            <Link href="/" className="mt-6">Go back</Link>
        </View>
    )
}
export default SubscriptionDetails
