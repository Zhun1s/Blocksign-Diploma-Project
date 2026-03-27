import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type TaskData = {
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

export function TaskPopup({
  task,
  visible,
  onClose,
  onChangeStatus,
  onDelete,
}: {
  task: TaskData | null;
  visible: boolean;
  onClose: () => void;
  onChangeStatus?: (taskId: string, status: string) => void;
  onDelete?: (taskId: string) => void;
}) {
  const { colors } = useTheme();
  const { t } = useLanguage();

  if (!task) return null;

  const currentStatus = task.status || "Not Started";
  const statuses = ["Not Started", "In Progress", "Done", "Missed"];
  const statusKeys: Record<string, string> = {
    "Not Started": "not_started",
    "In Progress": "in_progress",
    Done: "done",
    Missed: "missed",
  };
  const statusLabels: Record<string, string> = {
    "Not Started": t("notStarted"),
    "In Progress": t("inProgress"),
    Done: t("done"),
    Missed: t("missed"),
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: colors.card }]}>
        <View style={styles.handle} />

        <Text style={[styles.title, { color: colors.text }]}>{task.title}</Text>
        {!!task.description && (
          <Text style={[styles.description, { color: colors.textTertiary }]}>
            {task.description}
          </Text>
        )}

        {!!task.deadline && (
          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
              {t("deadline")}:
            </Text>
            <Text style={[styles.metaValue, { color: colors.text }]}>
              {task.deadline}
            </Text>
          </View>
        )}

        <View style={styles.metaRow}>
          <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
            Status:
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: (STATUS_COLORS[currentStatus] || "#696969") + "20" },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: STATUS_COLORS[currentStatus] || "#696969" },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: STATUS_COLORS[currentStatus] || "#696969" },
              ]}
            >
              {statusLabels[currentStatus] || currentStatus}
            </Text>
          </View>
        </View>

        {task.important && (
          <View style={styles.metaRow}>
            <Text style={{ fontSize: 14, color: "#FF8223", fontWeight: "600" }}>
              ⚑ {t("important")}
            </Text>
          </View>
        )}

        {onChangeStatus && (
          <>
            <Text
              style={[
                styles.sectionLabel,
                { color: colors.textSecondary },
              ]}
            >
              {t("markAs")}
            </Text>
            <View style={styles.statusRow}>
              {statuses
                .filter((s) => s !== currentStatus)
                .map((s) => (
                  <Pressable
                    key={s}
                    onPress={() => {
                      onChangeStatus(task.id, statusKeys[s]);
                      onClose();
                    }}
                    style={[
                      styles.statusButton,
                      {
                        borderColor: STATUS_COLORS[s],
                        backgroundColor: colors.card,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: STATUS_COLORS[s] },
                      ]}
                    />
                    <Text style={[styles.statusButtonText, { color: colors.text }]}>
                      {statusLabels[s]}
                    </Text>
                  </Pressable>
                ))}
            </View>
          </>
        )}

        {onDelete && (
          <Pressable
            onPress={() => {
              onDelete(task.id);
              onClose();
            }}
            style={styles.deleteButton}
          >
            <Text style={styles.deleteText}>{t("delete")}</Text>
          </Pressable>
        )}

        <Pressable
          onPress={onClose}
          style={[styles.closeButton, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.closeText, { color: colors.primaryText }]}>
            {t("cancel")}
          </Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#CCCCCC",
    alignSelf: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  description: {
    fontSize: 15,
    marginTop: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  metaLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  metaValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
  },
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statusButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  deleteButton: {
    marginTop: 20,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FF3B30",
  },
  deleteText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF3B30",
  },
  closeButton: {
    marginTop: 10,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
  },
  closeText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
