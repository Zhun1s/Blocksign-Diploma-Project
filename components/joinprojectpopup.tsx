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
  const title = projectName ? `Joined ${projectName}` : "Project joined";
  const ndaBody = ndaText?.trim() ? ndaText.trim() : FALLBACK_NDA_TEXT;

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View
          style={[styles.sheet, { maxHeight: Math.min(height * 0.85, 760) }]}
        >
          <View style={styles.handle} />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>NDA Paper</Text>

          <ScrollView
            style={styles.paperContainer}
            contentContainerStyle={styles.paperContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.paperTitle}>
              Non-Disclosure Agreement (NDA)
            </Text>

            <Text style={styles.paperSectionTitle}>1. Purpose</Text>
            <Text style={styles.paperText}>
              This agreement protects confidential project materials and
              internal communication.
            </Text>

            <Text style={styles.paperSectionTitle}>2. Confidentiality</Text>
            <Text style={styles.paperText}>{ndaBody}</Text>

            <Text style={styles.paperSectionTitle}>3. Acceptance</Text>
            <Text style={styles.paperText}>
              By continuing in this project, you acknowledge and accept the NDA
              terms above.
            </Text>
          </ScrollView>

          <Pressable onPress={onContinue} style={styles.button}>
            <Text style={styles.buttonText}>Continue to Sign</Text>
          </Pressable>

          <Pressable onPress={onClose} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },

  sheet: {
    width: "100%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 24,
    gap: 10,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 10,
  },

  handle: {
    alignSelf: "center",
    width: 48,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#D5D5D5",
    marginBottom: 8,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111111",
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: "#545454",
    marginBottom: 4,
  },

  paperContainer: {
    height: 420,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    backgroundColor: "#FFFCF2",
  },

  paperContent: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 8,
  },

  paperTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1F1F1F",
    marginBottom: 4,
  },

  paperSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#262626",
    marginTop: 2,
  },

  paperText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#303030",
  },

  button: {
    marginTop: 4,
    backgroundColor: "#111111",
    borderRadius: 28,
    alignSelf: "stretch",
    alignItems: "center",
    paddingVertical: 12,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  secondaryButton: {
    alignSelf: "center",
    paddingVertical: 6,
  },

  secondaryButtonText: {
    color: "#5C5C5C",
    fontSize: 13,
    fontWeight: "600",
  },
});
