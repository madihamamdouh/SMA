import "@/global.css"
import { Text, View } from "react-native";
import {Link} from "expo-router";
import {SafeAreaView as RNSafeAreaView} from "react-native-safe-area-context";
import {styled} from "nativewind";

export default function App() {
    const SafeAreaView = styled(RNSafeAreaView);
    return (
        <SafeAreaView className="flex-1 p-5 bg-background">
            <Text className="text-4xl font-bold text-success">
                Home
            </Text>
            <Text className="text-4xl font-sans-extrabold text-success">
                Home
            </Text>
            <Link href="/onboarding" className="mt-4 rounded-md text-xl font-bold bg-primary p-4 text-white">
                Go to onboarding</Link>
            <Link href="/(auth)/sign-in" className="mt-4 rounded-md text-xl font-bold bg-primary p-4 text-white">
                Go to Sign in</Link>
            <Link href="/(auth)/sign-up" className="mt-4 rounded-md text-xl font-bold bg-primary p-4 text-white">
                Go to sign up</Link>



        </SafeAreaView>
    );
}