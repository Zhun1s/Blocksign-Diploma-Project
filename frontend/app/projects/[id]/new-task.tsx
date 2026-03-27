import ArrowLeftIcon from "@/assets/icons/ArrowLeftIcon";
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
      Alert.alert("Error", "Task title is required");
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
      Alert.alert("Error", e.message || "Failed to create task");
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
            <Text style={styles.pageTitle}>Create New Task</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Project</Text>
            <Text style={styles.projectName}>{projectName}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Task Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Enter task title"
              placeholderTextColor="#9A9A9A"
              style={styles.input}
            />

            <Text style={[styles.label, styles.sectionSpacing]}>
              Description
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Task details"
              placeholderTextColor="#9A9A9A"
              style={[styles.input, styles.multilineInput]}
              multiline
              textAlignVertical="top"
            />

            <Text style={[styles.label, styles.sectionSpacing]}>Deadline</Text>
            <Pressable
              onPress={() => setShowDeadlinePicker((prev) => !prev)}
              style={styles.input}
            >
              <Text
                style={deadlineDate ? styles.inputText : styles.placeholderText}
              >
                {deadlineDate ? deadlineLabel : "Select deadline date"}
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

            <Text style={[styles.label, styles.sectionSpacing]}>
              Importance
            </Text>
            <View style={styles.priorityRow}>
              <Pressable
                onPress={() => setImportant((prev) => !prev)}
                style={[
                  styles.priorityChip,
                  important && styles.priorityChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.priorityChipText,
                    important && styles.priorityChipTextActive,
                  ]}
                >
                  Important
                </Text>
              </Pressable>
            </View>
          </View>

          <Pressable
            onPress={onCreateTask}
            disabled={loading}
            style={({ pressed }) => [
              styles.createButton,
              pressed && styles.createButtonPressed,
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.createButtonText}>Create Task</Text>
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
  projectName: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: "600",
    color: "#111111",
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
  inputText: {
    fontSize: 15,
    color: "#111111",
  },
  placeholderText: {
    fontSize: 15,
    color: "#9A9A9A",
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
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDDDDD",
  },
  priorityChipActive: {
    backgroundColor: "#111111",
    borderColor: "#111111",
  },
  priorityChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333333",
  },
  priorityChipTextActive: {
    color: "#FFFFFF",
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
