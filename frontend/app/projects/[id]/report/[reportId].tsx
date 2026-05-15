import ArrowLeftIcon from "@/assets/icons/ArrowLeftIcon";
import AddPlusIcon from "@/assets/icons/AddPlusIcon";
import { DocumentItem } from "@/components/documentitem";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  getReport,
  getMembers,
  addReportComment,
  addReportAttachment,
  type ReportDetail,
  type Member,
} from "@/services/api";
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
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function ReportDetailScreen() {
  const { id, reportId } = useLocalSearchParams<{
    id?: string;
    reportId?: string;
  }>();
  const projectId = Number(id);
  const rId = Number(reportId);
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();

  const [report, setReport] = useState<ReportDetail | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [r, m] = await Promise.all([
        getReport(projectId, rId),
        getMembers(projectId),
      ]);
      setReport(r);
      setMembers(m);
    } catch (e: any) {
      Alert.alert(t("error"), e.message);
    } finally {
      setLoading(false);
    }
  }, [projectId, rId, t]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const getMemberName = (authorId: number) => {
    const m = members.find((x) => x.userId === authorId);
    return m?.fullName || "Unknown";
  };

  const handleSendComment = async () => {
    if (!commentText.trim()) return;
    setSending(true);
    try {
      await addReportComment(projectId, rId, commentText.trim());
      setCommentText("");
      load();
    } catch (e: any) {
      Alert.alert(t("error"), e.message);
    } finally {
      setSending(false);
    }
  };

  const handleAttach = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "*/*" });
      if (result.canceled) return;
      const asset = result.assets[0];
      setUploading(true);
      await addReportAttachment(projectId, rId, {
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType || "application/octet-stream",
      });
      load();
    } catch (e: any) {
      Alert.alert(t("error"), e.message);
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const timeAgo = (dateStr: string) => {
    const diffDays = Math.floor(
      (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays === 0) return "Uploaded today";
    if (diffDays === 1) return "Uploaded yesterday";
    return `Uploaded ${diffDays} days ago`;
  };

  if (loading) {
    return (
      <View
        style={[
          styles.screen,
          {
            backgroundColor: colors.background,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!report) return null;

  const author = getMemberName(report.authorId);
  const initial = author.charAt(0).toUpperCase();

  const attachmentDocs = report.attachments.map((a) => ({
    id: String(a.id),
    title: a.fileName,
    size: formatFileSize(a.fileSize),
    uploadedAt: timeAgo(a.createdAt),
    ipfsHash: a.ipfsHash,
  }));

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={[styles.screen, { backgroundColor: colors.background }]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerRow}>
              <Pressable onPress={() => router.back()}>
                <ArrowLeftIcon color={colors.text} />
              </Pressable>
              <Text style={[styles.pageTitle, { color: colors.text }]}>
                {t("reports")}
              </Text>
            </View>

            {/* Report card */}
            <View style={[styles.reportCard, { backgroundColor: colors.card }]}>
              {/* Author row */}
              <View style={styles.authorRow}>
                <View
                  style={[styles.authorAvatar, { backgroundColor: colors.avatarBg }]}
                >
                  <Text
                    style={{ fontSize: 16, fontWeight: "700", color: colors.avatarText }}
                  >
                    {initial}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>
                    {author}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                    {formatDate(report.createdAt)}
                  </Text>
                </View>
              </View>

              {/* Title */}
              <Text style={[styles.reportTitle, { color: colors.text }]}>
                {report.title}
              </Text>

              {/* Content */}
              <Text
                style={{
                  fontSize: 15,
                  lineHeight: 24,
                  color: colors.textSecondary,
                  marginTop: 8,
                }}
              >
                {report.content}
              </Text>
            </View>

            {/* Attachments */}
            <View style={styles.sectionRow}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t("documents")} ({report.attachments.length})
              </Text>
              <Pressable
                onPress={handleAttach}
                disabled={uploading}
                style={[styles.attachButton, { backgroundColor: colors.card }]}
              >
                {uploading ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <>
                    <AddPlusIcon height={20} width={20} color={colors.text} />
                    <Text
                      style={{ fontSize: 13, fontWeight: "600", color: colors.text }}
                    >
                      Attach
                    </Text>
                  </>
                )}
              </Pressable>
            </View>

            {attachmentDocs.length > 0 ? (
              <View style={{ marginTop: 8 }}>
                {attachmentDocs.map((doc) => (
                  <DocumentItem
                    key={doc.id}
                    document={doc}
                    onPress={() =>
                      Linking.openURL(
                        `https://gateway.pinata.cloud/ipfs/${doc.ipfsHash}`,
                      )
                    }
                  />
                ))}
              </View>
            ) : (
              <Text
                style={{
                  fontSize: 13,
                  color: colors.textTertiary,
                  marginTop: 12,
                  textAlign: "center",
                }}
              >
                No attachments yet
              </Text>
            )}

            {/* Comments */}
            <Text
              style={[styles.sectionTitle, { color: colors.text, marginTop: 28 }]}
            >
              Comments ({report.comments.length})
            </Text>

            {report.comments.length === 0 && (
              <Text
                style={{
                  fontSize: 13,
                  color: colors.textTertiary,
                  marginTop: 12,
                  textAlign: "center",
                }}
              >
                No comments yet. Be the first to comment!
              </Text>
            )}

            {report.comments.map((c) => {
              const cAuthor = getMemberName(c.authorId);
              return (
                <View
                  key={c.id}
                  style={[styles.commentCard, { backgroundColor: colors.card }]}
                >
                  <View style={styles.commentHeader}>
                    <View
                      style={[
                        styles.commentAvatar,
                        { backgroundColor: colors.avatarBg },
                      ]}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "700",
                          color: colors.avatarText,
                        }}
                      >
                        {cAuthor.charAt(0)}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color: colors.text,
                        }}
                      >
                        {cAuthor}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 11, color: colors.textTertiary }}>
                      {formatDate(c.createdAt)}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 14,
                      lineHeight: 20,
                      color: colors.text,
                      marginTop: 8,
                    }}
                  >
                    {c.text}
                  </Text>
                </View>
              );
            })}

            {/* Spacer for input bar */}
            <View style={{ height: 80 }} />
          </View>
        </ScrollView>

        {/* Comment input bar */}
        <View
          style={[
            styles.inputBar,
            { backgroundColor: colors.card, borderTopColor: colors.border },
          ]}
        >
          <TextInput
            value={commentText}
            onChangeText={setCommentText}
            placeholder="Write a comment..."
            placeholderTextColor={colors.placeholder}
            style={[
              styles.input,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.border,
                color: colors.inputText,
              },
            ]}
            multiline
          />
          <Pressable
            onPress={handleSendComment}
            disabled={sending || !commentText.trim()}
            style={[
              styles.sendBtn,
              {
                backgroundColor: colors.primary,
                opacity: commentText.trim() ? 1 : 0.35,
              },
            ]}
          >
            {sending ? (
              <ActivityIndicator size="small" color={colors.primaryText} />
            ) : (
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: colors.primaryText,
                }}
              >
                Send
              </Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { paddingBottom: 20 },
  container: { marginTop: 100, marginHorizontal: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  pageTitle: { fontSize: 32, fontWeight: "700" },

  reportCard: {
    marginTop: 20,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  reportTitle: {
    fontSize: 22,
    fontWeight: "700",
  },

  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
  },
  sectionTitle: { fontSize: 18, fontWeight: "600" },
  attachButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },

  commentCard: {
    marginTop: 10,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  commentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingBottom: 34,
    borderTopWidth: 0.5,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
  },
  sendBtn: {
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
});
