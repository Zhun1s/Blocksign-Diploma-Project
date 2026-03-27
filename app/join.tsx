import ArrowLeftIcon from "@/assets/icons/ArrowLeftIcon";
import {
  BarcodeScanningResult,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { GlassView } from "expo-glass-effect";
import { router } from "expo-router";
import { useState } from "react";
import { Button, Pressable, StyleSheet, Text, View } from "react-native";

const getProjectNameFromQrData = (rawData: string) => {
  if (!rawData) return undefined;

  try {
    const parsedData = JSON.parse(rawData) as {
      projectName?: string;
      name?: string;
      project?: string;
    };
    const fromObject =
      parsedData.projectName || parsedData.name || parsedData.project;
    if (fromObject && fromObject.trim().length > 0) {
      return fromObject.trim();
    }
  } catch {
    // Not a JSON payload.
  }

  try {
    const url = new URL(rawData);
    const fromParams =
      url.searchParams.get("projectName") ||
      url.searchParams.get("name") ||
      url.searchParams.get("project");

    if (fromParams && fromParams.trim().length > 0) {
      return fromParams.trim();
    }
  } catch {
    // Not a URL payload.
  }

  return rawData.trim() || undefined;
};

const getNdaTextFromQrData = (rawData: string) => {
  if (!rawData) return undefined;

  try {
    const parsedData = JSON.parse(rawData) as {
      ndaText?: string;
      nda?: string;
      paper?: string;
      text?: string;
    };
    const fromObject =
      parsedData.ndaText ||
      parsedData.nda ||
      parsedData.paper ||
      parsedData.text;
    if (fromObject && fromObject.trim().length > 0) {
      return fromObject.trim();
    }
  } catch {
    // Not a JSON payload.
  }

  try {
    const url = new URL(rawData);
    const fromParams =
      url.searchParams.get("ndaText") ||
      url.searchParams.get("nda") ||
      url.searchParams.get("paper") ||
      url.searchParams.get("text");

    if (fromParams && fromParams.trim().length > 0) {
      return fromParams.trim();
    }
  } catch {
    // Not a URL payload.
  }

  return undefined;
};

export default function Join() {
  const [permission, requestPermission] = useCameraPermissions();

  const [scanned, setScanned] = useState(false);
  const [scannedProjectName, setScannedProjectName] = useState<string>();
  const [scannedNdaText, setScannedNdaText] = useState<string>();
  const [selectedLens, setSelectedLens] = useState("builtInWideAngleCamera");

  const handleBarcodeScanned = ({ type, data }: BarcodeScanningResult) => {
    if (scanned) return;
    console.log("[Barcode] scanned", { type, data });
    setScannedProjectName(getProjectNameFromQrData(data));
    setScannedNdaText(getNdaTextFromQrData(data));
    setScanned(true);
  };

  const handleContinue = () => {
    router.replace({
      pathname: "/(tabs)/projects",
      params: {
        joined: "1",
        joinedProject: scannedProjectName,
        joinedNda: scannedNdaText,
      },
    });
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
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
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
          Please make sure that QR-code is seen good enough
        </Text>
      </View>
      {scanned && (
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
