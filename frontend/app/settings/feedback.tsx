import ArrowLeftIcon from "@/assets/icons/ArrowLeftIcon";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { router, Stack } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function FeedbackScreen() {
  const [message, setMessage] = useState("");
  const { colors } = useTheme();
  const { t } = useLanguage();

  const onSubmit = () => {
    if (!message.trim()) {
      Alert.alert(t("error"), t("enterFeedback"));
      return;
    }
    Alert.alert(t("thankYou"), t("feedbackSubmitted"), [
      { text: "OK", onPress: () => router.back() },
    ]);
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
            <Text style={[styles.pageTitle, { color: colors.text }]}>{t("feedback")}</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.label, { color: colors.text }]}>
              {t("howImprove")}
            </Text>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder={t("tellUs")}
              placeholderTextColor={colors.placeholder}
              style={[styles.input, { borderColor: colors.border, color: colors.inputText, backgroundColor: colors.inputBg }]}
              multiline
              textAlignVertical="top"
            />
          </View>

          <Pressable
            onPress={onSubmit}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: colors.primary },
              pressed && { opacity: 0.9 },
            ]}
          >
            <Text style={[styles.buttonText, { color: colors.primaryText }]}>{t("submitFeedback")}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  container: { marginTop: 100, marginHorizontal: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  pageTitle: { fontSize: 32, fontWeight: "700" },
  card: {
    marginTop: 16,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  label: { fontSize: 16, fontWeight: "600" },
  input: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 140,
  },
  button: {
    marginTop: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  buttonText: { fontSize: 16, fontWeight: "600" },
});
