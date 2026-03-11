import React from "react";
import { StyleSheet, View } from "react-native";

export function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  separator: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginTop: 12,
  },
});
