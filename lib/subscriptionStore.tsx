import { create } from 'zustand';
import { api } from './api';
import {syncRenewalReminder} from './notifications';
interface SubscriptionStore {
     subscriptions: Subscription[];
     isLoading: boolean;
     error: string | null;
     fetchSubscriptions: (token: string) => Promise<void>;
     addSubscription: (token: string, subscription: Partial<Subscription>) => Promise<void>;
     setSubscriptions: (subscriptions: Subscription[]) => void;
     updateSubscription: (token: string, id: string, data: Partial<Subscription>) => Promise<void>;
     deleteSubscription: (token: string, id: string) => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionStore>((set, get) => ({
     subscriptions: [],
     isLoading: false,
     error: null,

     fetchSubscriptions: async (token) => {
          set({ isLoading: true, error: null });
          try {
               const data = await api.getSubscriptions(token);
               set({ subscriptions: data, isLoading: false })
               syncRenewalReminder(data).catch(console.warn); // Sync notifications after fetching subscriptions
          } catch (err) {
               set({ error: (err as Error).message, isLoading: false });
          }
     },
     addSubscription: async (token, subscription) => {
          const created = await api.createSubscription(token, subscription);
          set((state) => ({ subscriptions: [created, ...state.subscriptions] }));
          syncRenewalReminder(get().subscriptions).catch(console.warn); // Sync notifications after adding a subscription
     },
     setSubscriptions: (subscriptions) => set({ subscriptions }),

     updateSubscription: async (token, id, data) => {
          const updated = await api.updateSubscription(token, id, data);
          set((state) => ({
               subscriptions: state.subscriptions.map((sub) =>
                    sub.id === id ? updated : sub
               ),
          }));
          syncRenewalReminder(get().subscriptions).catch(console.warn); // Sync notifications after updating a subscription
     },
     deleteSubscription: async (token, id) => {
          await api.deleteSubscription(token, id);
          set((state) => ({
               subscriptions: state.subscriptions.filter((sub) => sub.id !== id),

          }));
          syncRenewalReminder(get().subscriptions).catch(console.warn); // Sync notifications after deleting a subscription
     },
}));