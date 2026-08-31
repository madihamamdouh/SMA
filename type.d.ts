import { ImageSourcePropType } from "react-native";


declare global {
    interface AppTab {
        name: string;
        title: string;
        icon: string;
    }

    interface TabIconProps {
        focused: boolean;
        icon: ImageSourcePropType;
    }

    interface Subscription {
        id: string;
        icon: string;
        name: string;
        plan?: string;
        category?: string;
        paymentMethod?: string;
        status?: string;
        startDate?: string;
        price: number;
        currency?: string;
        billing: string;
        renewalDate?: string;
        createdAt?: string;
        color?: string;
    }

    interface SubscriptionCardProps extends Omit<Subscription, "id"> {
        expanded: boolean;
        onPress: () => void;
        onCancelPress?: () => void;
        isCancelling?: boolean;
    }

    interface UpcomingSubscriptionProps {
        id: string;
        icon?: string;
        name: string;
        price: number;
        currency?: string;
        daysLeft: number;
        fullWidth?:boolean;
    }
    interface CreateSubscriptionModalProps {
     visible: boolean;
     onClose: () => void;
     onSubmit: (subscription: Subscription) => void;
}

    interface UpcomingSubscriptionCardProps
        extends Omit<UpcomingSubscription, "id"> {}

    interface ListHeadingProps {
        title: string;
    }

    interface WeeklyBarChartProps {
        data: BarChartPoint[];
    }
    interface WeeklyBalancePoint{
     day: string;
     amount: number;
    }
    interface BarChartPoint{
     label: string;
     amount: number;
    }
    interface ListHeadingProps{
     title: string;
     onViewAll?: ()=> void;
    }
    interface UpcomingModalProps{
     visible: boolean;
     onClose:()=> void;
     subscriptions: Subscription[];
    }
}

export { };
