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

export default function Join() {
  const [permission, requestPermission] = useCameraPermissions();

  const [scanned, setScanned] = useState(false);
  const [selectedLens, setSelectedLens] = useState("builtInWideAngleCamera");

  const handleBarcodeScanned = ({ type, data }: BarcodeScanningResult) => {
    if (scanned) return;
    console.log("[Barcode] scanned", { type, data });
    setScanned(true);
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
        <View style={styles.continueButton}>
          <Text style={{ fontWeight: "600", fontSize: 16 }}>Continue</Text>
        </View>
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
