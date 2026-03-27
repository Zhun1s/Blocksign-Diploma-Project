import ArrowLeftIcon from "@/assets/icons/ArrowLeftIcon";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

function createInviteToken() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

export default function AddParticipantScreen() {
  const { id, name } = useLocalSearchParams<{ id?: string; name?: string }>();
  const projectName = name ? `${name}` : "Project";
  const inviteToken = useState(createInviteToken)[0];

  const invitePayload = useMemo(
    () =>
      JSON.stringify({
        type: "project-invite",
        projectId: id ?? "unknown-project",
        projectName,
        token: inviteToken,
      }),
    [id, inviteToken, projectName],
  );

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
            <Text style={styles.projectName}>Add Participant</Text>
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>Project:</Text>
            <Text style={styles.sectionTitleName}>{projectName}</Text>
          </View>

          <View style={styles.qrContainer}>
            <QRCode
              value={invitePayload}
              size={220}
              backgroundColor="#FFFFFF"
            />
            <Text style={styles.inviteLabel}>Invite Code</Text>
            <Text style={styles.inviteToken}>{inviteToken}</Text>
            <Text style={styles.descriptionText}>
              New participant join to project only after signing NDA and
              accepting project rules.
            </Text>
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
    fontFamily: "Inter",
    flex: 1,
    marginTop: 100,
    marginHorizontal: 16,
  },
  headerRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  projectName: {
    fontSize: 32,
    fontWeight: "bold",
  },
  descriptionContainer: {
    display: "flex",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: 24,
    gap: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#767676",
  },
  sectionTitleName: {
    fontSize: 24,
    fontWeight: "600",
  },
  descriptionText: {
    fontSize: 14,
    color: "#767676",
    textAlign: "center",
  },
  qrContainer: {
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 48,
    alignItems: "center",
    marginBottom: 24,
    gap: 10,
  },
  inviteLabel: {
    marginTop: 8,
    fontSize: 14,
    color: "#767676",
    fontWeight: "500",
  },
  inviteToken: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 1,
  },
  regenerateButton: {
    marginTop: 4,
    backgroundColor: "#000000",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  regenerateButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
