import AddPlusIcon from "@/assets/icons/AddPlusIcon";
import ArrowLeftIcon from "@/assets/icons/ArrowLeftIcon";
import NewTaskIcon from "@/assets/icons/NewTaskIcon";
import FileBlankIcon from "@/assets/icons/FileBlankIcon";
import { DocumentList } from "@/components/documentlist";
import { ParticipantList } from "@/components/participantlist";
import { TaskItem } from "@/components/taskitem";
import {
  deleteTask,
  getFiles,
  getMembers,
  getProject,
  getReports,
  getTasks,
  updateTask,
  uploadFile,
  createReport,
  type FileItem,
  type Member,
  type Report,
  type Task,
} from "@/services/api";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { GlassView } from "expo-glass-effect";
import * as DocumentPicker from "expo-document-picker";
import {
  router,
  Stack,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

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

const STATUS_MAP: Record<string, Filter> = {
  in_progress: "In Progress",
  not_started: "Not Started",
  done: "Done",
  missed: "Missed",
};

const REVERSE_STATUS: Record<string, string> = {
  "In Progress": "in_progress",
  "Not Started": "not_started",
  Done: "done",
  Missed: "missed",
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Uploaded today";
  if (diffDays === 1) return "Uploaded yesterday";
  return `Uploaded ${diffDays} days ago`;
}

export default function ProjectDetails() {
  const { id, name } = useLocalSearchParams<{ id?: string; name?: string }>();
  const projectId = Number(id);
  const [projectName, setProjectName] = useState(name || "Project");
  const [projectDescription, setProjectDescription] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [active, setActive] = useState<Filter>("All");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Report form
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportTitle, setReportTitle] = useState("");
  const [reportContent, setReportContent] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [proj, membersData] = await Promise.all([
        getProject(projectId),
        getMembers(projectId),
      ]);
      setProjectName(proj.name);
      setProjectDescription(proj.description || "");
      setMembers(membersData);

      try {
        const [tasksData, filesData, reportsData] = await Promise.all([
          getTasks(projectId),
          getFiles(projectId),
          getReports(projectId),
        ]);
        setTasks(tasksData);
        setFiles(filesData);
        setReports(reportsData);
      } catch {
        // User may not have NDA signed yet
      }
    } catch (e) {
      console.warn("Failed to load project", e);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const handleTaskPress = (task: { id: string; status?: string }) => {
    const currentStatus = task.status || "Not Started";
    const statuses = ["Not Started", "In Progress", "Done", "Missed"];

    Alert.alert("Task Actions", `Status: ${currentStatus}`, [
      ...statuses
        .filter((s) => s !== currentStatus)
        .map((s) => ({
          text: `Mark as ${s}`,
          onPress: async () => {
            try {
              await updateTask(projectId, Number(task.id), {
                status: REVERSE_STATUS[s],
              });
              loadData();
            } catch (e: any) {
              Alert.alert("Error", e.message);
            }
          },
        })),
      {
        text: "Delete",
        style: "destructive" as const,
        onPress: () => {
          Alert.alert("Delete task?", "This cannot be undone.", [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete",
              style: "destructive",
              onPress: async () => {
                try {
                  await deleteTask(projectId, Number(task.id));
                  loadData();
                } catch (e: any) {
                  Alert.alert("Error", e.message);
                }
              },
            },
          ]);
        },
      },
      { text: "Cancel", style: "cancel" as const },
    ]);
  };

  const handleDocumentPress = (doc: { id: string; title: string }) => {
    const file = files.find((f) => String(f.id) === doc.id);
    if (file?.ipfsHash) {
      const url = `https://gateway.pinata.cloud/ipfs/${file.ipfsHash}`;
      Linking.openURL(url);
    }
  };

  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "*/*" });
      if (result.canceled) return;
      const asset = result.assets[0];
      setUploading(true);
      await uploadFile(projectId, {
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType || "application/octet-stream",
      });
      loadData();
    } catch (e: any) {
      Alert.alert("Upload failed", e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCreateReport = async () => {
    if (!reportTitle) {
      Alert.alert("Error", "Report title is required");
      return;
    }
    try {
      await createReport(projectId, {
        title: reportTitle,
        content: reportContent,
      });
      setReportTitle("");
      setReportContent("");
      setShowReportForm(false);
      loadData();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  const taskRows = tasks.map((t) => {
    const uiStatus = STATUS_MAP[t.status] || "Not Started";
    return {
      id: String(t.id),
      title: t.title,
      description: t.description || undefined,
      deadline: t.deadline
        ? new Date(t.deadline).toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
          })
        : undefined,
      important: t.important,
      status: uiStatus as Filter,
    };
  });

  const visibleTasks =
    active === "All"
      ? taskRows
      : active === "High Priority"
        ? taskRows.filter((t) => t.important)
        : taskRows.filter((t) => t.status === active);

  const participants = members.map((m) => ({
    id: String(m.userId),
    name: m.fullName,
    email: m.email,
  }));

  const documents = files.map((f) => ({
    id: String(f.id),
    title: f.fileName,
    size: formatFileSize(f.fileSize),
    uploadedAt: timeAgo(f.createdAt),
  }));

  if (loading) {
    return (
      <View
        style={[
          styles.screen,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

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
          {/* ── General Tab ── */}
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
                  {projectDescription || "No description provided."}
                </Text>
              </View>
              <View
                style={{
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
                  participants={participants}
                  onPressParticipant={() => {}}
                />
              </View>

              {/* Reports section */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: 24,
                }}
              >
                <Text style={{ fontSize: 20, fontWeight: "600" }}>Reports</Text>
                <Pressable onPress={() => setShowReportForm(!showReportForm)}>
                  <View style={styles.addParticipantButton}>
                    <AddPlusIcon height={24} width={24} />
                    <Text style={{ fontSize: 14, fontWeight: "500" }}>
                      New Report
                    </Text>
                  </View>
                </Pressable>
              </View>

              {showReportForm && (
                <View style={styles.reportForm}>
                  <TextInput
                    value={reportTitle}
                    onChangeText={setReportTitle}
                    placeholder="Report title"
                    placeholderTextColor="#9A9A9A"
                    style={styles.reportInput}
                  />
                  <TextInput
                    value={reportContent}
                    onChangeText={setReportContent}
                    placeholder="Report content"
                    placeholderTextColor="#9A9A9A"
                    style={[styles.reportInput, { minHeight: 80 }]}
                    multiline
                    textAlignVertical="top"
                  />
                  <Pressable
                    onPress={handleCreateReport}
                    style={styles.reportSubmit}
                  >
                    <Text style={{ color: "#FFF", fontWeight: "600" }}>
                      Submit Report
                    </Text>
                  </Pressable>
                </View>
              )}

              {reports.length > 0 && (
                <View style={styles.reportsContainer}>
                  {reports.map((r) => (
                    <View key={r.id} style={styles.reportItem}>
                      <Text style={{ fontWeight: "600", fontSize: 15 }}>
                        {r.title}
                      </Text>
                      <Text
                        style={{ color: "#767676", fontSize: 13, marginTop: 4 }}
                      >
                        {r.content}
                      </Text>
                      <Text
                        style={{ color: "#AAAAAA", fontSize: 11, marginTop: 4 }}
                      >
                        {new Date(r.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
          {/* ── Tasks Tab ── */}
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
                      />
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
                    onPress={() => handleTaskPress(task)}
                  />
                ))}
                {visibleTasks.length === 0 && (
                  <Text style={styles.emptyText}>
                    No tasks for this filter
                  </Text>
                )}
              </View>
            </>
          )}
          {/* ── Documents Tab ── */}
          {selectedIndex === 2 && (
            <View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  marginTop: 16,
                }}
              >
                <Pressable
                  onPress={handleFileUpload}
                  disabled={uploading}
                  style={styles.addParticipantButton}
                >
                  {uploading ? (
                    <ActivityIndicator size="small" />
                  ) : (
                    <>
                      <AddPlusIcon height={24} width={24} />
                      <Text style={{ fontSize: 14, fontWeight: "500" }}>
                        Upload File
                      </Text>
                    </>
                  )}
                </Pressable>
              </View>
              <DocumentList
                documents={documents}
                onPressDocument={handleDocumentPress}
              />
              {documents.length === 0 && (
                <Text
                  style={[styles.emptyText, { textAlign: "center", marginTop: 24 }]}
                >
                  No documents yet
                </Text>
              )}
            </View>
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
  screen: { flex: 1 },
  background: { flex: 1, backgroundColor: "#F2F2F2" },
  container: { flex: 1, marginTop: 100, marginHorizontal: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  projectName: { fontSize: 32, fontWeight: "bold" },
  segmentedControl: { height: 48, marginTop: 24, width: "100%" },
  segmentedControlFont: { fontSize: 16, fontWeight: "700", color: "#616161" },
  segmentedControlActiveFont: { fontSize: 16, fontWeight: "700" },
  descriptionContainer: {
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
  emptyText: { paddingVertical: 12, color: "#767676", fontSize: 14, fontWeight: "500" },
  addParticipantButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  fabAnchor: { position: "absolute", right: 16, bottom: 24, zIndex: 20 },
  fabButton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 180,
    padding: 12,
    shadowColor: "#000",
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
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 12 },
  menuItemText: { fontSize: 15, fontWeight: "600" },
  reportForm: {
    marginTop: 12,
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  reportInput: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111",
  },
  reportSubmit: {
    backgroundColor: "#111",
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 12,
  },
  reportsContainer: {
    marginTop: 12,
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 24,
  },
  reportItem: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E5E5",
    paddingBottom: 12,
  },
});
