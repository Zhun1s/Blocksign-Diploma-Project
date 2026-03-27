import ArrowLeftIcon from "@/assets/icons/ArrowLeftIcon";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { router, Stack } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function SignupScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { colors } = useTheme();
  const { t } = useLanguage();

  const onSignup = async () => {
    if (!fullName || !email || !password) {
      Alert.alert(t("error"), t("fillAllFields"));
      return;
    }
    setLoading(true);
    try {
      await register(email, password, fullName);
      router.replace("/(tabs)");
    } catch (e: any) {
      Alert.alert(t("registrationFailed"), e.message || t("tryAgain"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={[styles.background, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()}>
              <ArrowLeftIcon color={colors.text} />
            </Pressable>
            <Text style={[styles.pageTitle, { color: colors.text }]}>{t("signUp")}</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.label, { color: colors.text }]}>{t("fullName")}</Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your name"
              placeholderTextColor={colors.placeholder}
              style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.inputText }]}
            />

            <Text style={[styles.label, styles.sectionSpacing, { color: colors.text }]}>{t("email")}</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
              style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.inputText }]}
            />

            <Text style={[styles.label, styles.sectionSpacing, { color: colors.text }]}>{t("password")}</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Create password"
              placeholderTextColor={colors.placeholder}
              secureTextEntry
              style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.inputText }]}
            />
          </View>

          <Pressable
            onPress={onSignup}
            disabled={loading}
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: colors.primary },
              pressed && styles.pressed,
            ]}
          >
            {loading ? (
              <ActivityIndicator color={colors.primaryText} />
            ) : (
              <Text style={[styles.primaryButtonText, { color: colors.primaryText }]}>{t("createAccount")}</Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => router.push("/login")}
            style={styles.linkRow}
          >
            <Text style={[styles.linkText, { color: colors.textTertiary }]}>{t("hasAccount")}</Text>
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
    paddingBottom: 24,
  },
  container: {
    marginTop: 100,
    marginHorizontal: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: "700",
  },
  card: {
    marginTop: 16,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
  input: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
  },
  sectionSpacing: {
    marginTop: 14,
  },
  primaryButton: {
    marginTop: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.9,
  },
  linkRow: {
    marginTop: 14,
    alignItems: "center",
  },
  linkText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
