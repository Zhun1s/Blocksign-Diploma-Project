import React from "react";
import { StyleSheet, View } from "react-native";
import { Document, DocumentItem } from "./documentitem";

export function DocumentList({
  documents,
  onPressDocument,
  onDeleteDocument,
}: {
  documents: Document[];
  onPressDocument: (document: Document) => void;
  onDeleteDocument?: (document: Document) => void;
}) {
  return (
    <View style={styles.container}>
      {documents.map((document) => (
        <View key={document.id}>
          <DocumentItem
            document={document}
            onPress={onPressDocument}
            onDelete={onDeleteDocument}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    marginBottom: 24,
  },
});
