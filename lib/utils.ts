export const formatCurrency = (
    value: number | string,
    currency: string = "AED"
): string => {
    try {
        const numberValue =
            typeof value === "string" ? Number(value) : value;

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