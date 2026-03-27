import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useColorScheme } from "react-native";

type Mode = "light" | "dark" | "system";

export type ThemeColors = {
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  inputBg: string;
  inputText: string;
  placeholder: string;
  primary: string;
  primaryText: string;
  shadow: string;
  avatarBg: string;
  avatarText: string;
  hover: string;
  link: string;
  accent: string;
};

const lightColors: ThemeColors = {
  background: "#F2F2F2",
  card: "#FFFFFF",
  text: "#000000",
  textSecondary: "#616161",
  textTertiary: "#767676",
  border: "#E5E5E5",
  inputBg: "#FFFFFF",
  inputText: "#111111",
  placeholder: "#9A9A9A",
  primary: "#111111",
  primaryText: "#FFFFFF",
  shadow: "#000000",
  avatarBg: "#DEDEDE",
  avatarText: "#888888",
  hover: "#F5F5F5",
  link: "#444444",
  accent: "#007AFF",
};

const darkColors: ThemeColors = {
  background: "#121212",
  card: "#1E1E1E",
  text: "#FFFFFF",
  textSecondary: "#AAAAAA",
  textTertiary: "#888888",
  border: "#333333",
  inputBg: "#2A2A2A",
  inputText: "#EEEEEE",
  placeholder: "#666666",
  primary: "#FFFFFF",
  primaryText: "#000000",
  shadow: "#000000",
  avatarBg: "#333333",
  avatarText: "#AAAAAA",
  hover: "#2A2A2A",
  link: "#AAAAAA",
  accent: "#0A84FF",
};

type ThemeState = {
  mode: Mode;
  colors: ThemeColors;
  isDark: boolean;
  setMode: (mode: Mode) => void;
};

const ThemeContext = createContext<ThemeState>({
  mode: "light",
  colors: lightColors,
  isDark: false,
  setMode: () => {},
});

const THEME_KEY = "app_theme_mode";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<Mode>("light");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((stored) => {
      if (stored === "light" || stored === "dark" || stored === "system") {
        setModeState(stored);
      }
      setLoaded(true);
    });
  }, []);

  const setMode = (m: Mode) => {
    setModeState(m);
    AsyncStorage.setItem(THEME_KEY, m);
  };

  const isDark =
    mode === "dark" || (mode === "system" && systemScheme === "dark");
  const colors = isDark ? darkColors : lightColors;

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={{ mode, colors, isDark, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
