import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Image } from "expo-image";
import { router, Stack } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function WelcomeScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={[styles.background, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.container}>
          <Image
            style={styles.logo}
            source={require("../assets/images/BLS-logo.png")}
            contentFit="contain"
          />
          <View style={[styles.heroCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.title, { color: colors.text }]}>{t("welcome")}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {t("welcomeSubtitle")}
            </Text>
          </View>

          <Pressable
            onPress={() => router.push("/login")}
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: colors.primary },
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.primaryButtonText, { color: colors.primaryText }]}>{t("logIn")}</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/signup")}
            style={({ pressed }) => [
              styles.secondaryButton,
              { backgroundColor: colors.card, borderColor: colors.border },
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>{t("signUp")}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 24,
  },
  container: {
    marginHorizontal: 16,
    gap: 16,
  },
  heroCard: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 24,
    gap: 8,
  },
  logo: {
    width: 100,
    height: 40,
  },
  title: {
    fontSize: 40,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  actionsCard: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
  },
  primaryButton: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.9,
  },
});
