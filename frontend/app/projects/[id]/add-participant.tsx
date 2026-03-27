import ArrowLeftIcon from "@/assets/icons/ArrowLeftIcon";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
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
  const { colors } = useTheme();
  const { t } = useLanguage();

  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const generateInvite = useCallback(async () => {
    setLoading(true);
    try {
      const res = await inviteMember(projectId);
      setInviteToken(res.token);
    } catch (e: any) {
      Alert.alert(t("error"), e.message);
    } finally {
      setLoading(false);
    }
  }, [projectId, t]);

  useEffect(() => {
    generateInvite();
  }, [generateInvite]);

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
            <Text style={[styles.title, { color: colors.text }]}>{t("addParticipant")}</Text>
          </View>

          <View style={[styles.projectCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.projectLabel, { color: colors.textSecondary }]}>
              {t("project")}:
            </Text>
            <Text style={[styles.projectName, { color: colors.text }]}>{projectName}</Text>
          </View>

          {loading ? (
            <ActivityIndicator style={{ marginTop: 48 }} size="large" />
          ) : (
            <View style={[styles.qrContainer, { backgroundColor: colors.card }]}>
              <QRCode
                value={qrPayload}
                size={220}
                backgroundColor={colors.card}
                color={colors.text}
              />
              <Text style={[styles.inviteLabel, { color: colors.textSecondary }]}>
                {t("inviteCode")}
              </Text>
              <Text style={[styles.inviteTokenText, { color: colors.text }]}>
                {inviteToken?.slice(0, 12)}...
              </Text>
              <Text style={[styles.disclaimer, { color: colors.textSecondary }]}>
                {t("inviteDisclaimer")}
              </Text>
              <Pressable
                onPress={generateInvite}
                style={[styles.regenerateButton, { backgroundColor: colors.primary }]}
              >
                <Text style={[styles.regenerateText, { color: colors.primaryText }]}>
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
  background: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  container: { flex: 1, marginTop: 100, marginHorizontal: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontSize: 32, fontWeight: "bold" },
  projectCard: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: 24,
    gap: 4,
  },
  projectLabel: { fontSize: 16, fontWeight: "500" },
  projectName: { fontSize: 24, fontWeight: "600" },
  qrContainer: {
    marginTop: 16,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 48,
    alignItems: "center",
    marginBottom: 24,
    gap: 10,
  },
  inviteLabel: { marginTop: 8, fontSize: 14, fontWeight: "500" },
  inviteTokenText: { fontSize: 20, fontWeight: "700", letterSpacing: 1 },
  disclaimer: { fontSize: 14, textAlign: "center" },
  regenerateButton: { marginTop: 8, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  regenerateText: { fontSize: 14, fontWeight: "600" },
});
