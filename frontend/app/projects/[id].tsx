import AddPlusIcon from "@/assets/icons/AddPlusIcon";
import ArrowLeftIcon from "@/assets/icons/ArrowLeftIcon";
import NewTaskIcon from "@/assets/icons/NewTaskIcon";
import FileBlankIcon from "@/assets/icons/FileBlankIcon";
import { DocumentList } from "@/components/documentlist";
import { ParticipantList } from "@/components/participantlist";
import { TaskItem } from "@/components/taskitem";
import { TaskPopup } from "@/components/TaskPopup";
import SignaturePopup from "@/components/signaturepopup";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  deleteFile,
  deleteTask,
  getFiles,
  getMembers,
  getProject,
  getReports,
  getTasks,
  updateTask,
  uploadFile,
  createReport,
  signNda,
  inviteMember,
  getNdaAccess,
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
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [projectName, setProjectName] = useState(name || "Project");
  const [projectDescription, setProjectDescription] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [active, setActive] = useState<Filter>("All");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showNdaSign, setShowNdaSign] = useState(false);
  const [ndaToken, setNdaToken] = useState<string | null>(null);
  const [signingNda, setSigningNda] = useState(false);

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

  const handleTaskPress = (task: { id: string; status?: string; title?: string; description?: string; deadline?: string; important?: boolean }) => {
    setSelectedTask(task);
  };

  const handleChangeStatus = async (taskId: string, status: string) => {
    try {
      await updateTask(projectId, Number(taskId), { status });
      loadData();
    } catch (e: any) {
      Alert.alert(t("error"), e.message);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(projectId, Number(taskId));
      loadData();
    } catch (e: any) {
      Alert.alert(t("error"), e.message);
    }
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
      Alert.alert(t("error"), e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCreateReport = async () => {
    if (!reportTitle) {
      Alert.alert(t("error"), t("taskTitleRequired"));
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
      Alert.alert(t("error"), e.message);
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

  const currentMember = members.find((m) => m.userId === user?.id);
  const isOwnerOrManager = currentMember?.role === "owner" || currentMember?.role === "manager";
  const ndaSigned = currentMember?.ndaSigned ?? false;

  const handleStartNdaSign = async () => {
    try {
      // Owner generates invite token for self-signing
      const res = await inviteMember(projectId);
      // Claim it
      const { claimInvite } = await import("@/services/api");
      await claimInvite(projectId, res.token);
      setNdaToken(res.token);
      setShowNdaSign(true);
    } catch (e: any) {
      Alert.alert(t("error"), e.message);
    }
  };

  const handleNdaSignSubmit = async (svgPaths: string[]) => {
    if (!ndaToken) return;
    setSigningNda(true);
    try {
      const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200">${svgPaths.map((d) => `<path d="${d}" stroke="#000" stroke-width="2" fill="none"/>`).join("")}</svg>`;
      const signatureBase64 = btoa(svgContent);
      await signNda(projectId, ndaToken, signatureBase64);
      setShowNdaSign(false);
      setNdaToken(null);
      Alert.alert("Success", "NDA signed successfully!");
      loadData();
    } catch (e: any) {
      Alert.alert(t("error"), e.message);
    } finally {
      setSigningNda(false);
    }
  };

  const participants = members.map((m) => ({
    id: String(m.userId),
    name: m.fullName,
    email: m.email,
    role: m.role,
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
          { justifyContent: "center", alignItems: "center", backgroundColor: colors.background },
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
        style={[styles.background, { backgroundColor: colors.background }]}
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
              <ArrowLeftIcon color={colors.text} />
            </Pressable>
            <Text style={[styles.projectName, { color: colors.text }]}>{projectName}</Text>
          </View>
          <SegmentedControl
            values={[t("general"), t("tasks"), t("documents")]}
            selectedIndex={selectedIndex}
            onChange={(event) => {
              setSelectedIndex(event.nativeEvent.selectedSegmentIndex);
            }}
            fontStyle={[styles.segmentedControlFont, { color: colors.textSecondary }]}
            activeFontStyle={styles.segmentedControlActiveFont}
            style={[styles.segmentedControl, { borderRadius: 0 }]}
            tabStyle={{ borderRadius: 1 }}
          />
          {/* ── NDA Banner ── */}
          {!ndaSigned && currentMember && (
            <View style={[styles.ndaBanner, { backgroundColor: "#FF8223" + "20", borderColor: "#FF8223" }]}>
              <Text style={{ fontSize: 15, fontWeight: "600", color: "#FF8223" }}>
                You have not signed the NDA yet
              </Text>
              <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4 }}>
                Sign the NDA to access tasks, files and reports
              </Text>
              <Pressable
                onPress={handleStartNdaSign}
                style={[styles.ndaSignButton, { backgroundColor: "#FF8223" }]}
              >
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#FFF" }}>
                  Sign NDA
                </Text>
              </Pressable>
            </View>
          )}

          {/* ── General Tab ── */}
          {selectedIndex === 0 && (
            <View>
              <View style={[styles.descriptionContainer, { backgroundColor: colors.card }]}>
                <View style={styles.headerRow}>
                  <ArrowLeftIcon color={colors.text} />
                  <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text }}>
                    {t("projectDescription")}
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.textTertiary,
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
                <Text style={{ fontSize: 20, fontWeight: "600", color: colors.text }}>
                  {t("participants")}
                </Text>
                {isOwnerOrManager && (
                  <Pressable
                    onPress={() => {
                      router.push({
                        pathname: "/projects/[id]/add-participant",
                        params: { id: id ?? "projectId", name: projectName },
                      });
                    }}
                  >
                    <View style={[styles.addParticipantButton, { backgroundColor: colors.card }]}>
                      <AddPlusIcon height={24} width={24} color={colors.text} />
                      <Text style={{ fontSize: 14, fontWeight: "500", color: colors.text }}>
                        {t("addParticipant")}
                      </Text>
                    </View>
                  </Pressable>
                )}
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
                <Text style={{ fontSize: 20, fontWeight: "600", color: colors.text }}>{t("reports")}</Text>
                <Pressable onPress={() => setShowReportForm(!showReportForm)}>
                  <View style={[styles.addParticipantButton, { backgroundColor: colors.card }]}>
                    <AddPlusIcon height={24} width={24} color={colors.text} />
                    <Text style={{ fontSize: 14, fontWeight: "500", color: colors.text }}>
                      {t("newReport")}
                    </Text>
                  </View>
                </Pressable>
              </View>

              {showReportForm && (
                <View style={[styles.reportForm, { backgroundColor: colors.card }]}>
                  <TextInput
                    value={reportTitle}
                    onChangeText={setReportTitle}
                    placeholder="Report title"
                    placeholderTextColor={colors.placeholder}
                    style={[styles.reportInput, { borderColor: colors.border, color: colors.inputText }]}
                  />
                  <TextInput
                    value={reportContent}
                    onChangeText={setReportContent}
                    placeholder="Report content"
                    placeholderTextColor={colors.placeholder}
                    style={[styles.reportInput, { minHeight: 80, borderColor: colors.border, color: colors.inputText }]}
                    multiline
                    textAlignVertical="top"
                  />
                  <Pressable
                    onPress={handleCreateReport}
                    style={[styles.reportSubmit, { backgroundColor: colors.primary }]}
                  >
                    <Text style={{ color: colors.primaryText, fontWeight: "600" }}>
                      {t("submitReport")}
                    </Text>
                  </Pressable>
                </View>
              )}

              {reports.length > 0 && (
                <View style={[styles.reportsContainer, { backgroundColor: colors.card }]}>
                  {reports.map((r) => (
                    <View key={r.id} style={[styles.reportItem, { borderBottomColor: colors.border }]}>
                      <Text style={{ fontWeight: "600", fontSize: 15, color: colors.text }}>
                        {r.title}
                      </Text>
                      <Text
                        style={{ color: colors.textTertiary, fontSize: 13, marginTop: 4 }}
                      >
                        {r.content}
                      </Text>
                      <Text
                        style={{ color: colors.textSecondary, fontSize: 11, marginTop: 4 }}
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
                          : colors.card,
                        backgroundColor: colors.card,
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
                          color: colors.text,
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

              <View style={[styles.tasksContainer, { backgroundColor: colors.card }]}>
                {visibleTasks.map((task, idx) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    showSeparator={idx < visibleTasks.length - 1}
                    onPress={() => handleTaskPress(task)}
                  />
                ))}
                {visibleTasks.length === 0 && (
                  <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
                    {t("noTasks")}
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
                  style={[styles.addParticipantButton, { backgroundColor: colors.card }]}
                >
                  {uploading ? (
                    <ActivityIndicator size="small" />
                  ) : (
                    <>
                      <AddPlusIcon height={24} width={24} color={colors.text} />
                      <Text style={{ fontSize: 14, fontWeight: "500", color: colors.text }}>
                        {t("uploadFile")}
                      </Text>
                    </>
                  )}
                </Pressable>
              </View>
              <DocumentList
                documents={documents}
                onPressDocument={handleDocumentPress}
                onDeleteDocument={async (doc) => {
                  try {
                    await deleteFile(projectId, Number(doc.id));
                    loadData();
                  } catch (e: any) {
                    Alert.alert(t("error"), e.message);
                  }
                }}
              />
              {documents.length === 0 && (
                <Text
                  style={[styles.emptyText, { textAlign: "center", marginTop: 24, color: colors.textTertiary }]}
                >
                  {t("noDocuments")}
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
          <GlassView style={[styles.fabButton, { shadowColor: colors.shadow }]} isInteractive>
            <AddPlusIcon color={colors.text} />
          </GlassView>
        </Pressable>
      )}
      {isMenuOpen ? (
        <View style={[styles.menuCard, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
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
            <NewTaskIcon color={colors.text} />
            <Text style={[styles.menuItemText, { color: colors.text }]}>{t("createNewTask")}</Text>
          </Pressable>
        </View>
      ) : null}
      <SignaturePopup
        visible={showNdaSign}
        projectName={projectName}
        onClose={() => { setShowNdaSign(false); setNdaToken(null); }}
        onSubmit={handleNdaSignSubmit}
      />
      <TaskPopup
        task={selectedTask}
        visible={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onChangeStatus={handleChangeStatus}
        onDelete={handleDeleteTask}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  background: { flex: 1 },
  container: { flex: 1, marginTop: 100, marginHorizontal: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  projectName: { fontSize: 32, fontWeight: "bold" },
  segmentedControl: { height: 48, marginTop: 24, width: "100%" },
  segmentedControlFont: { fontSize: 16, fontWeight: "700" },
  segmentedControlActiveFont: { fontSize: 16, fontWeight: "700" },
  descriptionContainer: {
    width: "100%",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 24,
    gap: 4,
  },
  tasksContainer: {
    marginTop: 16,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 24,
  },
  emptyText: { paddingVertical: 12, fontSize: 14, fontWeight: "500" },
  addParticipantButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  fabAnchor: { position: "absolute", right: 16, bottom: 24, zIndex: 20 },
  fabButton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 180,
    padding: 12,
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
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 170,
    zIndex: 11,
    shadowOffset: { width: 1, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 12 },
  menuItemText: { fontSize: 15, fontWeight: "600" },
  reportForm: {
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  reportInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  reportSubmit: {
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 12,
  },
  reportsContainer: {
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 24,
  },
  reportItem: {
    borderBottomWidth: 0.5,
    paddingBottom: 12,
  },
  ndaBanner: {
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  ndaSignButton: {
    marginTop: 12,
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 12,
  },
});
