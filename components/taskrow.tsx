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
  return (
    <View>
      {sections.map((section, sectionIndex) => (
        <View key={section.title ?? `section-${sectionIndex}`}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeader}>{section.title}</Text>
            <Pressable>
              <Text
                style={{ fontWeight: "500", fontSize: 16, color: "#8C8C8C" }}
              >
                See All
              </Text>
            </Pressable>
          </View>

          <View style={styles.tasksColumn}>
            {section.data.map((item, idx) => (
              <Pressable
                key={item.id}
                onPress={() => onTaskPress(item)}
                style={styles.taskRow}
              >
                <Text style={{ fontSize: 16, fontWeight: "600" }}>
                  {item.title}
                </Text>
                <Text style={{ fontSize: 14, color: "#767676", marginTop: 4 }}>
                  {item.description}
                </Text>
                <View
                  style={{
                    justifyContent: "space-between",
                    width: "100%",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  {(item.deadline || item.important) && (
                    <View
                      style={{
                        flexDirection: "row",
                        marginTop: 8,
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      {item.deadline && (
                        <View style={styles.deadlineIndicator}>
                          <CalendarIcon size={16} color="#4FBE79" />
                          <Text
                            style={{
                              fontSize: 12,
                              fontWeight: "600",
                              color: "#4FBE79",
                            }}
                          >
                            {item.deadline}
                          </Text>
                        </View>
                      )}

                      {item.important && (
                        <View style={styles.importantIndicator}>
                          <FlagIcon size={16} color="#FF8223" />
                          <Text
                            style={{
                              fontSize: 12,
                              fontWeight: "600",
                              color: "#FF8223",
                            }}
                          >
                            Important
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                  <Pressable onPress={() => console.log("More options")}>
                    <MoreHorizontalIcon />
                  </Pressable>
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
    display: "flex",
    width: "auto",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
  },
  sectionHeader: {
    fontSize: 24,
    fontWeight: "600",
  },
  tasksColumn: {
    display: "flex",
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 16,
    marginHorizontal: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 1, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  taskRow: {
    paddingVertical: 8,
  },

  deadlineIndicator: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#EDFAF1",
    borderRadius: 16,
    gap: 4,
  },

  importantIndicator: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#FFF4E7",
    borderRadius: 16,
    gap: 4,
  },
});
