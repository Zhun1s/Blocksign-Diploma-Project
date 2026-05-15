import FolderPlusIcon from "@/assets/icons/FolderPlusIcon";
import QrCodeIcon from "@/assets/icons/QrCodeIcon";
import ProjectsbyOwner from "@/components/projectsrow";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { getFiles, getMembers, getProjects } from "@/services/api";
import { GlassView } from "expo-glass-effect";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AddPlusIcon from "../../assets/icons/AddPlusIcon";
import SearchIcon from "../../assets/icons/SearchIcon";

type ProjectRow = {
  id: string;
  name: string;
  description?: string;
  company?: string;
  membersCount?: number;
  documentsCount?: number;
  ownerId?: string;
  createdById?: string;
};

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [query, setQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { colors } = useTheme();
  const { t } = useLanguage();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProjects();
      const rows: ProjectRow[] = await Promise.all(
        data.map(async (p) => {
          let membersCount = 0;
          let documentsCount = 0;
          try {
            const [members, files] = await Promise.all([
              getMembers(p.id),
              getFiles(p.id).catch(() => []),
            ]);
            membersCount = members.length;
            documentsCount = files.length;
          } catch {}
          return {
            id: String(p.id),
            name: p.name,
            description: p.description,
            company: p.company,
            membersCount,
            documentsCount,
            ownerId: String(p.ownerId),
            createdById: String(p.ownerId),
          };
        }),
      );
      setProjects(rows);
    } catch (e) {
      console.warn("Failed to load projects", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const currentUserId = user ? String(user.id) : "";

  const owned = projects.filter((p) => p.createdById === currentUserId);
  const joined = projects.filter((p) => p.createdById !== currentUserId);

  const sections = [
    ...(owned.length ? [{ title: t("createdByMe"), data: owned }] : []),
    ...(joined.length ? [{ title: t("joined"), data: joined }] : []),
  ];

  const filteredSections = sections.map((section) => ({
    ...section,
    data: section.data.filter((project) =>
      project.name.toLowerCase().includes(query.toLowerCase()),
    ),
  }));

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.container}>
        {isMenuOpen ? (
          <Pressable
            onPress={() => setIsMenuOpen(false)}
            style={styles.menuBackdrop}
          />
        ) : null}

        <View style={styles.headerRow}>
          <Text style={[styles.textDay, { color: colors.text }]}>{t("myProjects")}</Text>

          <Pressable
            onPress={() => setIsMenuOpen((prev) => !prev)}
            hitSlop={8}
            style={styles.menuAnchor}
          >
            <GlassView style={styles.buttonCircle} isInteractive>
              <AddPlusIcon color={colors.text} />
            </GlassView>
          </Pressable>

          {isMenuOpen ? (
            <View style={[styles.menuCard, { backgroundColor: colors.card }]}>
              <Pressable
                onPress={() => {
                  setIsMenuOpen(false);
                  router.push("/create-project");
                }}
                style={[
                  styles.menuItem,
                  { borderBottomWidth: 0.5, borderBottomColor: colors.border },
                ]}
              >
                <FolderPlusIcon color={colors.text} size={20} />
                <Text style={[styles.menuItemText, { color: colors.text }]}>{t("createProject")}</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setIsMenuOpen(false);
                  router.push("/join");
                }}
                style={styles.menuItem}
              >
                <QrCodeIcon color={colors.text} size={20} />
                <Text style={[styles.menuItemText, { color: colors.text }]}>{t("joinProject")}</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
        <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
          <SearchIcon color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={t("search")}
            placeholderTextColor={colors.placeholder}
            value={query}
            onChangeText={setQuery}
          />
        </View>
        {loading ? (
          <ActivityIndicator style={{ marginTop: 32 }} size="large" />
        ) : (
          <ProjectsbyOwner
            owners={filteredSections}
            onProjectPress={(project) => {
              router.push({
                pathname: "/projects/[id]",
                params: { id: project.id, name: project.name },
              });
            }}
            onRefresh={load}
            setError={(msg) => console.warn(msg)}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#F2F2F2",
  },

  container: {
    flex: 1,
    marginHorizontal: 16,
    marginTop: 56,
    position: "relative",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },

  textDay: {
    fontSize: 40,
    fontWeight: "bold",
  },

  buttonCircle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 180,
    padding: 12,
  },

  menuAnchor: {
    zIndex: 12,
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
    top: 64,
    right: 0,
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

  searchContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 24,
    padding: 16,
    borderRadius: 16,
    width: "100%",
    backgroundColor: "#FFFFFF",
  },

  searchInput: {
    display: "flex",
    width: "100%",
    fontSize: 16,
    fontWeight: "500",
  },
});
