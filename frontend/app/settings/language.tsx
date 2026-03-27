import ArrowLeftIcon from "@/assets/icons/ArrowLeftIcon";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { router, Stack } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const LANGUAGES = [
  { code: "en" as const, label: "English" },
  { code: "ru" as const, label: "Русский" },
  { code: "kz" as const, label: "Қазақша" },
];

export default function LanguageScreen() {
  const { lang, setLang, t } = useLanguage();
  const { colors } = useTheme();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()}>
              <ArrowLeftIcon color={colors.text} />
            </Pressable>
            <Text style={[styles.pageTitle, { color: colors.text }]}>{t("language")}</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card }]}>
            {LANGUAGES.map((l, idx) => (
              <Pressable
                key={l.code}
                onPress={() => setLang(l.code)}
                style={[
                  styles.row,
                  idx < LANGUAGES.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: colors.border },
                ]}
              >
                <Text style={[styles.rowText, { color: colors.text }]}>{l.label}</Text>
                <View
                  style={[
                    styles.radio,
                    { borderColor: colors.border },
                    lang === l.code && { borderColor: colors.primary },
                  ]}
                >
                  {lang === l.code && (
                    <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                  )}
                </View>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.hint, { color: colors.textTertiary }]}>
            {t("languageHint")}
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 24 },
  container: { marginTop: 100, marginHorizontal: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  pageTitle: { fontSize: 32, fontWeight: "700" },
  card: { marginTop: 16, borderRadius: 16, paddingHorizontal: 16 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  rowText: { fontSize: 16, fontWeight: "600" },
  radio: {
    width: 24, height: 24, borderRadius: 12, borderWidth: 2,
    alignItems: "center", justifyContent: "center",
  },
  radioInner: { width: 12, height: 12, borderRadius: 6 },
  hint: { marginTop: 16, marginLeft: 8, fontSize: 13 },
});
