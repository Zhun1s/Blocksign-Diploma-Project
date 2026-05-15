import BellIcon from "@/assets/icons/BellIcon";
import ChevronRightIcon from "@/assets/icons/ChevronRightIcon";
import GlobeIcon from "@/assets/icons/GlobeIcon";
import LogOutIcon from "@/assets/icons/LogOutIcon";
import MessageIcon from "@/assets/icons/MessageIcon";
import MoonIcon from "@/assets/icons/MoonIcon";
import PersonIcon from "@/assets/icons/PersonIcon";
import SettingsIcon from "@/assets/icons/SettingsIcon";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
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
  icon,
  onPress,
  border = true,
}: {
  label: string;
  icon: React.ReactNode;
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
        {icon}
        <Text style={[styles.settingText, { color: colors.text }]}>{label}</Text>
      </View>
      <ChevronRightIcon color={colors.textSecondary} />
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

  const initial = user?.fullName?.charAt(0)?.toUpperCase() || "?";

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Image
            style={styles.logo}
            source={require("../../assets/images/BLS-logo.png")}
            contentFit="contain"
          />
          <Pressable onPress={onExitPress} hitSlop={8}>
            <LogOutIcon color={colors.text} size={22} />
          </Pressable>
        </View>
        <View style={styles.profileData}>
          <View style={[styles.profileAvatar, { backgroundColor: colors.avatarBg }]}>
            <Text style={[styles.avatarText, { color: colors.avatarText }]}>
              {initial}
            </Text>
          </View>
          <Text style={[styles.profileName, { color: colors.text }]}>
            {user?.fullName || "User"}
          </Text>
          <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
            {user?.email || ""}
          </Text>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
          {t("general")}
        </Text>
        <View style={[styles.settingsContainer, { backgroundColor: colors.card }]}>
          <SettingRow
            label={t("personalInfo")}
            icon={<PersonIcon color={colors.text} size={20} />}
            onPress={() => router.push("/personal-info")}
          />
          <SettingRow
            label={t("language")}
            icon={<GlobeIcon color={colors.text} size={20} />}
            onPress={() => router.push("/settings/language")}
          />
          <SettingRow
            label={t("mode")}
            icon={<MoonIcon color={colors.text} size={20} />}
            onPress={() => router.push("/settings/mode")}
            border={false}
          />
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
          {t("contentActivity")}
        </Text>
        <View style={[styles.settingsContainer, { backgroundColor: colors.card }]}>
          <SettingRow
            label={t("notifications")}
            icon={<BellIcon color={colors.text} size={20} />}
            onPress={() => router.push("/settings/notifications")}
          />
          <SettingRow
            label={t("feedback")}
            icon={<MessageIcon color={colors.text} size={20} />}
            onPress={() => router.push("/settings/feedback")}
          />
          <SettingRow
            label={t("accountSettings")}
            icon={<SettingsIcon color={colors.text} size={20} />}
            onPress={() => router.push("/settings/account")}
            border={false}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, marginTop: 32, marginHorizontal: 16 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  logo: { width: 100, height: 40 },
  profileData: { alignItems: "center", marginTop: 32 },
  profileAvatar: {
    width: 120, height: 120, borderRadius: 60,
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { fontSize: 48, fontWeight: "700" },
  profileName: { fontSize: 20, fontWeight: "bold", marginTop: 16 },
  profileEmail: { fontSize: 16, marginTop: 8 },
  sectionLabel: { marginTop: 32, marginLeft: 16, fontSize: 14, fontWeight: "600" },
  settingsContainer: {
    flexDirection: "column", marginTop: 16, borderRadius: 16,
    padding: 8, gap: 4,
    shadowColor: "#000", shadowOffset: { width: 1, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 4, elevation: 4,
  },
  settingItem: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingVertical: 14, paddingHorizontal: 8,
  },
  settingItemBorder: { borderBottomWidth: 0.5 },
  settingRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  settingText: { fontSize: 16, fontWeight: "600" },
});
