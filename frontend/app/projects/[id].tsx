import AddPlusIcon from "@/assets/icons/AddPlusIcon";
import ArrowLeftIcon from "@/assets/icons/ArrowLeftIcon";
import NewTaskIcon from "@/assets/icons/NewTaskIcon";
import { DocumentList } from "@/components/documentlist";
import { ParticipantList } from "@/components/participantlist";
import { TaskItem } from "@/components/taskitem";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { GlassView } from "expo-glass-effect";
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
  {
    id: "t5",
    title: "Prepare release notes",
    status: "Done",
    deadline: "Tommorrow",
  },
];

type Participant = {
  id: string;
  name: string;
  email?: string;
  pfpUrl?: string;
};

const mockParticipants: Participant[] = [
  { id: "u1", name: "Alice Johnson", email: "alice@example.com" },
  { id: "u2", name: "Bob Smith", email: "bob@example.com" },
  { id: "u3", name: "Charlie Brown", email: "charlie@example.com" },
];

type Document = {
  id: string;
  title: string;
  size?: string;
  uploadedAt?: string;
};

const mockDocuments: Document[] = [
  {
    id: "d1",
    title: "Product Requirements.pdf",
    size: "1.8 MB",
    uploadedAt: "Uploaded 2 days ago",
  },
  {
    id: "d2",
    title: "Team Meeting Notes.docx",
    size: "640 KB",
    uploadedAt: "Uploaded yesterday",
  },
  {
    id: "d3",
    title: "Q2 Roadmap.xlsx",
    size: "420 KB",
    uploadedAt: "Uploaded today",
  },
];

export default function ProjectDetails() {
  const { id, name } = useLocalSearchParams<{ id?: string; name?: string }>();
  const projectName = name ? `${name}` : "Project";
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [active, setActive] = useState<(typeof FILTERS)[number]>("All");
  const visibleTasks =
    active === "All"
      ? mockTasks
      : mockTasks.filter((task) => task.status === active);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.background}
      >
        <View style={styles.container}>
          {isMenuOpen ? (
            <Pressable
              onPress={() => setIsMenuOpen(false)}
              style={styles.menuBackdrop}
            />
          ) : null}
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
            <View>
              <View style={styles.descriptionContainer}>
                <View style={styles.headerRow}>
                  <ArrowLeftIcon />
                  <Text style={{ fontSize: 16, fontWeight: "600" }}>
                    Project Description
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 14,
                    color: "#767676",
                    textAlign: "justify",
                  }}
                >
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc
                  vulputate libero et velit interdum, ac aliquet odio mattis.
                </Text>
              </View>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  marginTop: 16,
                }}
              >
                <Text style={{ fontSize: 20, fontWeight: "600" }}>
                  Participants
                </Text>
                <Pressable
                  onPress={() => {
                    console.log("Add participant pressed");
                    router.push({
                      pathname: "/projects/[id]/add-participant",
                      params: { id: id ?? "projectId", name: projectName },
                    });
                  }}
                >
                  <View style={styles.addParticipantButton}>
                    <AddPlusIcon height={24} width={24} />
                    <Text style={{ fontSize: 14, fontWeight: "500" }}>
                      Add Participant
                    </Text>
                  </View>
                </Pressable>
              </View>
              <View>
                <ParticipantList
                  participants={mockParticipants}
                  onPressParticipant={(participant) => {
                    console.log("Participant pressed", participant.id);
                  }}
                />
              </View>
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
          {selectedIndex === 2 && (
            <DocumentList
              documents={mockDocuments}
              onPressDocument={(document) => {
                console.log("Document pressed", document.id);
              }}
            />
          )}
        </View>
      </ScrollView>
      {selectedIndex === 1 && (
        <Pressable
          onPress={() => setIsMenuOpen((prev) => !prev)}
          hitSlop={8}
          style={styles.fabAnchor}
        >
          <GlassView style={styles.fabButton} isInteractive>
            <AddPlusIcon />
          </GlassView>
        </Pressable>
      )}
      {isMenuOpen ? (
        <View style={styles.menuCard}>
          <Pressable
            onPress={() => {
              setIsMenuOpen(false);
              router.push({
                pathname: "/projects/[id]/new-task",
                params: { id: id ?? "projectId", name: projectName },
              });
            }}
            style={styles.menuItem}
          >
            <NewTaskIcon />
            <Text style={styles.menuItemText}>Create new task</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
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

  addParticipantButton: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#fff",
    borderRadius: 8,
  },

  fabAnchor: {
    position: "absolute",
    right: 16,
    bottom: 24,
    zIndex: 20,
  },

  fabButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 180,
    padding: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 1, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },

  menuBackdrop: {
    position: "absolute",
    top: -400,
    left: -16,
    right: -16,
    bottom: -400,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    zIndex: 10,
  },

  menuCard: {
    position: "absolute",
    right: 16,
    bottom: 90,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 170,
    zIndex: 11,
    shadowColor: "#000000",
    shadowOffset: { width: 1, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },

  menuItem: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
  },

  menuItemText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
