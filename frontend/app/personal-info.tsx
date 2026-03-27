import ArrowLeftIcon from "@/assets/icons/ArrowLeftIcon";
import { useAuth } from "@/contexts/AuthContext";
import { router, Stack } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

function InfoRow({
  label,
  value,
  border = true,
}: {
  label: string;
  value: string;
  border?: boolean;
}) {
  return (
    <View style={[styles.infoRow, border && styles.infoRowBorder]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || "—"}</Text>
    </View>
  );
}

export default function PersonalInfoScreen() {
  const { user } = useAuth();

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
        style={styles.background}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()}>
              <ArrowLeftIcon />
            </Pressable>
            <Text style={styles.pageTitle}>Personal Info</Text>
          </View>

          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
            <Text style={styles.nameText}>{user?.fullName || "User"}</Text>
            <Text style={styles.emailSubtext}>{user?.email || ""}</Text>
          </View>

          <Text style={styles.sectionLabel}>Account Details</Text>
          <View style={styles.card}>
            <InfoRow label="Full Name" value={user?.fullName || ""} />
            <InfoRow label="Email" value={user?.email || ""} />
            <InfoRow label="Role" value={user?.role || "member"} />
            <InfoRow label="Joined" value={joinedDate} border={false} />
          </View>

          <Text style={styles.sectionLabel}>Security</Text>
          <View style={styles.card}>
            <InfoRow
              label="Password"
              value="••••••••"
              border={false}
            />
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#F2F2F2",
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
    backgroundColor: "#DEDEDE",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "700",
    color: "#888",
  },
  nameText: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 12,
  },
  emailSubtext: {
    fontSize: 15,
    color: "#616161",
    marginTop: 4,
  },
  sectionLabel: {
    marginTop: 28,
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#6E6E6E",
  },
  card: {
    marginTop: 12,
    backgroundColor: "#FFFFFF",
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
    borderBottomColor: "#E5E5E5",
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  infoValue: {
    fontSize: 16,
    color: "#616161",
  },
});
