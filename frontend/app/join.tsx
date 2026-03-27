import ArrowLeftIcon from "@/assets/icons/ArrowLeftIcon";
import JoinProjectPopup from "@/components/joinprojectpopup";
import SignaturePopup from "@/components/signaturepopup";
import { useTheme } from "@/contexts/ThemeContext";
import { getNdaAccess, signNda } from "@/services/api";
import {
  BarcodeScanningResult,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { GlassView } from "expo-glass-effect";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Button, Pressable, StyleSheet, Text, View } from "react-native";

type ScannedData = {
  projectId: number;
  projectName: string;
  token: string;
};

export default function Join() {
  const [permission, requestPermission] = useCameraPermissions();
  const { colors } = useTheme();

  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState<ScannedData | null>(null);
  const [ndaText, setNdaText] = useState<string | undefined>();
  const [selectedLens, setSelectedLens] = useState("builtInWideAngleCamera");

  // Popup states
  const [showNdaPopup, setShowNdaPopup] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [signing, setSigning] = useState(false);

  const handleBarcodeScanned = async ({ data }: BarcodeScanningResult) => {
    if (scanned) return;
    setScanned(true);

    try {
      const parsed = JSON.parse(data);
      if (parsed.type === "project-invite" && parsed.token && parsed.projectId) {
        const projectId = Number(parsed.projectId);
        const projectName = parsed.projectName || "Project";
        const token = parsed.token;

        // Fetch NDA from backend
        try {
          const nda = await getNdaAccess(projectId, token);
          setScannedData({ projectId, projectName: nda.project_name || projectName, token });
          if (nda.nda_ipfs_hash) {
            // Fetch actual NDA text from IPFS
            try {
              const res = await fetch(`https://gateway.pinata.cloud/ipfs/${nda.nda_ipfs_hash}`);
              const text = await res.text();
              setNdaText(text);
            } catch {
              setNdaText(undefined);
            }
          }
          setShowNdaPopup(true);
        } catch (e: any) {
          Alert.alert("Error", e.message || "Failed to access invite");
          setScanned(false);
        }
      } else {
        Alert.alert("Invalid QR", "This QR code is not a valid project invite.");
        setScanned(false);
      }
    } catch {
      Alert.alert("Invalid QR", "Could not read QR code data.");
      setScanned(false);
    }
  };

  const handleSignSubmit = async (svgPaths: string[]) => {
    if (!scannedData) return;
    setSigning(true);
    try {
      // Convert SVG paths to a simple base64 representation
      const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200">${svgPaths.map((d) => `<path d="${d}" stroke="#000" stroke-width="2" fill="none"/>`).join("")}</svg>`;
      const signatureBase64 = btoa(svgContent);

      await signNda(scannedData.projectId, scannedData.token, signatureBase64);
      setShowSignature(false);
      Alert.alert("Success", "NDA signed successfully! You can now access the project.", [
        { text: "OK", onPress: () => router.replace("/(tabs)/projects") },
      ]);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to sign NDA");
    } finally {
      setSigning(false);
    }
  };

  const handleAvailableLensesChanged = ({ lenses }: { lenses: string[] }) => {
    if (!lenses.length) return;
    if (lenses.includes("builtInWideAngleCamera")) {
      if (selectedLens !== "builtInWideAngleCamera") setSelectedLens("builtInWideAngleCamera");
      return;
    }
    const fallback = lenses.find((l) => !l.toLowerCase().includes("ultrawide"));
    if (fallback && fallback !== selectedLens) setSelectedLens(fallback);
  };

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()}>
          <GlassView style={{ padding: 16, borderRadius: 90 }} isInteractive>
            <ArrowLeftIcon color="white" />
          </GlassView>
        </Pressable>
      </View>
      <CameraView
        style={styles.camera}
        facing="back"
        selectedLens={selectedLens}
        zoom={0}
        onAvailableLensesChanged={handleAvailableLensesChanged}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
      />
      <View pointerEvents="none" style={styles.overlay}>
        <View style={styles.barcodeBounds} />
      </View>
      <View style={styles.cameraText}>
        <Text style={styles.text}>
          {scanned ? "Processing..." : "Please make sure that QR-code is seen good enough"}
        </Text>
      </View>

      {signing && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={{ color: "#FFFFFF", marginTop: 8, fontWeight: "600" }}>Signing NDA on blockchain...</Text>
        </View>
      )}

      <JoinProjectPopup
        visible={showNdaPopup}
        projectName={scannedData?.projectName}
        ndaText={ndaText}
        onContinue={() => {
          setShowNdaPopup(false);
          setShowSignature(true);
        }}
        onClose={() => {
          setShowNdaPopup(false);
          setScanned(false);
          setScannedData(null);
        }}
      />

      <SignaturePopup
        visible={showSignature}
        projectName={scannedData?.projectName}
        onClose={() => {
          setShowSignature(false);
          setScanned(false);
          setScannedData(null);
        }}
        onSubmit={handleSignSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center" },
  message: { textAlign: "center", paddingBottom: 10 },
  camera: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  barcodeBounds: { width: 260, height: 260, borderRadius: 18, borderWidth: 2, borderColor: "#FFFFFF", backgroundColor: "transparent" },
  headerRow: {
    position: "absolute", top: 64, left: 0, right: 0,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, zIndex: 1,
  },
  cameraText: {
    position: "absolute", bottom: 140, left: 0, right: 0,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
  },
  text: { fontSize: 14, fontWeight: "500", color: "#BEBEBE", textAlign: "center" },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
});
