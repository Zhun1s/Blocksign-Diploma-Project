import ArrowLeftIcon from "@/assets/icons/ArrowLeftIcon";
import { claimInvite, getNdaAccess } from "@/services/api";
import {
  BarcodeScanningResult,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { GlassView } from "expo-glass-effect";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Button, Pressable, StyleSheet, Text, View } from "react-native";

export default function Join() {
  const [permission, requestPermission] = useCameraPermissions();

  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState<{
    projectId: string;
    projectName: string;
    token: string;
  } | null>(null);
  const [selectedLens, setSelectedLens] = useState("builtInWideAngleCamera");

  const handleBarcodeScanned = ({ data }: BarcodeScanningResult) => {
    if (scanned) return;
    setScanned(true);

    try {
      const parsed = JSON.parse(data);
      if (
        parsed.type === "project-invite" &&
        parsed.token &&
        parsed.projectId
      ) {
        setScannedData({
          projectId: parsed.projectId,
          projectName: parsed.projectName || "Project",
          token: parsed.token,
        });
      } else {
        Alert.alert(
          "Invalid QR",
          "This QR code is not a valid project invite.",
        );
        setScanned(false);
      }
    } catch {
      Alert.alert("Invalid QR", "Could not read QR code data.");
      setScanned(false);
    }
  };

  const handleContinue = async () => {
    if (!scannedData) return;
    try {
      await claimInvite(Number(scannedData.projectId), scannedData.token);
      const nda = await getNdaAccess(
        Number(scannedData.projectId),
        scannedData.token,
      );
      Alert.alert(
        "NDA Required",
        `Project: ${nda.project_name}\n\nYou need to sign the NDA to join this project.`,
        [
          { text: "Cancel", style: "cancel", onPress: () => router.back() },
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ],
      );
    } catch (e: any) {
      const message = e?.message || "Failed to access project invite";
      if (
        message.includes("401") ||
        message.toLowerCase().includes("not authenticated")
      ) {
        Alert.alert(
          "Login Required",
          "Please log in or sign up first, then scan the invite QR again.",
        );
      } else {
        Alert.alert("Error", message);
      }
      setScanned(false);
      setScannedData(null);
    }
  };

  const handleAvailableLensesChanged = ({ lenses }: { lenses: string[] }) => {
    if (!lenses.length) return;

    if (lenses.includes("builtInWideAngleCamera")) {
      if (selectedLens !== "builtInWideAngleCamera") {
        setSelectedLens("builtInWideAngleCamera");
      }
      return;
    }

    const fallbackLens = lenses.find(
      (lens) => !lens.toLowerCase().includes("ultrawide"),
    );

    if (fallbackLens && fallbackLens !== selectedLens) {
      setSelectedLens(fallbackLens);
    }
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
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
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      />
      <View pointerEvents="none" style={styles.overlay}>
        <View style={styles.barcodeBounds} />
      </View>
      <View style={styles.cameraText}>
        <Text style={styles.text}>
          {scannedData
            ? `Project: ${scannedData.projectName}`
            : "Please make sure that QR-code is seen good enough"}
        </Text>
      </View>
      {scanned && scannedData && (
        <Pressable onPress={handleContinue} style={styles.continueButton}>
          <Text style={{ fontWeight: "600", fontSize: 16 }}>Continue</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  barcodeBounds: {
    width: 260,
    height: 260,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    backgroundColor: "transparent",
  },

  headerRow: {
    position: "absolute",
    top: 64,
    left: 0,
    right: 0,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    zIndex: 1,
  },

  cameraText: {
    position: "absolute",
    top: 600,
    left: 0,
    right: 0,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  text: {
    fontSize: 14,
    fontWeight: "500",
    color: "#BEBEBE",
    textAlign: "center",
  },

  continueButton: {
    position: "absolute",
    bottom: 64,
    left: 105,
    height: 40,
    width: 181,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
  },
});
