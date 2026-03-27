import ArrowLeftIcon from "@/assets/icons/ArrowLeftIcon";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { router, Stack } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

export default function NotificationsScreen() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [taskUpdates, setTaskUpdates] = useState(true);
  const [ndaAlerts, setNdaAlerts] = useState(true);
  const [newMembers, setNewMembers] = useState(false);
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
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()}>
              <ArrowLeftIcon color={colors.text} />
            </Pressable>
            <Text style={[styles.pageTitle, { color: colors.text }]}>{t("notifications")}</Text>
          </View>

          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{t("notifications")}</Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={[styles.row, styles.rowBorder, { borderBottomColor: colors.border }]}>
              <Text style={[styles.rowText, { color: colors.text }]}>{t("enableNotifications")}</Text>
              <Switch value={pushEnabled} onValueChange={setPushEnabled} />
            </View>
            <View style={[styles.row, styles.rowBorder, { borderBottomColor: colors.border }]}>
              <Text style={[styles.rowText, { color: colors.text }]}>{t("taskUpdates")}</Text>
              <Switch value={taskUpdates} onValueChange={setTaskUpdates} />
            </View>
            <View style={[styles.row, styles.rowBorder, { borderBottomColor: colors.border }]}>
              <Text style={[styles.rowText, { color: colors.text }]}>{t("ndaAlerts")}</Text>
              <Switch value={ndaAlerts} onValueChange={setNdaAlerts} />
            </View>
            <View style={styles.row}>
              <Text style={[styles.rowText, { color: colors.text }]}>{t("newMembers")}</Text>
              <Switch value={newMembers} onValueChange={setNewMembers} />
            </View>
          </View>

          <Text style={[styles.hint, { color: colors.textTertiary }]}>
            {t("notifHint")}
          </Text>
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
  sectionLabel: {
    marginTop: 24,
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
  },
  card: {
    marginTop: 12,
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },
  rowBorder: { borderBottomWidth: 0.5 },
  rowText: { fontSize: 16, fontWeight: "600" },
  hint: { marginTop: 16, marginLeft: 8, fontSize: 13 },
});
