import ArrowLeftIcon from "@/assets/icons/ArrowLeftIcon";
import { TaskItem } from "@/components/taskitem";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const FILTERS = [
  "All",
  "In Progress",
  "High Priority",
  "Not Started",
  "Done",
  "Missed",
] as const;

type Filter = (typeof FILTERS)[number];
const BORDER_BY_FILTER: Record<Filter, string> = {
  All: "#9CA3AF",
  "In Progress": "#07AFF8",
  "High Priority": "#FF8223",
  "Not Started": "#696969",
  Done: "#15B200",
  Missed: "#FF0000",
};

type Task = {
  id: string;
  title: string;
  description?: string;
  deadline?: string;
  important?: boolean;
  status: Filter;
};

const mockTasks: Task[] = [
  {
    id: "t1",
    title: "Create onboarding flow",
    description: "Set up first-time user screens",
    deadline: "Today",
    important: true,
    status: "In Progress",
  },
  {
    id: "t2",
    title: "Write API docs",
    description: "Document auth and project endpoints",
    deadline: "Next Week",
    status: "Not Started",
  },
  {
    id: "t3",
    title: "Fix payment retry bug",
    deadline: "Tomorrow",
    important: true,
    status: "High Priority",
  },
  {
    id: "t4",
    title: "Prepare release notes",
    status: "Done",
    deadline: "Tommorrow",
  },
];

export default function ProjectDetails() {
  const { name } = useLocalSearchParams<{ id?: string; name?: string }>();
  const projectName = name ? `${name}` : "Project";
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [active, setActive] = useState<(typeof FILTERS)[number]>("All");
  const visibleTasks =
    active === "All"
      ? mockTasks
      : mockTasks.filter((task) => task.status === active);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.background}
      >
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()}>
              <ArrowLeftIcon />
            </Pressable>
            <Text style={styles.projectName}>{projectName}</Text>
          </View>
          <SegmentedControl
            values={["General", "Tasks", "Documents"]}
            selectedIndex={selectedIndex}
            onChange={(event) => {
              setSelectedIndex(event.nativeEvent.selectedSegmentIndex);
            }}
            fontStyle={styles.segmentedControlFont}
            activeFontStyle={styles.segmentedControlActiveFont}
            style={[styles.segmentedControl, { borderRadius: 0 }]}
            tabStyle={{ borderRadius: 1 }}
          />
          {selectedIndex === 0 && (
            <View style={styles.descriptionContainer}>
              <View style={styles.headerRow}>
                <ArrowLeftIcon />
                <Text style={{ fontSize: 16, fontWeight: "600" }}>
                  Project Description
                </Text>
              </View>
              <Text
                style={{ fontSize: 14, color: "#767676", textAlign: "justify" }}
              >
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc
                vulputate libero et velit interdum, ac aliquet odio mattis.
              </Text>
            </View>
          )}
          {selectedIndex === 1 && (
            <>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginTop: 16, overflow: "visible", gap: 8 }}
              >
                {FILTERS.map((label) => {
                  const isActive = active === label;

                  return (
                    <Pressable
                      key={label}
                      onPress={() => setActive(label)}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 16,
                        justifyContent: "center",
                        borderWidth: 1,
                        borderColor: isActive
                          ? BORDER_BY_FILTER[label]
                          : "#FFF",
                        backgroundColor: "white",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                        marginRight: 4,
                      }}
                    >
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          backgroundColor: BORDER_BY_FILTER[label],
                          borderRadius: 90,
                        }}
                      ></View>
                      <Text
                        style={{
                          color: "#000000",
                          fontWeight: "600",
                          fontSize: 16,
                        }}
                      >
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <View style={styles.tasksContainer}>
                {visibleTasks.map((task, idx) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    showSeparator={idx < visibleTasks.length - 1}
                    onPress={(pressedTask) => {
                      console.log("Task pressed", pressedTask.id);
                    }}
                  />
                ))}

                {visibleTasks.length === 0 && (
                  <Text style={styles.emptyText}>No tasks for this filter</Text>
                )}
              </View>
            </>
          )}
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
  container: {
    fontFamily: "Inter",
    flex: 1,
    marginTop: 100,
    marginHorizontal: 16,
  },

  headerRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  projectName: {
    fontSize: 32,
    fontWeight: "bold",
  },

  segmentedControl: {
    height: 48,
    marginTop: 24,
    width: "100%",
  },

  segmentedControlFont: {
    fontSize: 16,
    fontWeight: "700",
    color: "#616161",
  },

  segmentedControlActiveFont: {
    fontSize: 16,
    fontWeight: "700",
  },

  descriptionContainer: {
    display: "flex",
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 24,
    gap: 4,
  },

  tasksContainer: {
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 24,
  },

  emptyText: {
    paddingVertical: 12,
    color: "#767676",
    fontSize: 14,
    fontWeight: "500",
  },
});
