import { guessIconKey } from "@/lib/utils";
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
   'Entertainment' , 'AI Tools' , 
   'Developer Tools' , 'Design' , 
   'Productivity' , 'Other'
] as const;
const FREQUENCIES = ["Monthly", "Yearly"] as const;
const PAYMENT_METHOD = ["Credit Card", "Paypal", "Apple pay", "Bank Transfer"] as const;
const CATEGORY_COLORS: Record<Category, string> = {
     'Entertainment': '#EB7D00',
     'AI Tools': '#b8d4e3',
     'Developer Tools': '#11bfbf',
     'Design': '#f5c542',
     'Productivity': '#95e1d3',
     'Other': '#a6b9f5',
};

type Frequency = (typeof FREQUENCIES)[number];
type Category = (typeof CATEGORIES)[number];
type PaymentMethod = (typeof PAYMENT_METHOD) [number];


const CreateSubscriptionModal = ({
     visible,
     onClose,
     onSubmit,
}: CreateSubscriptionModalProps) => {
     const [name, setName] = useState("");
     const [price, setPrice] = useState("");
     const [frequency, setFrequency] = useState<Frequency>("Monthly");
     const [category, setCategory] = useState<Category>("Other");
     const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Credit Card");
     const resetForm = () => {
          setName("");
          setPrice("");
          setFrequency("Monthly");
          setCategory("Other");
          setPaymentMethod("Credit Card")
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
               icon: guessIconKey(trimmedName),
               name: trimmedName,
               price: parsedPrice,
               currency: "AED",
               billing: frequency,
               category,
               status: "active",
               startDate,
               renewalDate,
               color: CATEGORY_COLORS[category],
               paymentMethod
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
                                   contentContainerStyle={{ gap: 20, paddingBlockEnd: 10 }}
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
                                        <View className="auth-field">
                                             <Text className="auth-label">Payment Method </Text>
                                             <View className="category-scroll">
                                                  {PAYMENT_METHOD.map((option) => {
                                                       const isActive = paymentMethod === option;
                                                       return (
                                                            <Pressable
                                                                 key={option}
                                                                 className={clsx(
                                                                      "picker-option",
                                                                      isActive && "picker-option-active",
                                                                 )}
                                                                 onPress={() => setPaymentMethod(option)}
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
