import ArrowLeftIcon from "@/assets/icons/ArrowLeftIcon";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { createTask } from "@/services/api";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function NewTaskScreen() {
  const { id, name } = useLocalSearchParams<{ id?: string; name?: string }>();
  const projectId = Number(id);
  const projectName = name ? `${name}` : "Project";
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadlineDate, setDeadlineDate] = useState<Date | null>(null);
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
  const [important, setImportant] = useState(false);
  const [loading, setLoading] = useState(false);

  const deadlineLabel = deadlineDate
    ? deadlineDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

  const onDeadlineChange = (
    _event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (Platform.OS === "android") {
      // Android: picker auto-closes, set directly
      setShowDeadlinePicker(false);
      if (selectedDate) {
        setDeadlineDate(selectedDate);
      }
    } else {
      // iOS: inline picker, update temp date
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const confirmDate = () => {
    setDeadlineDate(tempDate);
    setShowDeadlinePicker(false);
  };

  const clearDate = () => {
    setDeadlineDate(null);
    setShowDeadlinePicker(false);
  };

  const onCreateTask = async () => {
    if (!title) {
      Alert.alert(t("error"), t("taskTitleRequired"));
      return;
    }
    setLoading(true);
    try {
      await createTask(projectId, {
        title,
        description: description || undefined,
        status: "not_started",
        important,
        deadline: deadlineDate ? deadlineDate.toISOString() : undefined,
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
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: colors.background }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <View style={styles.headerRow}>
              <Pressable onPress={() => router.back()}>
                <ArrowLeftIcon color={colors.text} />
              </Pressable>
              <Text style={[styles.pageTitle, { color: colors.text }]}>
                {t("createNewTask")}
              </Text>
            </View>

            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <Text style={[styles.label, { color: colors.text }]}>
                {t("project")}
              </Text>
              <Text style={[styles.projectName, { color: colors.text }]}>
                {projectName}
              </Text>
            </View>

            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <Text style={[styles.label, { color: colors.text }]}>
                {t("taskTitle")}
              </Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Enter task title"
                placeholderTextColor={colors.placeholder}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.inputText,
                  },
                ]}
              />

              <Text
                style={[styles.label, styles.sectionSpacing, { color: colors.text }]}
              >
                {t("description")}
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Task details"
                placeholderTextColor={colors.placeholder}
                style={[
                  styles.input,
                  styles.multilineInput,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.inputText,
                  },
                ]}
                multiline
                textAlignVertical="top"
              />

              <Text
                style={[styles.label, styles.sectionSpacing, { color: colors.text }]}
              >
                {t("deadline")}
              </Text>
              <Pressable
                onPress={() => {
                  setTempDate(deadlineDate ?? new Date());
                  setShowDeadlinePicker((prev) => !prev);
                }}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text
                  style={
                    deadlineDate
                      ? { fontSize: 15, color: colors.inputText }
                      : { fontSize: 15, color: colors.placeholder }
                  }
                >
                  {deadlineDate ? deadlineLabel : t("selectDeadline")}
                </Text>
              </Pressable>

              {showDeadlinePicker && (
                <View
                  style={[
                    styles.pickerContainer,
                    {
                      backgroundColor: isDark ? colors.card : "#FFFFFF",
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <DateTimePicker
                    value={tempDate}
                    mode="date"
                    display={Platform.OS === "ios" ? "inline" : "default"}
                    onChange={onDeadlineChange}
                    themeVariant={isDark ? "dark" : "light"}
                  />
                  {Platform.OS === "ios" && (
                    <View style={styles.pickerActions}>
                      <Pressable onPress={clearDate} style={styles.pickerBtn}>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color: "#FF3B30",
                          }}
                        >
                          Clear
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={confirmDate}
                        style={[
                          styles.pickerBtn,
                          styles.pickerConfirm,
                          { backgroundColor: colors.primary },
                        ]}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "700",
                            color: colors.primaryText,
                          }}
                        >
                          Select
                        </Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              )}

              <Text
                style={[styles.label, styles.sectionSpacing, { color: colors.text }]}
              >
                {t("importance")}
              </Text>
              <View style={styles.priorityRow}>
                <Pressable
                  onPress={() => setImportant((prev) => !prev)}
                  style={[
                    styles.priorityChip,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    important && {
                      backgroundColor: colors.primary,
                      borderColor: colors.primary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.priorityChipText,
                      { color: colors.textSecondary },
                      important && { color: colors.primaryText },
                    ]}
                  >
                    {t("important")}
                  </Text>
                </Pressable>
              </View>
            </View>

            <Pressable
              onPress={onCreateTask}
              disabled={loading}
              style={({ pressed }) => [
                styles.createButton,
                { backgroundColor: colors.primary },
                pressed && { opacity: 0.9 },
              ]}
            >
              {loading ? (
                <ActivityIndicator color={colors.primaryText} />
              ) : (
                <Text style={[styles.createButtonText, { color: colors.primaryText }]}>
                  {t("createTask")}
                </Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
  container: {
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
  projectName: {
    marginTop: 6,
    fontSize: 22,
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
  pickerContainer: {
    marginTop: 10,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    paddingBottom: 8,
  },
  pickerActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    paddingHorizontal: 12,
    paddingTop: 4,
  },
  pickerBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  pickerConfirm: {
    borderRadius: 10,
  },
  priorityRow: {
    marginTop: 10,
    flexDirection: "row",
    gap: 8,
  },
  priorityChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  priorityChipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  createButton: {
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
