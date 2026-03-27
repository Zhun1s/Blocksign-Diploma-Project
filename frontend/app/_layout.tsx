import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="welcome" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="signup" options={{ headerShown: false }} />
            <Stack.Screen name="create-project" options={{ headerShown: false }} />
            <Stack.Screen name="join" options={{ headerShown: false }} />
            <Stack.Screen name="personal-info" options={{ headerShown: false }} />
          </Stack>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
