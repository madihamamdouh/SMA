import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import UpcomingSubscriptionCard from './UpcomingSubscriptionCard';



const UpcomingModal = ({ visible, onClose, subscriptions }: UpcomingModalProps) => {
     const allUpcoming = useMemo(() => {
          const now = dayjs();
          return subscriptions
               .filter((sub) => sub.status === "active" && dayjs(sub.renewalDate).isAfter(now))
               .sort((a, b) => dayjs(a.renewalDate).diff(dayjs(b.renewalDate)));
     }, [subscriptions]);


     return (
          <Modal visible={visible} transparent animationType='slide' onRequestClose={onClose}>
               <Pressable className='modal-overlay' onPress={onClose}>
                    <Pressable className='modal-container' onPress={(e) => e.stopPropagation()}>
                         <View className='modal-header'>
                              <Text className='modal-title'> Upcoming Renewal</Text>
                              <Pressable className="modal-close" onPress={onClose}>
                                   <Text className="modal-close-text">×</Text>
                              </Pressable>
                         </View>
                         <FlatList
                              data={allUpcoming}
                              keyExtractor={(item) => item.id}
                              renderItem={({ item }) => (
                                   <UpcomingSubscriptionCard
                                        daysLeft={dayjs(item.renewalDate).diff(dayjs(), "days")}

                                        fullWidth
                                        {...item}
                                   />
                              )}
                              ItemSeparatorComponent={() => <View className='h-4' />}
                              showsVerticalScrollIndicator={false}
                              ListEmptyComponent={() => (
                                   <Text className='home-empty-state'> No upcoming renewals.</Text>
                              )}
                              contentContainerStyle={{ paddingVertical: 10 }}
                         />
                    </Pressable>

               </Pressable>
          </Modal>
     )
}
export default UpcomingModal