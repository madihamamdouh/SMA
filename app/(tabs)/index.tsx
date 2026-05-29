import "@/global.css"
import { Text, View } from "react-native";
import {Link} from "expo-router";
import {SafeAreaView as RNSafeAreaView} from "react-native-safe-area-context";
import {styled} from "nativewind";

export default function App() {
    const SafeAreaView = styled(RNSafeAreaView);
    return (
        <SafeAreaView className="flex-1 p-5 bg-background">
            <Text className="text-xl font-bold text-success">
                Welcome to Nativewind!
            </Text>
            <Link href="/onboarding" className="mt-4 rounded-md text-xl font-bold bg-primary p-4 text-white">
                Go to onboarding</Link>
            <Link href="/(auth)/sign-in" className="mt-4 rounded-md text-xl font-bold bg-primary p-4 text-white">
                Go to Sign in</Link>
            <Link href="/(auth)/sign-up" className="mt-4 rounded-md text-xl font-bold bg-primary p-4 text-white">
                Go to sign up</Link>

            <Link href={{
                pathname: "/subscriptions/[id]",
                params: {id :"claude"}
            }} className="mt-4 rounded-md text-xl font-bold bg-primary p-4 text-white">
                Claude Subscription </Link>

            <Link href={{
                pathname: "/subscriptions/[id]",
                params: {id :"codex"}
            }} className="mt-4 rounded-md text-xl font-bold bg-primary p-4 text-white">
                Claude codeX </Link>

        </SafeAreaView>
    );
}