import { useMemo, useRef, useState } from "react";
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
  onSubmit: (signaturePathCount: number) => void;
};

export default function SignaturePopup({
  visible,
  projectName,
  onClose,
  onSubmit,
}: SignaturePopupProps) {
  const { height } = useWindowDimensions();
  const [paths, setPaths] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState("");
  const pathBuilderRef = useRef("");

  const isSigned = paths.length > 0 || currentPath.length > 0;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderGrant: (event) => {
          const { locationX, locationY } = event.nativeEvent;
          const nextPath = `M ${locationX} ${locationY}`;
          pathBuilderRef.current = nextPath;
          setCurrentPath(nextPath);
        },
        onPanResponderMove: (event) => {
          const { locationX, locationY } = event.nativeEvent;
          pathBuilderRef.current = `${pathBuilderRef.current} L ${locationX} ${locationY}`;
          setCurrentPath(pathBuilderRef.current);
        },
        onPanResponderRelease: () => {
          if (!pathBuilderRef.current) return;
          const completedPath = pathBuilderRef.current;
          setPaths((prev) => [...prev, completedPath]);
          pathBuilderRef.current = "";
          setCurrentPath("");
        },
        onPanResponderTerminate: () => {
          if (!pathBuilderRef.current) return;
          const completedPath = pathBuilderRef.current;
          setPaths((prev) => [...prev, completedPath]);
          pathBuilderRef.current = "";
          setCurrentPath("");
        },
      }),
    [],
  );

  const handleClear = () => {
    setPaths([]);
    setCurrentPath("");
    pathBuilderRef.current = "";
  };

  const handleSubmit = () => {
    const strokeCount = paths.length + (currentPath ? 1 : 0);
    onSubmit(strokeCount);
    handleClear();
  };

  const handleClose = () => {
    handleClear();
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleClose} />

        <View
          style={[styles.sheet, { maxHeight: Math.min(height * 0.84, 720) }]}
        >
          <View style={styles.handle} />
          <Text style={styles.title}>Sign NDA</Text>
          <Text style={styles.subtitle}>
            {projectName
              ? `Draw your signature to join ${projectName}`
              : "Draw your signature to accept NDA"}
          </Text>

          <View
            style={styles.canvasWrap}
            collapsable={false}
            {...panResponder.panHandlers}
          >
            <Svg
              width="100%"
              height="100%"
              style={styles.canvas}
              pointerEvents="none"
            >
              {paths.map((d, index) => (
                <Path
                  key={`path-${index}`}
                  d={d}
                  stroke="#111111"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              ))}
              {currentPath ? (
                <Path
                  d={currentPath}
                  stroke="#111111"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              ) : null}
            </Svg>
            {!isSigned ? (
              <Text style={styles.placeholder} pointerEvents="none">
                Sign here
              </Text>
            ) : null}
          </View>

          <View style={styles.actionsRow}>
            <Pressable onPress={handleClear} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </Pressable>
            <Pressable
              onPress={handleSubmit}
              style={[
                styles.submitButton,
                !isSigned && styles.submitButtonDisabled,
              ]}
              disabled={!isSigned}
            >
              <Text style={styles.submitButtonText}>Submit signature</Text>
            </Pressable>
          </View>
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

  canvasWrap: {
    height: 280,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    backgroundColor: "#FFFCF2",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },

  canvas: {
    ...StyleSheet.absoluteFillObject,
  },

  placeholder: {
    color: "#999999",
    fontSize: 14,
    fontWeight: "500",
  },

  actionsRow: {
    flexDirection: "row",
    gap: 10,
  },

  clearButton: {
    flex: 1,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#CFCFCF",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },

  clearButtonText: {
    color: "#333333",
    fontSize: 14,
    fontWeight: "600",
  },

  submitButton: {
    flex: 2,
    borderRadius: 28,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },

  submitButtonDisabled: {
    backgroundColor: "#BEBEBE",
  },

  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
