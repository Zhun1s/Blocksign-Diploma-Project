import ArrowLeftIcon from "@/assets/icons/ArrowLeftIcon";
import { inviteMember } from "@/services/api";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";

export default function AddParticipantScreen() {
  const { id, name } = useLocalSearchParams<{ id?: string; name?: string }>();
  const projectId = Number(id);
  const projectName = name ? `${name}` : "Project";

  const [email, setEmail] = useState("");
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onInvite = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter participant's email");
      return;
    }
    setLoading(true);
    try {
      const res = await inviteMember(projectId, email);
      setInviteToken(res.token);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to invite");
    } finally {
      setLoading(false);
    }
  };

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
              <Text style={styles.label}>Participant Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="user@example.com"
                placeholderTextColor="#9A9A9A"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
              <Pressable
                onPress={onInvite}
                disabled={loading}
                style={({ pressed }) => [
                  styles.inviteButton,
                  pressed && { opacity: 0.9 },
                ]}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.inviteButtonText}>Send Invite</Text>
                )}
              </Pressable>
            </View>
          ) : (
            <View style={styles.qrContainer}>
              <QRCode
                value={qrPayload}
                size={220}
                backgroundColor="#FFFFFF"
              />
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
                  setEmail("");
                }}
                style={styles.newInviteButton}
              >
                <Text style={styles.newInviteButtonText}>
                  Invite Another
                </Text>
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
  input: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111111",
    backgroundColor: "#FFFFFF",
  },
  inviteButton: {
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  inviteButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
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
