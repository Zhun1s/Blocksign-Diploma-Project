import ArrowLeftIcon from "@/assets/icons/ArrowLeftIcon";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
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
  const { colors } = useTheme();
  const { t } = useLanguage();

  const [email, setEmail] = useState("");
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onInvite = async () => {
    if (!email) {
      Alert.alert(t("error"), t("enterEmail"));
      return;
    }
    setLoading(true);
    try {
      const res = await inviteMember(projectId, email);
      setInviteToken(res.token);
    } catch (e: any) {
      Alert.alert(t("error"), e.message);
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
        style={[styles.background, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()}>
              <ArrowLeftIcon color={colors.text} />
            </Pressable>
            <Text style={[styles.projectName, { color: colors.text }]}>{t("addParticipant")}</Text>
          </View>

          <View style={[styles.descriptionContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Project:</Text>
            <Text style={[styles.sectionTitleName, { color: colors.text }]}>{projectName}</Text>
          </View>

          {!inviteToken ? (
            <View style={[styles.formContainer, { backgroundColor: colors.card }]}>
              <Text style={[styles.label, { color: colors.text }]}>{t("participantEmail")}</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="user@example.com"
                placeholderTextColor={colors.placeholder}
                keyboardType="email-address"
                autoCapitalize="none"
                style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.inputText }]}
              />
              <Pressable
                onPress={onInvite}
                disabled={loading}
                style={({ pressed }) => [
                  styles.inviteButton,
                  { backgroundColor: colors.primary },
                  pressed && { opacity: 0.9 },
                ]}
              >
                {loading ? (
                  <ActivityIndicator color={colors.primaryText} />
                ) : (
                  <Text style={[styles.inviteButtonText, { color: colors.primaryText }]}>{t("sendInvite")}</Text>
                )}
              </Pressable>
            </View>
          ) : (
            <View style={[styles.qrContainer, { backgroundColor: colors.card }]}>
              <QRCode
                value={qrPayload}
                size={220}
                backgroundColor={colors.card}
              />
              <Text style={[styles.inviteLabel, { color: colors.textSecondary }]}>{t("inviteCode")}</Text>
              <Text style={[styles.inviteTokenText, { color: colors.text }]}>
                {inviteToken.slice(0, 12)}...
              </Text>
              <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
                {t("inviteDisclaimer")}
              </Text>
              <Pressable
                onPress={() => {
                  setInviteToken(null);
                  setEmail("");
                }}
                style={[styles.newInviteButton, { backgroundColor: colors.primary }]}
              >
                <Text style={[styles.newInviteButtonText, { color: colors.primaryText }]}>
                  {t("inviteAnother")}
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
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: 24,
    gap: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  sectionTitleName: {
    fontSize: 24,
    fontWeight: "600",
  },
  formContainer: {
    marginTop: 16,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
  input: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
  },
  inviteButton: {
    marginTop: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  inviteButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  descriptionText: {
    fontSize: 14,
    textAlign: "center",
  },
  qrContainer: {
    marginTop: 16,
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
    fontWeight: "500",
  },
  inviteTokenText: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 1,
  },
  newInviteButton: {
    marginTop: 8,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  newInviteButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
