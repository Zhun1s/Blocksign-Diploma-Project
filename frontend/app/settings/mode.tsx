import ArrowLeftIcon from "@/assets/icons/ArrowLeftIcon";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { router, Stack } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function ModeScreen() {
  const { mode, setMode, colors } = useTheme();
  const { t } = useLanguage();

  const MODES = [
    { key: "light" as const, label: t("light"), icon: "☀️" },
    { key: "dark" as const, label: t("dark"), icon: "🌙" },
    { key: "system" as const, label: t("system"), icon: "⚙️" },
  ];

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
            <Text style={[styles.pageTitle, { color: colors.text }]}>{t("mode")}</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card }]}>
            {MODES.map((m, idx) => (
              <Pressable
                key={m.key}
                onPress={() => setMode(m.key)}
                style={[
                  styles.row,
                  idx < MODES.length - 1 && {
                    borderBottomWidth: 0.5,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <View style={styles.rowLeft}>
                  <Text style={{ fontSize: 20 }}>{m.icon}</Text>
                  <Text style={[styles.rowText, { color: colors.text }]}>
                    {m.label}
                  </Text>
                </View>
                <View
                  style={[
                    styles.radio,
                    mode === m.key && styles.radioSelected,
                  ]}
                >
                  {mode === m.key && <View style={styles.radioInner} />}
                </View>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.hint, { color: colors.textSecondary }]}>
            {t("themeHint")}
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
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  rowText: { fontSize: 16, fontWeight: "600" },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#CCCCCC",
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: { borderColor: "#111111" },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#111111",
  },
  hint: { marginTop: 16, marginLeft: 8, fontSize: 13 },
});
