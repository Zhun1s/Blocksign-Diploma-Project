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

function parseDeadline(raw: string): { day: string; month: string; isOverdue: boolean; isToday: boolean; isTomorrow: boolean; label: string } {
  // Handle pre-formatted strings like "Today", "Tomorrow", "Apr 1"
  const lower = raw.toLowerCase();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (lower === "today") {
    return { day: String(today.getDate()), month: today.toLocaleDateString("en-US", { month: "short" }), isOverdue: false, isToday: true, isTomorrow: false, label: "Today" };
  }
  if (lower === "tomorrow") {
    return { day: String(tomorrow.getDate()), month: tomorrow.toLocaleDateString("en-US", { month: "short" }), isOverdue: false, isToday: false, isTomorrow: true, label: "Tomorrow" };
  }

  // Try parsing as date
  const d = new Date(raw);
  if (!isNaN(d.getTime())) {
    d.setHours(0, 0, 0, 0);
    const isOverdue = d < today;
    const isToday = d.getTime() === today.getTime();
    const isTomorrow = d.getTime() === tomorrow.getTime();
    const day = String(d.getDate());
    const month = d.toLocaleDateString("en-US", { month: "short" });
    let label = `${month} ${day}`;
    if (isToday) label = "Today";
    else if (isTomorrow) label = "Tomorrow";
    return { day, month, isOverdue, isToday, isTomorrow, label };
  }

  // Fallback — just display raw
  return { day: "", month: raw, isOverdue: false, isToday: false, isTomorrow: false, label: raw };
}

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

  const deadline = task.deadline ? parseDeadline(task.deadline) : null;
  const deadlineColor = deadline?.isOverdue
    ? "#FF3B30"
    : deadline?.isToday
      ? "#FF8223"
      : "#4FBE79";

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

          {/* Deadline block */}
          {deadline && (
            <View style={[styles.deadlineBlock, { backgroundColor: isDark ? deadlineColor + "25" : deadlineColor + "12" }]}>
              <CalendarIcon size={14} color={deadlineColor} />
              <Text style={[styles.deadlineLabel, { color: deadlineColor }]}>
                {deadline.label}
              </Text>
              {deadline.isOverdue && (
                <View style={[styles.overdueTag, { backgroundColor: deadlineColor }]}>
                  <Text style={styles.overdueText}>Overdue</Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.badgesRow}>
            {/* Status badge */}
            {task.status && (
              <View
                style={[
                  styles.badge,
                  { backgroundColor: isDark ? statusColor + "30" : statusColor + "18" },
                ]}
              >
                <View style={[styles.dot, { backgroundColor: statusColor }]} />
                <Text style={[styles.badgeText, { color: statusColor }]}>
                  {statusLabel}
                </Text>
              </View>
            )}

            {task.important && (
              <View
                style={[
                  styles.badge,
                  { backgroundColor: isDark ? "#3A2A15" : "#FFF4E7" },
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
  deadlineBlock: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
  },
  deadlineLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
  overdueTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 2,
  },
  overdueText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFF",
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
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
  importantText: { fontSize: 12, fontWeight: "600", color: "#FF8223" },
});
