import ArrowLeftIcon from "@/assets/icons/ArrowLeftIcon";
import ArrowRightIcon from "@/assets/icons/ArrowRightIcon";
import { useAuth } from "@/contexts/AuthContext";
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
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingItem,
        border && styles.settingItemBorder,
        pressed && styles.settingItemHover,
      ]}
    >
      <View style={styles.settingRow}>
        <ArrowLeftIcon />
        <Text style={styles.settingText}>{label}</Text>
      </View>
      <ArrowRightIcon />
    </Pressable>
  );
}

export default function Profile() {
  const { user, logout } = useAuth();

  const onExitPress = () => {
    Alert.alert("Exit account", "Are you sure you want to exit?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Exit",
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

  const comingSoon = (feature: string) => {
    Alert.alert(feature, "This feature is coming soon.");
  };

  const initial = user?.fullName?.charAt(0)?.toUpperCase() || "?";

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.background}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Image
            style={styles.logo}
            source={require("../../assets/images/BLS-logo.png")}
            contentFit="contain"
          />
          <Pressable onPress={onExitPress} hitSlop={8}>
            <ArrowLeftIcon />
          </Pressable>
        </View>
        <View style={styles.profileData}>
          <View style={styles.profileAvatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <Text style={styles.profileName}>{user?.fullName || "User"}</Text>
          <Text style={styles.profileEmail}>{user?.email || ""}</Text>
        </View>

        <Text style={styles.sectionLabel}>General</Text>
        <View style={styles.settingsContainer}>
          <SettingRow label="Personal Info" onPress={showPersonalInfo} />
          <SettingRow
            label="Language"
            onPress={() => comingSoon("Language")}
          />
          <SettingRow
            label="Mode"
            onPress={() => comingSoon("Mode")}
            border={false}
          />
        </View>

        <Text style={styles.sectionLabel}>Content & Activity</Text>
        <View style={styles.settingsContainer}>
          <SettingRow
            label="Notifications"
            onPress={() => comingSoon("Notifications")}
          />
          <SettingRow
            label="Feedback"
            onPress={() => comingSoon("Feedback")}
          />
          <SettingRow
            label="Account Settings"
            onPress={() => comingSoon("Account Settings")}
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
