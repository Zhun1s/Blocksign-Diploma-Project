import ArrowLeftIcon from "@/assets/icons/ArrowLeftIcon";
import { inviteMember } from "@/services/api";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";

export default function AddParticipantScreen() {
  const { id, name } = useLocalSearchParams<{ id?: string; name?: string }>();
  const projectId = Number(id);
  const projectName = name ? `${name}` : "Project";

  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const onInvite = useCallback(async () => {
    if (!Number.isFinite(projectId)) {
      Alert.alert("Error", "Invalid project id");
      return;
    }
    setLoading(true);
    setErrorText(null);
    try {
      const res = await inviteMember(projectId);
      setInviteToken(res.token);
    } catch (e: any) {
      const message = e?.message || "Failed to invite";
      setErrorText(message);
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    onInvite();
  }, [onInvite]);

  const qrPayload = inviteToken
    ? JSON.stringify({
        type: "project-invite",
        projectId: id,
        projectName,
        token: inviteToken,
      })
    : "";

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

          {!inviteToken ? (
            <View style={styles.formContainer}>
              <Text style={styles.label}>Generating Invite QR</Text>
              <Text style={styles.descriptionTextLeft}>
                Creating a one-time QR code for a new participant.
              </Text>
              {loading && <ActivityIndicator style={styles.loadingIndicator} />}
              {!loading && errorText && (
                <>
                  <Text style={styles.errorText}>{errorText}</Text>
                  <Pressable onPress={onInvite} style={styles.retryButton}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                  </Pressable>
                </>
              )}
            </View>
          ) : (
            <View style={styles.qrContainer}>
              <QRCode value={qrPayload} size={220} backgroundColor="#FFFFFF" />
              <Text style={styles.inviteLabel}>Invite Code</Text>
              <Text style={styles.inviteTokenText}>
                {inviteToken.slice(0, 12)}...
              </Text>
              <Text style={styles.descriptionText}>
                New participant joins the project only after signing NDA and
                accepting project rules.
              </Text>
              <Pressable
                onPress={() => {
                  setInviteToken(null);
                  onInvite();
                }}
                style={styles.newInviteButton}
              >
                <Text style={styles.newInviteButtonText}>Invite Another</Text>
              </Pressable>
            </View>
          )}
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
  formContainer: {
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  descriptionTextLeft: {
    marginTop: 8,
    fontSize: 14,
    color: "#767676",
  },
  loadingIndicator: {
    marginTop: 16,
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: "#B42318",
  },
  retryButton: {
    marginTop: 12,
    alignSelf: "flex-start",
    backgroundColor: "#111111",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
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
  inviteTokenText: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 1,
  },
  newInviteButton: {
    marginTop: 8,
    backgroundColor: "#000000",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  newInviteButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
