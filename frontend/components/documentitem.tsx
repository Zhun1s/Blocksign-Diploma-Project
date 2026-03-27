import MoreDotsVerticalIcon from "@/assets/icons/MoreDotsVerticalIcon";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export type Document = {
  id: string;
  title: string;
  size?: string;
  uploadedAt?: string;
};

export function DocumentItem({
  document,
  onPress,
}: {
  document: Document;
  onPress: (document: Document) => void;
}) {
  return (
    <Pressable onPress={() => onPress(document)} style={styles.card}>
      <View style={styles.documentInfoRow}>
        <Image
          source={require("../assets/images/PDF Icon.png")}
          style={styles.documentPreview}
          resizeMode="contain"
        />
        <View>
          <Text style={styles.title}>{document.title}</Text>
          {(document.size || document.uploadedAt) && (
            <Text style={styles.meta}>
              {document.size ?? ""}
              {document.size && document.uploadedAt ? " - " : ""}
              {document.uploadedAt ?? ""}
            </Text>
          )}
        </View>
      </View>

      <MoreDotsVerticalIcon />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  documentInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  documentPreview: {
    width: 44,
    height: 56,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111111",
  },
  meta: {
    marginTop: 4,
    fontSize: 13,
    color: "#767676",
    fontWeight: "500",
  },
});
