import ArrowLeftIcon from "@/assets/icons/ArrowLeftIcon";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { router, Stack } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function AccountSettingsScreen() {
  const { user, logout } = useAuth();
  const { colors } = useTheme();
  const { t } = useLanguage();

  const onDeleteAccount = () => {
    Alert.alert(
      t("deleteAccount"),
      t("deleteAccountConfirm"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("delete"),
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/welcome");
          },
        },
      ],
    );
  };

  const onChangePassword = () => {
    Alert.alert(t("changePassword"), t("comingSoon"));
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
            <Text style={[styles.pageTitle, { color: colors.text }]}>{t("account")}</Text>
          </View>

          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{t("account")}</Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={[styles.row, styles.rowBorder, { borderBottomColor: colors.border }]}>
              <Text style={[styles.rowLabel, { color: colors.text }]}>{t("email")}</Text>
              <Text style={[styles.rowValue, { color: colors.textSecondary }]}>{user?.email || "—"}</Text>
            </View>
            <Pressable
              onPress={onChangePassword}
              style={({ pressed }) => [
                styles.row,
                pressed && [styles.rowPressed, { backgroundColor: colors.hover }],
              ]}
            >
              <Text style={[styles.rowLabel, { color: colors.text }]}>{t("changePassword")}</Text>
              <Text style={[styles.rowAction, { color: colors.link }]}>{t("change")}</Text>
            </Pressable>
          </View>

          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{t("dangerZone")}</Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Pressable
              onPress={onDeleteAccount}
              style={({ pressed }) => [
                styles.row,
                pressed && [styles.rowPressed, { backgroundColor: colors.hover }],
              ]}
            >
              <Text style={[styles.rowLabel, { color: "#FF3B30" }]}>
                {t("deleteAccount")}
              </Text>
            </Pressable>
          </View>

          <Pressable
            onPress={async () => {
              await logout();
              router.replace("/welcome");
            }}
            style={({ pressed }) => [
              styles.logoutButton,
              { borderColor: "#FF3B30" },
              pressed && { opacity: 0.9 },
            ]}
          >
            <Text style={styles.logoutText}>{t("logOut")}</Text>
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
    paddingVertical: 16,
  },
  rowBorder: { borderBottomWidth: 0.5 },
  rowPressed: {},
  rowLabel: { fontSize: 16, fontWeight: "600" },
  rowValue: { fontSize: 16 },
  rowAction: { fontSize: 14, fontWeight: "600" },
  logoutButton: {
    marginTop: 32,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  logoutText: { fontSize: 16, fontWeight: "600", color: "#FF3B30" },
});
