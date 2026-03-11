import ProjectsbyOwner, {
  splitProjectsByMembership,
} from "@/components/projectsrow";
import { Separator } from "@/components/separator";
import { GlassView } from "expo-glass-effect";
import { router } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AddPlusIcon from "../../assets/icons/AddPlusIcon";
import SearchIcon from "../../assets/icons/SearchIcon";

type Project = {
  id: string;
  name: string;
  description?: string;
  company?: string;
  membersCount?: number;
  documentsCount?: number;
  ownerId?: string;
  createdById?: string;
  memberIds?: string[];
};

const mockProjects: Project[] = [
  {
    id: "p1",
    ownerId: "owner1",
    createdById: "owner1",
    name: "My App",
    description: "This is my app project",
    company: "My Company",
    membersCount: 5,
    documentsCount: 12,
    memberIds: ["owner2", "owner3"],
  },
  {
    id: "p2",
    ownerId: "owner1",
    createdById: "owner1",
    name: "My App 2",
    description: "This",
    company: "My Company",
    membersCount: 5,
    documentsCount: 12,
    memberIds: ["owner2", "owner3"],
  },
  {
    id: "p3",
    ownerId: "owner2",
    createdById: "owner2",
    company: "University",
    name: "University",
    documentsCount: 3,
    membersCount: 3,
    memberIds: ["owner1"],
    description: "University related tasks and documents",
  },
  {
    id: "p4",
    ownerId: "owner2",
    createdById: "owner2",
    company: "University",
    name: "University",
    documentsCount: 3,
    membersCount: 3,
    memberIds: ["owner1"],
    description: "University related tasks and documents",
  },
];

export default function Projects() {
  const currentUserId = "owner1";
  const sections = splitProjectsByMembership(mockProjects, currentUserId);

  const [query, setQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const filteredSections = sections.map((section) => ({
    ...section,
    data: section.data.filter((project) =>
      project.name.toLowerCase().includes(query.toLowerCase()),
    ),
  }));

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.background}>
      <View style={styles.container}>
        {isMenuOpen ? (
          <Pressable
            onPress={() => setIsMenuOpen(false)}
            style={styles.menuBackdrop}
          />
        ) : null}

        <View style={styles.headerRow}>
          <Text style={styles.textDay}>My Projects</Text>

          <Pressable
            onPress={() => setIsMenuOpen((prev) => !prev)}
            hitSlop={8}
            style={styles.menuAnchor}
          >
            <GlassView style={styles.buttonCircle} isInteractive>
              <AddPlusIcon />
            </GlassView>
          </Pressable>

          {isMenuOpen ? (
            <View style={styles.menuCard}>
              <Pressable
                onPress={() => {
                  setIsMenuOpen(false);
                  console.warn("Create project action is not implemented yet");
                }}
                style={styles.menuItem}
              >
                <Text style={styles.menuItemText}>Create project</Text>
              </Pressable>
              <Separator />
              <Pressable
                onPress={() => {
                  setIsMenuOpen(false);
                  console.warn("Join project action is not implemented yet");
                }}
                style={styles.menuItem}
              >
                <Text style={styles.menuItemText}>Join project</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
        <View style={styles.searchContainer}>
          <SearchIcon />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#535353"
            value={query}
            onChangeText={setQuery}
          />
        </View>
        <ProjectsbyOwner
          owners={filteredSections}
          onProjectPress={(project) => {
            router.push({
              pathname: "/projects/[id]",
              params: { id: project.id, name: project.name },
            });
          }}
          onRefresh={() => {
            /* reload */
          }}
          setError={(msg) => console.warn(msg)}
        />
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
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },

  menuCard: {
    position: "absolute",
    top: 58,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 8,
    minWidth: 170,
    zIndex: 11,
  },

  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  menuItemText: {
    fontSize: 15,
    fontWeight: "500",
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
