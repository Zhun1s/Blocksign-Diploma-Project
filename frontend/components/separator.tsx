import { useTheme } from "@/contexts/ThemeContext";
import React from "react";
import { View } from "react-native";

export function Separator() {
  const { colors } = useTheme();
  return <View style={{ height: 1, backgroundColor: colors.border, marginTop: 12 }} />;
}
