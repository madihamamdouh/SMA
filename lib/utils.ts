import dayjs from "dayjs";

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
    return parseDate.isValid() ? parseDate.format("MM-DD-YYYY") : "Not Provided";
};

export const formatStatusLabel = (value?: string): string => {
    if(!value) return "Unknown";
    return value.charAt(0).toUpperCase() + value.slice(1);
};