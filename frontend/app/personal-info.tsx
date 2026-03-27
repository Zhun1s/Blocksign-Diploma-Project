import ArrowLeftIcon from "@/assets/icons/ArrowLeftIcon";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { router, Stack } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function PersonalInfoScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { t } = useLanguage();

  const initial = user?.fullName?.charAt(0)?.toUpperCase() || "?";
  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

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
            <Text style={[styles.pageTitle, { color: colors.text }]}>{t("personalInfo")}</Text>
          </View>

          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: colors.avatarBg }]}>
              <Text style={[styles.avatarText, { color: colors.avatarText }]}>{initial}</Text>
            </View>
            <Text style={[styles.nameText, { color: colors.text }]}>{user?.fullName || "User"}</Text>
            <Text style={[styles.emailSubtext, { color: colors.textSecondary }]}>{user?.email || ""}</Text>
          </View>

          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{t("accountDetails")}</Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <InfoRow label={t("fullName")} value={user?.fullName || ""} colors={colors} />
            <InfoRow label={t("email")} value={user?.email || ""} colors={colors} />
            <InfoRow label={t("role")} value={user?.role || "member"} colors={colors} />
            <InfoRow label={t("joinedDate")} value={joinedDate} border={false} colors={colors} />
          </View>

          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{t("security")}</Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <InfoRow
              label={t("password")}
              value="••••••••"
              border={false}
              colors={colors}
            />
          </View>
        </View>
      </ScrollView>
    </>
  );
}

function InfoRow({
  label,
  value,
  border = true,
  colors,
}: {
  label: string;
  value: string;
  border?: boolean;
  colors: any;
}) {
  return (
    <View style={[styles.infoRow, border && [styles.infoRowBorder, { borderBottomColor: colors.border }]]}>
      <Text style={[styles.infoLabel, { color: colors.text }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.textSecondary }]}>{value || "—"}</Text>
    </View>
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
  avatarContainer: {
    alignItems: "center",
    marginTop: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "700",
  },
  nameText: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 12,
  },
  emailSubtext: {
    fontSize: 15,
    marginTop: 4,
  },
  sectionLabel: {
    marginTop: 28,
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
  },
  card: {
    marginTop: 12,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  infoRowBorder: {
    borderBottomWidth: 0.5,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 16,
  },
});
