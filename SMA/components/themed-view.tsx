import { View, type ViewProps } from "react-native";
import { colors } from "@/constants/theme";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  ...otherProps
}: ThemedViewProps) {
  const backgroundColor = lightColor || colors.background;

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
