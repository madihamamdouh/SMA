import { IconKey, icons } from "@/constants/icons";
import dayjs from "dayjs";

export const resolveIcon = (key?: string) => {

     if (key && key in icons) {
          return icons[key as IconKey];
     }
     return icons.wallet;
}
export const CATEGORY_COLORS: Record<string, string> = {
     'Entertainment': '#5b8def',
     'AI Tools': '#2fb392',
     'Developer Tools': '#a78bda',
     'Design': '#e8b04b',
     'Productivity': '#e6685d',
     'Other': '#9aa5c0',
};

export const resolveColor = (category?: string) => {
     if (category && category in CATEGORY_COLORS) {

          return CATEGORY_COLORS[category];
     }
     return CATEGORY_COLORS["Other"];
}

export const guessIconKey = (name: string): string => {
     const normalized = name.toLowerCase();
     const match = (Object.keys(icons) as IconKey[]).find((key) => normalized.includes(key)
     );
     return match ?? "wallet";
};
export const formatCurrency = (
     value: number,
     currency: string = "AED"
): string => {
     try {
          const numberValue = value;

          // Handle invalid numbers
          if (isNaN(numberValue)) {
               throw new Error("Invalid number");
          }

          return new Intl.NumberFormat("en-AE", {
               style: "currency",
               currency,
               minimumFractionDigits: 2,
               maximumFractionDigits: 2,
          }).format(numberValue);

     } catch (error) {
          console.error("Currency formatting failed:", error);

          // Fallback formatting
          return `د.إ ${Number(value || 0).toFixed(2)}`;
     }
};

export const formatSubscriptionDateTime = (value?: string): string => {
     if (!value) return "Not Provided";
     const parseDate = dayjs(value);
     return parseDate.isValid() ? parseDate.format("D MMM YYYY") : "Not Provided";
};

export const formatStatusLabel = (value?: string): string => {
     if (!value) return "Unknown";
     return value.charAt(0).toUpperCase() + value.slice(1);
};
export const calculateMonthlySpend = (subscriptions: Subscription[]): number => {
     return subscriptions
          .filter((sub) => sub.status === 'active')
          .reduce((total, sub) => {
               const monthlyPrice = sub.billing === 'Yearly' ? sub.price / 12 : sub.price;
               return total + monthlyPrice;
          }, 0);
};

export const getNextRenewalDate = (subscriptions: Subscription[]): string | null => {
     const now = dayjs();
     const upcoming = subscriptions
          .filter((sub) => sub.status === "active" && dayjs(sub.renewalDate).isAfter(now))
          .sort((a, b) => dayjs(a.renewalDate).diff(dayjs(b.renewalDate)));
     return upcoming.length > 0 ? upcoming[0].renewalDate ?? null : null;
}   