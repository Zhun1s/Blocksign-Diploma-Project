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
  const { colors } = useTheme();
  const { t } = useLanguage();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadlineDate, setDeadlineDate] = useState<Date | null>(null);
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
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (Platform.OS === "android") {
      setShowDeadlinePicker(false);
    }

    if (event.type === "set" && selectedDate) {
      setDeadlineDate(selectedDate);
    }
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
            <Text style={[styles.pageTitle, { color: colors.text }]}>{t("createNewTask")}</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.label, { color: colors.text }]}>{t("project")}</Text>
            <Text style={[styles.projectName, { color: colors.text }]}>{projectName}</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.label, { color: colors.text }]}>{t("taskTitle")}</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Enter task title"
              placeholderTextColor={colors.placeholder}
              style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.inputText }]}
            />

            <Text style={[styles.label, styles.sectionSpacing, { color: colors.text }]}>
              {t("description")}
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Task details"
              placeholderTextColor={colors.placeholder}
              style={[styles.input, styles.multilineInput, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.inputText }]}
              multiline
              textAlignVertical="top"
            />

            <Text style={[styles.label, styles.sectionSpacing, { color: colors.text }]}>{t("deadline")}</Text>
            <Pressable
              onPress={() => setShowDeadlinePicker((prev) => !prev)}
              style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
            >
              <Text
                style={deadlineDate ? [styles.inputText, { color: colors.inputText }] : [styles.placeholderText, { color: colors.placeholder }]}
              >
                {deadlineDate ? deadlineLabel : t("selectDeadline")}
              </Text>
            </Pressable>
            {showDeadlinePicker && (
              <View style={styles.pickerWrap}>
                <DateTimePicker
                  value={deadlineDate ?? new Date()}
                  mode="date"
                  display={Platform.OS === "ios" ? "inline" : "default"}
                  onChange={onDeadlineChange}
                />
              </View>
            )}

            <Text style={[styles.label, styles.sectionSpacing, { color: colors.text }]}>
              {t("importance")}
            </Text>
            <View style={styles.priorityRow}>
              <Pressable
                onPress={() => setImportant((prev) => !prev)}
                style={[
                  styles.priorityChip,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  important && [styles.priorityChipActive, { backgroundColor: colors.primary, borderColor: colors.primary }],
                ]}
              >
                <Text
                  style={[
                    styles.priorityChipText,
                    { color: colors.textSecondary },
                    important && [styles.priorityChipTextActive, { color: colors.primaryText }],
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
              pressed && styles.createButtonPressed,
            ]}
          >
            {loading ? (
              <ActivityIndicator color={colors.primaryText} />
            ) : (
              <Text style={[styles.createButtonText, { color: colors.primaryText }]}>{t("createTask")}</Text>
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
  inputText: {
    fontSize: 15,
  },
  placeholderText: {
    fontSize: 15,
  },
  pickerWrap: {
    marginTop: 8,
  },
  sectionSpacing: {
    marginTop: 14,
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
  priorityChipActive: {},
  priorityChipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  priorityChipTextActive: {},
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
