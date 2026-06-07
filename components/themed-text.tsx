import { Text, type TextProps } from "react-native";
import { colors } from "@/constants/theme";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: "default" | "title" | "subtitle" | "link";
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  ...rest
}: ThemedTextProps) {
  const color = lightColor || colors.foreground;

  return (
    <Text
      {...rest}
      style={[
        { color },
        type === "title" && { fontSize: 32, fontWeight: "bold" },
        type === "subtitle" && { fontSize: 20, fontWeight: "600" },
        type === "link" && { color: colors.accent },
        style,
      ]}
    />
  );
}
