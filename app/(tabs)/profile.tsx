import ArrowLeftIcon from "@/assets/icons/ArrowLeftIcon";
import ArrowRightIcon from "@/assets/icons/ArrowRightIcon";
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

export default function Profile() {
  const onExitPress = () => {
    Alert.alert("Exit account", "Are you sure you want to exit?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Exit",
        style: "destructive",
        onPress: () => router.replace("/welcome"),
      },
    ]);
  };

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
          <View style={styles.profileAvatar}></View>
          <Text style={styles.profileName}>John Doe</Text>
          <Text style={styles.profileEmail}>john.doe@example.com</Text>
        </View>
        <Text
          style={{
            marginTop: 32,
            marginLeft: 16,
            fontSize: 14,
            fontWeight: "600",
            color: "#6E6E6E",
          }}
        >
          General
        </Text>
        <View style={styles.settingsContainer}>
          <Pressable
            onPress={() => undefined}
            style={({ hovered, pressed }) => [
              styles.settingItem,
              styles.settingItemBorder,
              (hovered || pressed) && styles.settingItemHover,
            ]}
          >
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <ArrowLeftIcon />
              <Text style={styles.settingText}>Personal Info</Text>
            </View>
            <ArrowRightIcon />
          </Pressable>
          <Pressable
            onPress={() => undefined}
            style={({ hovered, pressed }) => [
              styles.settingItem,
              styles.settingItemBorder,
              (hovered || pressed) && styles.settingItemHover,
            ]}
          >
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <ArrowLeftIcon />
              <Text style={styles.settingText}>Language</Text>
            </View>
            <ArrowRightIcon />
          </Pressable>
          <Pressable
            onPress={() => undefined}
            style={({ hovered, pressed }) => [
              styles.settingItem,
              (hovered || pressed) && styles.settingItemHover,
            ]}
          >
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <ArrowLeftIcon />
              <Text style={styles.settingText}>Mode</Text>
            </View>
            <ArrowRightIcon />
          </Pressable>
        </View>
        <Text
          style={{
            marginTop: 32,
            marginLeft: 16,
            fontSize: 14,
            fontWeight: "600",
            color: "#6E6E6E",
          }}
        >
          Content & Activity
        </Text>
        <View style={styles.settingsContainer}>
          <Pressable
            onPress={() => undefined}
            style={({ hovered, pressed }) => [
              styles.settingItem,
              styles.settingItemBorder,
              (hovered || pressed) && styles.settingItemHover,
            ]}
          >
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <ArrowLeftIcon />
              <Text style={styles.settingText}>Notifications</Text>
            </View>
            <ArrowRightIcon />
          </Pressable>
          <Pressable
            onPress={() => undefined}
            style={({ hovered, pressed }) => [
              styles.settingItem,
              styles.settingItemBorder,
              (hovered || pressed) && styles.settingItemHover,
            ]}
          >
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <ArrowLeftIcon />
              <Text style={styles.settingText}>Feedback</Text>
            </View>
            <ArrowRightIcon />
          </Pressable>
          <Pressable
            onPress={() => undefined}
            style={({ hovered, pressed }) => [
              styles.settingItem,
              (hovered || pressed) && styles.settingItemHover,
            ]}
          >
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <ArrowLeftIcon />
              <Text style={styles.settingText}>Account Settings</Text>
            </View>
            <ArrowRightIcon />
          </Pressable>
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
    fontFamily: "Inter",
    flex: 1,
    marginTop: 32,
    marginHorizontal: 16,
  },

  headerRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  logo: {
    width: 100,
    height: 40,
  },

  profileData: {
    display: "flex",
    alignItems: "center",
    marginTop: 32,
  },

  profileAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#DEDEDE",
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

  settingsContainer: {
    display: "flex",
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
    display: "flex",
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

  settingText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
