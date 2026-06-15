import { icons } from "@/constants/icons";
import { posthog } from "@/src/config/posthog";
import clsx from "clsx";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import {
     KeyboardAvoidingView,
     Modal,
     Platform,
     Pressable,
     ScrollView,
     Text,
     TextInput,
     View,
} from "react-native";

const CATEGORIES = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
] as const;

const FREQUENCIES = ["Monthly", "Yearly"] as const;

type Frequency = (typeof FREQUENCIES)[number];
type Category = (typeof CATEGORIES)[number];

const CATEGORY_COLORS: Record<Category, string> = {
  Entertainment: "#ffd6a5",
  "AI Tools": "#b8d4e3",
  "Developer Tools": "#e8def8",
  Design: "#f5c542",
  Productivity: "#b8e8d0",
  Cloud: "#c9e4ff",
  Music: "#ffc8dd",
  Other: "#f6eecf",
};

interface CreateSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (subscription: Subscription) => void;
}

const CreateSubscriptionModal = ({
  visible,
  onClose,
  onSubmit,
}: CreateSubscriptionModalProps) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("Monthly");
  const [category, setCategory] = useState<Category>("Other");

  const resetForm = () => {
    setName("");
    setPrice("");
    setFrequency("Monthly");
    setCategory("Other");
  };

  useEffect(() => {
    if (!visible) {
      resetForm();
    }
  }, [visible]);

  const trimmedName = name.trim();
  const parsedPrice = parseFloat(price);
  const isValid =
    trimmedName.length > 0 && !Number.isNaN(parsedPrice) && parsedPrice > 0;

  const handleSubmit = () => {
    if (!isValid) return;

    const startDate = dayjs().toISOString();
    const renewalDate =
      frequency === "Monthly"
        ? dayjs().add(1, "month").toISOString()
        : dayjs().add(1, "year").toISOString();

    onSubmit({
      id: `${trimmedName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
      icon: icons.wallet,
      name: trimmedName,
      price: parsedPrice,
      currency: "AED",
      billing: frequency,
      category,
      status: "active",
      startDate,
      renewalDate,
      color: CATEGORY_COLORS[category],
    });

    posthog.capture("subscription_created", {
      subscription_name: name,
      subsscription_category: category ?? null,
      subscription_billing: price,
    });
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable className="modal-overlay" onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-end"
        >
          <View className="modal-container">
            <View className="modal-header">
              <Text className="modal-title">New Subscription</Text>
              <Pressable className="modal-close" onPress={onClose}>
                <Text className="modal-close-text">×</Text>
              </Pressable>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{gap: 20, paddingBlockEnd: 10}}
            >
              <View className="modal-body">
                <View className="auth-field">
                  <Text className="auth-label">Name</Text>
                  <TextInput
                    className="auth-input"
                    value={name}
                    onChangeText={setName}
                    placeholder="Subscription name"
                    placeholderTextColor="rgba(0,0,0,0.4)"
                  />
                </View>

                <View className="auth-field">
                  <Text className="auth-label">Price</Text>
                  <TextInput
                    className="auth-input"
                    value={price}
                    onChangeText={setPrice}
                    placeholder="0.00"
                    placeholderTextColor="rgba(0,0,0,0.4)"
                    keyboardType="decimal-pad"
                  />
                </View>

                <View className="auth-field">
                  <Text className="auth-label">Frequency</Text>
                  <View className="picker-row">
                    {FREQUENCIES.map((option) => {
                      const isActive = frequency === option;
                      return (
                        <Pressable
                          key={option}
                          className={clsx(
                            "picker-option",
                            isActive && "picker-option-active",
                          )}
                          onPress={() => setFrequency(option)}
                        >
                          <Text
                            className={clsx(
                              "picker-option-text",
                              isActive && "picker-option-text-active",
                            )}
                          >
                            {option}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <View className="auth-field">
                  <Text className="auth-label">Category</Text>
                  <View className="category-scroll">
                    {CATEGORIES.map((option) => {
                      const isActive = category === option;
                      return (
                        <Pressable
                          key={option}
                          className={clsx(
                            "category-chip",
                            isActive && "category-chip-active",
                          )}
                          onPress={() => setCategory(option)}
                        >
                          <Text
                            className={clsx(
                              "category-chip-text",
                              isActive && "category-chip-text-active",
                            )}
                          >
                            {option}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <Pressable
                  className={clsx("auth-button", !isValid && "auth-button-disabled")}
                  onPress={handleSubmit}
                  disabled={!isValid}
                >
                  <Text className="auth-button-text">Create Subscription</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};

export default CreateSubscriptionModal;
