import CalendarIcon from "@/assets/icons/CalendarIcon";
import FlagIcon from "@/assets/icons/FlagIcon";
import MoreHorizontalIcon from "@/assets/icons/MoreHorizontalIcon";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Separator } from "./separator";

type Task = {
  id: string;
  title: string;
  description?: string;
  deadline?: string;
  important?: boolean;
};

export function TaskItem({
  task,
  onPress,
  showSeparator = false,
}: {
  task: Task;
  onPress: (task: Task) => void;
  showSeparator?: boolean;
}) {
  return (
    <View style={{ paddingVertical: 4 }}>
      <Pressable onPress={() => onPress(task)} style={styles.taskRow}>
        <View>
          <Text style={styles.title}>{task.title}</Text>
          {!!task.description && (
            <Text style={styles.desc}>{task.description}</Text>
          )}
        </View>

        <View style={styles.bottomRow}>
          {(task.deadline || task.important) && (
            <View style={styles.badgesRow}>
              {task.deadline && (
                <View style={styles.deadlineIndicator}>
                  <CalendarIcon size={16} color="#4FBE79" />
                  <Text style={styles.deadlineText}>{task.deadline}</Text>
                </View>
              )}

              {task.important && (
                <View style={styles.importantIndicator}>
                  <FlagIcon size={16} color="#FF8223" />
                  <Text style={styles.importantText}>Important</Text>
                </View>
              )}
            </View>
          )}

          <Pressable onPress={() => onPress(task)} hitSlop={10}>
            <MoreHorizontalIcon />
          </Pressable>
        </View>
      </Pressable>

      {showSeparator && <Separator />}
    </View>
  );
}

const styles = StyleSheet.create({
  taskRow: { paddingVertical: 8, gap: 8 },
  title: { fontSize: 16, fontWeight: "600" },
  desc: { fontSize: 14, color: "#767676", marginTop: 4 },
  bottomRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  badgesRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  deadlineIndicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#EDFAF1",
    borderRadius: 16,
    gap: 4,
  },
  importantIndicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#FFF4E7",
    borderRadius: 16,
    gap: 4,
  },
  deadlineText: { fontSize: 12, fontWeight: "600", color: "#4FBE79" },
  importantText: { fontSize: 12, fontWeight: "600", color: "#FF8223" },
});
