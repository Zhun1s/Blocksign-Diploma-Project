import { useTheme } from "@/contexts/ThemeContext";

export function useIconColor() {
  const { colors } = useTheme();
  return colors.text;
}
