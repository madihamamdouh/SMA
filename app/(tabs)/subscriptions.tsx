import SubscriptionCard from "@/components/SubscriptionCard";
import "@/global.css";
import { useSubscriptionStore } from "@/lib/subscriptionStore";
import { styled } from "nativewind";
import { usePostHog } from "posthog-react-native";
import { useMemo, useState } from "react";
import { FlatList, Text, TextInput, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Subscriptions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);
  const posthog = usePostHog();
  const { subscriptions } = useSubscriptionStore();

  const filteredSubscriptions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return subscriptions;

    return subscriptions.filter((sub) => {
      const searchable = [
        sub.name,
        sub.category,
        sub.plan,
        sub.billing,
        sub.status,
        sub.paymentMethod,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [searchQuery, subscriptions]);

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="mb-5 text-3xl font-sans-bold text-primary">
        Subscriptions
      </Text>

      <TextInput
        className="auth-input mb-5"
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search subscriptions..."
        placeholderTextColor="rgba(0,0,0,0.4)"
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
      />

      <FlatList
        data={filteredSubscriptions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() => {
              const isExpanding = expandedSubscriptionId !== item.id;
              if (isExpanding) {
                posthog.capture("subscription_card_expanded", {
                  subscription_id: item.id,
                  subscription_name: item.name,
                  category: item.category ?? "",
                  billing: item.billing,
                });
              }
              setExpandedSubscriptionId((currentId) =>
                currentId === item.id ? null : item.id,
              );
            }}
          />
        )}
        extraData={expandedSubscriptionId}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <Text className="home-empty-state">
            {searchQuery.trim()
              ? "No subscriptions match your search."
              : "No Subscriptions."}
          </Text>
        )}
        contentContainerClassName="pb-20"
      />
    </SafeAreaView>
  );
};

export default Subscriptions;