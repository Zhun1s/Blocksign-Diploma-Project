import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

type JoinProjectPopupProps = {
  visible: boolean;
  projectName?: string;
  ndaText?: string;
  onContinue: () => void;
  onClose: () => void;
};

const FALLBACK_NDA_TEXT =
  "By joining this project, you agree to keep all non-public information confidential. You may use confidential information only for approved project tasks. Sharing, copying, or disclosing this information to third parties is prohibited without written permission. These obligations remain in effect for 3 years after project access ends.";

export default function JoinProjectPopup({
  visible,
  projectName,
  ndaText,
  onContinue,
  onClose,
}: JoinProjectPopupProps) {
  const { height } = useWindowDimensions();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const title = projectName ? `Joined ${projectName}` : "Project joined";
  const ndaBody = ndaText?.trim() ? ndaText.trim() : FALLBACK_NDA_TEXT;

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { maxHeight: Math.min(height * 0.85, 760), backgroundColor: colors.card }]}>
          <View style={styles.handle} />
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>NDA Paper</Text>

          <ScrollView
            style={[styles.paperContainer, { borderColor: colors.border }]}
            contentContainerStyle={styles.paperContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.paperTitle, { color: colors.text }]}>
              Non-Disclosure Agreement (NDA)
            </Text>
            <Text style={[styles.paperSectionTitle, { color: colors.text }]}>1. Purpose</Text>
            <Text style={[styles.paperText, { color: colors.textSecondary }]}>
              This agreement protects confidential project materials and internal communication.
            </Text>
            <Text style={[styles.paperSectionTitle, { color: colors.text }]}>2. Confidentiality</Text>
            <Text style={[styles.paperText, { color: colors.textSecondary }]}>{ndaBody}</Text>
            <Text style={[styles.paperSectionTitle, { color: colors.text }]}>3. Acceptance</Text>
            <Text style={[styles.paperText, { color: colors.textSecondary }]}>
              By continuing in this project, you acknowledge and accept the NDA terms above.
            </Text>
          </ScrollView>

          <Pressable onPress={onContinue} style={[styles.button, { backgroundColor: colors.primary }]}>
            <Text style={[styles.buttonText, { color: colors.primaryText }]}>Continue to Sign</Text>
          </Pressable>
          <Pressable onPress={onClose} style={styles.secondaryButton}>
            <Text style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>{t("cancel")}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)" },
  sheet: {
    width: "100%", borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 16, paddingTop: 10, paddingBottom: 24, gap: 10,
  },
  handle: { alignSelf: "center", width: 48, height: 5, borderRadius: 999, backgroundColor: "#D5D5D5", marginBottom: 8 },
  title: { fontSize: 20, fontWeight: "700" },
  subtitle: { fontSize: 14, lineHeight: 20, marginBottom: 4 },
  paperContainer: { height: 420, borderRadius: 14, overflow: "hidden", borderWidth: 1, backgroundColor: "#FFFCF2" },
  paperContent: { paddingHorizontal: 14, paddingVertical: 14, gap: 8 },
  paperTitle: { fontSize: 17, fontWeight: "700", marginBottom: 4 },
  paperSectionTitle: { fontSize: 14, fontWeight: "700", marginTop: 2 },
  paperText: { fontSize: 13, lineHeight: 20 },
  button: { marginTop: 4, borderRadius: 28, alignSelf: "stretch", alignItems: "center", paddingVertical: 12 },
  buttonText: { fontSize: 14, fontWeight: "700" },
  secondaryButton: { alignSelf: "center", paddingVertical: 6 },
  secondaryButtonText: { fontSize: 13, fontWeight: "600" },
});
