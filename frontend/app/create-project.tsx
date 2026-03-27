import ArrowLeftIcon from "@/assets/icons/ArrowLeftIcon";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
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
  const { colors } = useTheme();
  const { t } = useLanguage();

  const onCreateProject = async () => {
    if (!name) {
      Alert.alert(t("error"), t("projectNameRequired"));
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
      Alert.alert(t("error"), e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={[styles.background, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()}>
              <ArrowLeftIcon color={colors.text} />
            </Pressable>
            <Text style={[styles.pageTitle, { color: colors.text }]}>{t("createProject")}</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.label, { color: colors.text }]}>{t("projectName")}</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter project name"
              placeholderTextColor={colors.placeholder}
              style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.inputText }]}
            />

            <Text style={[styles.label, styles.sectionSpacing, { color: colors.text }]}>{t("company")}</Text>
            <TextInput
              value={company}
              onChangeText={setCompany}
              placeholder="Company or organization"
              placeholderTextColor={colors.placeholder}
              style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.inputText }]}
            />

            <Text style={[styles.label, styles.sectionSpacing, { color: colors.text }]}>
              {t("description")}
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Project details"
              placeholderTextColor={colors.placeholder}
              style={[styles.input, styles.multilineInput, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.inputText }]}
              multiline
              textAlignVertical="top"
            />

            <Text style={[styles.label, styles.sectionSpacing, { color: colors.text }]}>
              {t("ndaText")}
            </Text>
            <TextInput
              value={ndaText}
              onChangeText={setNdaText}
              placeholder="Non-disclosure agreement text (optional)"
              placeholderTextColor={colors.placeholder}
              style={[styles.input, styles.multilineInput, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.inputText }]}
              multiline
              textAlignVertical="top"
            />
          </View>

          <Pressable
            onPress={onCreateProject}
            disabled={loading}
            style={({ pressed }) => [
              styles.createButton,
              { backgroundColor: colors.primary },
              pressed && styles.createButtonPressed,
            ]}
          >
            {loading ? (
              <ActivityIndicator color={colors.primaryText} />
            ) : (
              <Text style={[styles.createButtonText, { color: colors.primaryText }]}>{t("createProject")}</Text>
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
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
  input: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
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
  },
});
