import { useTheme } from "@/contexts/ThemeContext";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Separator } from "./separator";

type Participant = {
  id: string;
  name: string;
  email?: string;
  pfpUrl?: string;
  role?: string;
};

const ROLE_COLORS: Record<string, string> = {
  owner: "#FF8223",
  manager: "#07AFF8",
  member: "#696969",
};

export function ParticipantList({
  participants,
  onPressParticipant,
}: {
  participants: Participant[];
  onPressParticipant: (participant: Participant) => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={[styles.participantContainer, { backgroundColor: colors.card }]}>
      {participants.map((participant, index) => (
        <View key={participant.id}>
          <Pressable
            onPress={() => onPressParticipant(participant)}
            style={styles.participantRow}
          >
            <View style={styles.participantRowContainer}>
              <View style={[styles.pfpContainer, { backgroundColor: colors.avatarBg }]}>
                <Text style={[styles.pfpText, { color: colors.avatarText }]}>
                  {participant.name.charAt(0)}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <Text style={[styles.name, { color: colors.text }]}>{participant.name}</Text>
                  {participant.role && (
                    <View
                      style={[
                        styles.roleBadge,
                        { backgroundColor: (ROLE_COLORS[participant.role] || "#696969") + "20" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.roleText,
                          { color: ROLE_COLORS[participant.role] || "#696969" },
                        ]}
                      >
                        {participant.role}
                      </Text>
                    </View>
                  )}
                </View>
                {!!participant.email && (
                  <Text style={[styles.email, { color: colors.textTertiary }]}>{participant.email}</Text>
                )}
              </View>
            </View>
          </Pressable>
          {index !== participants.length - 1 && <Separator />}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  participantRow: { gap: 8 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  name: { fontSize: 16, fontWeight: "600" },
  email: { fontSize: 14, marginTop: 2 },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  roleText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  participantContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 16,
    borderRadius: 16,
    gap: 4,
  },
  participantRowContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 8,
  },
  pfpContainer: {
    width: 48,
    height: 48,
    borderRadius: 90,
    alignItems: "center",
    justifyContent: "center",
  },
  pfpText: { fontSize: 20, fontWeight: "600" },
});
