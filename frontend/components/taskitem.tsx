import CalendarIcon from "@/assets/icons/CalendarIcon";
import FlagIcon from "@/assets/icons/FlagIcon";
import MoreHorizontalIcon from "@/assets/icons/MoreHorizontalIcon";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Separator } from "./separator";

type Task = {
  id: string;
  title: string;
  description?: string;
  deadline?: string;
  important?: boolean;
  status?: string;
};

const STATUS_COLORS: Record<string, string> = {
  "Not Started": "#696969",
  "In Progress": "#07AFF8",
  Done: "#15B200",
  Missed: "#FF0000",
  "High Priority": "#FF8223",
};

const STATUS_KEY: Record<string, string> = {
  "Not Started": "notStarted",
  "In Progress": "inProgress",
  Done: "done",
  Missed: "missed",
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
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const statusColor = STATUS_COLORS[task.status || ""] || "#696969";
  const statusLabel = STATUS_KEY[task.status || ""]
    ? t(STATUS_KEY[task.status || ""])
    : task.status;

  return (
    <View style={{ paddingVertical: 4 }}>
      <Pressable onPress={() => onPress(task)} style={styles.taskRow}>
        {/* Status bar on the left */}
        <View style={[styles.statusBar, { backgroundColor: statusColor }]} />

        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {task.title}
            </Text>
            <Pressable onPress={() => onPress(task)} hitSlop={10}>
              <MoreHorizontalIcon color={colors.textSecondary} />
            </Pressable>
          </View>

          {!!task.description && (
            <Text style={[styles.desc, { color: colors.textTertiary }]} numberOfLines={2}>
              {task.description}
            </Text>
          )}

          <View style={styles.badgesRow}>
            {/* Status badge */}
            {task.status && (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: isDark
                      ? statusColor + "30"
                      : statusColor + "18",
                  },
                ]}
              >
                <View style={[styles.dot, { backgroundColor: statusColor }]} />
                <Text style={[styles.badgeText, { color: statusColor }]}>
                  {statusLabel}
                </Text>
              </View>
            )}

            {task.deadline && (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: isDark ? "#1A3A25" : "#EDFAF1",
                  },
                ]}
              >
                <CalendarIcon size={14} color="#4FBE79" />
                <Text style={styles.deadlineText}>{task.deadline}</Text>
              </View>
            )}

            {task.important && (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: isDark ? "#3A2A15" : "#FFF4E7",
                  },
                ]}
              >
                <FlagIcon size={14} color="#FF8223" />
                <Text style={styles.importantText}>{t("important")}</Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
      {showSeparator && <Separator />}
    </View>
  );
}

const styles = StyleSheet.create({
  taskRow: {
    flexDirection: "row",
    paddingVertical: 10,
    gap: 12,
    alignItems: "stretch",
  },
  statusBar: {
    width: 4,
    borderRadius: 2,
    minHeight: 40,
  },
  content: {
    flex: 1,
    gap: 6,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },
  desc: {
    fontSize: 14,
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  deadlineText: { fontSize: 12, fontWeight: "600", color: "#4FBE79" },
  importantText: { fontSize: 12, fontWeight: "600", color: "#FF8223" },
});
