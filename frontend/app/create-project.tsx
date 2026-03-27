import ArrowLeftIcon from "@/assets/icons/ArrowLeftIcon";
import { createProject } from "@/services/api";
import { router, Stack } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function CreateProjectScreen() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [ndaText, setNdaText] = useState("");
  const [loading, setLoading] = useState(false);

  const onCreateProject = async () => {
    if (!name) {
      Alert.alert("Error", "Project name is required");
      return;
    }
    setLoading(true);
    try {
      await createProject({
        name,
        company,
        description,
        nda_text: ndaText || undefined,
      });
      router.back();
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.background}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()}>
              <ArrowLeftIcon />
            </Pressable>
            <Text style={styles.pageTitle}>Create Project</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Project Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter project name"
              placeholderTextColor="#9A9A9A"
              style={styles.input}
            />

            <Text style={[styles.label, styles.sectionSpacing]}>Company</Text>
            <TextInput
              value={company}
              onChangeText={setCompany}
              placeholder="Company or organization"
              placeholderTextColor="#9A9A9A"
              style={styles.input}
            />

            <Text style={[styles.label, styles.sectionSpacing]}>
              Description
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Project details"
              placeholderTextColor="#9A9A9A"
              style={[styles.input, styles.multilineInput]}
              multiline
              textAlignVertical="top"
            />

            <Text style={[styles.label, styles.sectionSpacing]}>
              NDA Text
            </Text>
            <TextInput
              value={ndaText}
              onChangeText={setNdaText}
              placeholder="Non-disclosure agreement text (optional)"
              placeholderTextColor="#9A9A9A"
              style={[styles.input, styles.multilineInput]}
              multiline
              textAlignVertical="top"
            />
          </View>

          <Pressable
            onPress={onCreateProject}
            disabled={loading}
            style={({ pressed }) => [
              styles.createButton,
              pressed && styles.createButtonPressed,
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.createButtonText}>Create Project</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#F2F2F2",
  },
  scrollContent: {
    paddingBottom: 24,
  },
  container: {
    fontFamily: "Inter",
    flex: 1,
    marginTop: 100,
    marginHorizontal: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: "bold",
  },
  card: {
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  input: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111111",
    backgroundColor: "#FFFFFF",
  },
  multilineInput: {
    minHeight: 100,
  },
  sectionSpacing: {
    marginTop: 14,
  },
  createButton: {
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  createButtonPressed: {
    opacity: 0.9,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
