import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";

type SignaturePopupProps = {
  visible: boolean;
  projectName?: string;
  onClose: () => void;
  onSubmit: (svgPaths: string[]) => void;
};

export default function SignaturePopup({
  visible,
  projectName,
  onClose,
  onSubmit,
}: SignaturePopupProps) {
  const { height } = useWindowDimensions();
  const { colors } = useTheme();
  const { t } = useLanguage();

  // Use ref for completed paths to avoid stale closure in PanResponder
  const completedPathsRef = useRef<string[]>([]);
  const [completedPaths, setCompletedPaths] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState("");
  const currentPathRef = useRef("");

  const isSigned = completedPaths.length > 0 || currentPath.length > 0;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderGrant: (event) => {
          const { locationX, locationY } = event.nativeEvent;
          currentPathRef.current = `M ${locationX} ${locationY}`;
          setCurrentPath(currentPathRef.current);
        },
        onPanResponderMove: (event) => {
          const { locationX, locationY } = event.nativeEvent;
          currentPathRef.current += ` L ${locationX} ${locationY}`;
          setCurrentPath(currentPathRef.current);
        },
        onPanResponderRelease: () => {
          if (!currentPathRef.current) return;
          const finished = currentPathRef.current;
          completedPathsRef.current = [...completedPathsRef.current, finished];
          setCompletedPaths([...completedPathsRef.current]);
          currentPathRef.current = "";
          setCurrentPath("");
        },
        onPanResponderTerminate: () => {
          if (!currentPathRef.current) return;
          const finished = currentPathRef.current;
          completedPathsRef.current = [...completedPathsRef.current, finished];
          setCompletedPaths([...completedPathsRef.current]);
          currentPathRef.current = "";
          setCurrentPath("");
        },
      }),
    [],
  );

  const handleClear = useCallback(() => {
    completedPathsRef.current = [];
    setCompletedPaths([]);
    setCurrentPath("");
    currentPathRef.current = "";
  }, []);

  const handleSubmit = useCallback(() => {
    const allPaths = currentPath
      ? [...completedPathsRef.current, currentPath]
      : [...completedPathsRef.current];
    onSubmit(allPaths);
    handleClear();
  }, [currentPath, onSubmit, handleClear]);

  const handleClose = useCallback(() => {
    handleClear();
    onClose();
  }, [handleClear, onClose]);

  const strokeColor = colors.text;

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleClose} />
        <View style={[styles.sheet, { maxHeight: Math.min(height * 0.84, 720), backgroundColor: colors.card }]}>
          <View style={styles.handle} />
          <Text style={[styles.title, { color: colors.text }]}>Sign NDA</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {projectName
              ? `Draw your signature to join ${projectName}`
              : "Draw your signature to accept NDA"}
          </Text>

          <View style={[styles.canvasWrap, { borderColor: colors.border }]} collapsable={false} {...panResponder.panHandlers}>
            <Svg width="100%" height="100%" style={styles.canvas} pointerEvents="none">
              {completedPaths.map((d, index) => (
                <Path key={`p-${index}`} d={d} stroke={strokeColor} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
              ))}
              {currentPath ? (
                <Path d={currentPath} stroke={strokeColor} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
              ) : null}
            </Svg>
            {!isSigned && (
              <Text style={[styles.placeholder, { color: colors.placeholder }]} pointerEvents="none">
                Sign here
              </Text>
            )}
          </View>

          <View style={styles.actionsRow}>
            <Pressable onPress={handleClear} style={[styles.clearButton, { borderColor: colors.border }]}>
              <Text style={[styles.clearButtonText, { color: colors.text }]}>Clear</Text>
            </Pressable>
            <Pressable
              onPress={handleSubmit}
              style={[styles.submitButton, { backgroundColor: colors.primary }, !isSigned && styles.submitButtonDisabled]}
              disabled={!isSigned}
            >
              <Text style={[styles.submitButtonText, { color: colors.primaryText }]}>Submit signature</Text>
            </Pressable>
          </View>
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
  canvasWrap: {
    height: 280, borderRadius: 14, borderWidth: 1, backgroundColor: "#FFFCF2",
    overflow: "hidden", justifyContent: "center", alignItems: "center",
  },
  canvas: { ...StyleSheet.absoluteFillObject },
  placeholder: { fontSize: 14, fontWeight: "500" },
  actionsRow: { flexDirection: "row", gap: 10 },
  clearButton: { flex: 1, borderRadius: 28, borderWidth: 1, alignItems: "center", justifyContent: "center", paddingVertical: 12 },
  clearButtonText: { fontSize: 14, fontWeight: "600" },
  submitButton: { flex: 2, borderRadius: 28, alignItems: "center", justifyContent: "center", paddingVertical: 12 },
  submitButtonDisabled: { opacity: 0.4 },
  submitButtonText: { fontSize: 14, fontWeight: "700" },
});
