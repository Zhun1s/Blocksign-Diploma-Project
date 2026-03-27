import MoreDotsVerticalIcon from "@/assets/icons/MoreDotsVerticalIcon";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import React, { useState } from "react";
import { Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";

export type Document = {
  id: string;
  title: string;
  size?: string;
  uploadedAt?: string;
};

export function DocumentItem({
  document,
  onPress,
  onDelete,
}: {
  document: Document;
  onPress: (document: Document) => void;
  onDelete?: (document: Document) => void;
}) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <>
      <Pressable onPress={() => onPress(document)} style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.documentInfoRow}>
          <Image
            source={require("../assets/images/PDF Icon.png")}
            style={styles.documentPreview}
            resizeMode="contain"
          />
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {document.title}
            </Text>
            {(document.size || document.uploadedAt) && (
              <Text style={[styles.meta, { color: colors.textTertiary }]}>
                {document.size ?? ""}
                {document.size && document.uploadedAt ? " - " : ""}
                {document.uploadedAt ?? ""}
              </Text>
            )}
          </View>
        </View>
        <Pressable onPress={() => setMenuVisible(true)} hitSlop={12}>
          <MoreDotsVerticalIcon color={colors.textSecondary} />
        </Pressable>
      </Pressable>

      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <Pressable style={styles.backdrop} onPress={() => setMenuVisible(false)} />
        <View style={[styles.menuSheet, { backgroundColor: colors.card }]}>
          <View style={styles.handle} />
          <Text style={[styles.menuTitle, { color: colors.text }]} numberOfLines={1}>
            {document.title}
          </Text>

          <Pressable
            onPress={() => {
              setMenuVisible(false);
              onPress(document);
            }}
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
          >
            <Text style={[styles.menuItemText, { color: colors.text }]}>
              Open
            </Text>
          </Pressable>

          {onDelete && (
            <Pressable
              onPress={() => {
                setMenuVisible(false);
                onDelete(document);
              }}
              style={styles.menuItemLast}
            >
              <Text style={[styles.menuItemText, { color: "#FF3B30" }]}>
                {t("delete")}
              </Text>
            </Pressable>
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  documentInfoRow: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  documentPreview: { width: 44, height: 56 },
  title: { fontSize: 16, fontWeight: "600" },
  meta: { marginTop: 4, fontSize: 13, fontWeight: "500" },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  menuSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 12,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: "#CCC", alignSelf: "center", marginBottom: 16,
  },
  menuTitle: { fontSize: 18, fontWeight: "700", marginBottom: 16 },
  menuItem: {
    paddingVertical: 16,
    borderBottomWidth: 0.5,
  },
  menuItemLast: {
    paddingVertical: 16,
  },
  menuItemText: { fontSize: 16, fontWeight: "600" },
});
