import CalendarIcon from "@/assets/icons/CalendarIcon";
import FlagIcon from "@/assets/icons/FlagIcon";
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
};

const STATUS_KEY: Record<string, string> = {
  "Not Started": "notStarted",
  "In Progress": "inProgress",
  Done: "done",
  Missed: "missed",
};

type TasksSection = {
  title?: string;
  data: Task[];
};

export function TasksByProjectSection({
  sections,
  onTaskPress,
  onRefresh,
  setError,
}: {
  sections: TasksSection[];
  onTaskPress: (task: Task) => void;
  onRefresh: () => void;
  setError: (message: string) => void;
  setLoading?: (loading: boolean) => void;
}) {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  return (
    <View>
      {sections.map((section, sectionIndex) => (
        <View key={section.title ?? `section-${sectionIndex}`}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionHeader, { color: colors.text }]}>{section.title}</Text>
            <Pressable>
              <Text style={{ fontWeight: "500", fontSize: 16, color: colors.textSecondary }}>
                {t("seeAll")}
              </Text>
            </Pressable>
          </View>

          <View style={[styles.tasksColumn, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
            {section.data.map((item, idx) => (
              <Pressable
                key={item.id}
                onPress={() => onTaskPress(item)}
                style={styles.taskRow}
              >
                <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text }} numberOfLines={1}>
                  {item.title}
                </Text>
                {!!item.description && (
                  <Text style={{ fontSize: 14, color: colors.textTertiary, marginTop: 2 }} numberOfLines={1}>
                    {item.description}
                  </Text>
                )}
                <View style={styles.badgesRow}>
                  {item.status && (
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: (STATUS_COLORS[item.status] || "#696969") + (isDark ? "30" : "18") },
                      ]}
                    >
                      <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: STATUS_COLORS[item.status] || "#696969" }} />
                      <Text style={{ fontSize: 12, fontWeight: "600", color: STATUS_COLORS[item.status] || "#696969" }}>
                        {STATUS_KEY[item.status] ? t(STATUS_KEY[item.status]) : item.status}
                      </Text>
                    </View>
                  )}
                  {item.deadline && (
                    <View style={[styles.badge, { backgroundColor: isDark ? "#1A3A25" : "#EDFAF1" }]}>
                      <CalendarIcon size={14} color="#4FBE79" />
                      <Text style={{ fontSize: 12, fontWeight: "600", color: "#4FBE79" }}>
                        {item.deadline}
                      </Text>
                    </View>
                  )}
                  {item.important && (
                    <View style={[styles.badge, { backgroundColor: isDark ? "#3A2A15" : "#FFF4E7" }]}>
                      <FlagIcon size={14} color="#FF8223" />
                      <Text style={{ fontSize: 12, fontWeight: "600", color: "#FF8223" }}>
                        {t("important")}
                      </Text>
                    </View>
                  )}
                </View>
                {idx < section.data.length - 1 && <Separator />}
              </Pressable>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
  },
  sectionHeader: { fontSize: 24, fontWeight: "600" },
  tasksColumn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: "column",
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 16,
    marginHorizontal: 16,
    shadowOffset: { width: 1, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  taskRow: { paddingVertical: 10, gap: 4 },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
});
