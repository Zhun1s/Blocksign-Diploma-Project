import ArrowLeftIcon from "@/assets/icons/ArrowLeftIcon";
import ArrowRightIcon from "@/assets/icons/ArrowRightIcon";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Image } from "expo-image";
import { router } from "expo-router";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

function SettingRow({
  label,
  onPress,
  border = true,
}: {
  label: string;
  onPress: () => void;
  border?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingItem,
        border && [styles.settingItemBorder, { borderBottomColor: colors.border }],
        pressed && { backgroundColor: colors.hover },
      ]}
    >
      <View style={styles.settingRow}>
        <ArrowLeftIcon color={colors.text} />
        <Text style={[styles.settingText, { color: colors.text }]}>{label}</Text>
      </View>
      <ArrowRightIcon color={colors.textSecondary} />
    </Pressable>
  );
}

export default function Profile() {
  const { user, logout } = useAuth();
  const { colors } = useTheme();
  const { t } = useLanguage();

  const onExitPress = () => {
    Alert.alert(t("exitAccount"), t("exitConfirm"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("exit"),
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/welcome");
        },
      },
    ]);
  };

  const showPersonalInfo = () => {
    router.push("/personal-info");
  };

  const openLanguage = () => router.push("/settings/language");
  const openMode = () => router.push("/settings/mode");
  const openNotifications = () => router.push("/settings/notifications");
  const openFeedback = () => router.push("/settings/feedback");
  const openAccount = () => router.push("/settings/account");

  const initial = user?.fullName?.charAt(0)?.toUpperCase() || "?";

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Image
            style={styles.logo}
            source={require("../../assets/images/BLS-logo.png")}
            contentFit="contain"
          />
          <Pressable onPress={onExitPress} hitSlop={8}>
            <ArrowLeftIcon color={colors.text} />
          </Pressable>
        </View>
        <View style={styles.profileData}>
          <View style={[styles.profileAvatar, { backgroundColor: colors.avatarBg }]}>
            <Text style={[styles.avatarText, { color: colors.avatarText }]}>{initial}</Text>
          </View>
          <Text style={[styles.profileName, { color: colors.text }]}>{user?.fullName || "User"}</Text>
          <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{user?.email || ""}</Text>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{t("general")}</Text>
        <View style={[styles.settingsContainer, { backgroundColor: colors.card }]}>
          <SettingRow label={t("personalInfo")} onPress={showPersonalInfo} />
          <SettingRow label={t("language")} onPress={openLanguage} />
          <SettingRow label={t("mode")} onPress={openMode} border={false} />
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{t("contentActivity")}</Text>
        <View style={[styles.settingsContainer, { backgroundColor: colors.card }]}>
          <SettingRow label={t("notifications")} onPress={openNotifications} />
          <SettingRow label={t("feedback")} onPress={openFeedback} />
          <SettingRow
            label={t("accountSettings")}
            onPress={openAccount}
            border={false}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#F2F2F2",
  },
  container: {
    flex: 1,
    marginTop: 32,
    marginHorizontal: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    width: 100,
    height: 40,
  },
  profileData: {
    alignItems: "center",
    marginTop: 32,
  },
  profileAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#DEDEDE",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 48,
    fontWeight: "700",
    color: "#888",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
  },
  profileEmail: {
    fontSize: 16,
    color: "#616161",
    marginTop: 8,
  },
  sectionLabel: {
    marginTop: 32,
    marginLeft: 16,
    fontSize: 14,
    fontWeight: "600",
    color: "#6E6E6E",
  },
  settingsContainer: {
    flexDirection: "column",
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 8,
    gap: 4,
    shadowColor: "#000000",
    shadowOffset: { width: 1, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  settingItemBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E5E5",
  },
  settingItemHover: {
    backgroundColor: "#F5F5F5",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  settingText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
