import FileBlankIcon from "@/assets/icons/FileBlankIcon";
import UsersIcon from "@/assets/icons/UsersIcon";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import UserCardIcon from "../assets/icons/UserCardIcon";

const projectsPalette = ["red", "blue", "orange", "pink"];
const getProjectColor = (projectId: string) => {
  const index = parseInt(projectId.replace(/\D/g, "")) % projectsPalette.length;
  return projectsPalette[index];
};

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

type ProjectsOwner = {
  title?: string;
  data: Project[];
};

export function splitProjectsByMembership(
  projects: Project[],
  currentUserId: string,
): ProjectsOwner[] {
  const createdByMe = projects.filter(
    (project) =>
      project.ownerId === currentUserId ||
      project.createdById === currentUserId,
  );

  const joined = projects.filter((project) => {
    const isOwner = project.ownerId === currentUserId;
    const isCreator = project.createdById === currentUserId;
    const isMember = project.memberIds?.includes(currentUserId);
    return !isOwner && !isCreator && Boolean(isMember);
  });

  const sections: ProjectsOwner[] = [];
  if (createdByMe.length) {
    sections.push({ title: "Created by me", data: createdByMe });
  }
  if (joined.length) {
    sections.push({ title: "Joined", data: joined });
  }

  return sections;
}

export default function ProjectsbyOwner({
  owners,
  onProjectPress,
  onRefresh,
  setError,
}: {
  owners: ProjectsOwner[];
  onProjectPress: (project: Project) => void;
  onRefresh: () => void;
  setError: (message: string) => void;
  setLoading?: (loading: boolean) => void;
}) {
  return (
    <View>
      {owners.map((section, sectionIndex) => (
        <View
          key={section.title ?? `section-${sectionIndex}`}
          style={styles.sectionContainer}
        >
          {section.title && (
            <Text style={styles.sectionTitle}>{section.title}</Text>
          )}

          <View style={styles.projectList}>
            {section.data.map((project, idx) => (
              <View
                key={project.id}
                style={{
                  marginBottom: 8,
                  backgroundColor: getProjectColor(project.id),
                  ...styles.projectBackground,
                }}
              >
                <Pressable
                  key={project.id}
                  onPress={() => onProjectPress(project)}
                  style={[styles.projectRow]}
                >
                  <View style={styles.companyLook}>
                    <UserCardIcon />
                    <Text style={styles.companyName}>{project.company}</Text>
                  </View>

                  <View style={{ display: "flex", flexDirection: "column" }}>
                    <Text style={styles.projectName}>{project.name}</Text>

                    {project.description && (
                      <Text style={styles.projectDescription}>
                        {project.description}
                      </Text>
                    )}
                  </View>

                  <View
                    style={{ display: "flex", flexDirection: "row", gap: 8 }}
                  >
                    {(project.company ||
                      typeof project.membersCount === "number") && (
                      <View style={styles.metaRow}>
                        {typeof project.membersCount === "number" && (
                          <View
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <UsersIcon size={12} />
                            <Text style={styles.smallText}>
                              {project.membersCount}{" "}
                            </Text>
                          </View>
                        )}
                      </View>
                    )}

                    {(project.company ||
                      typeof project.documentsCount === "number") && (
                      <View style={styles.metaRow}>
                        {typeof project.documentsCount === "number" && (
                          <View
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <FileBlankIcon size={16} />
                            <Text style={styles.smallText}>
                              {project.documentsCount}{" "}
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  projectList: {
    shadowColor: "#000000",
    shadowOffset: { width: 1, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  projectRow: {
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    borderRadius: 16,
    paddingHorizontal: 12,
    gap: 12,
  },

  projectBackground: {
    display: "flex",
    borderRadius: 16,
    paddingLeft: 4,
  },
  projectHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  projectName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
  },
  projectDescription: {
    fontSize: 16,
    fontWeight: "500",
    color: "#767676",
    marginTop: 4,
  },
  metaRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginTop: 8,
  },
  badge: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2F855A",
    backgroundColor: "#EAF7F0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  companyLook: {
    display: "flex",
    flexDirection: "row",
    alignSelf: "flex-start",
    alignItems: "center",
    backgroundColor: "#E6E6E6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
    borderRadius: 16,
  },

  companyName: {
    fontSize: 12,
    fontWeight: "700",
    color: "#535353",
  },

  smallText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#949494",
  },
});
