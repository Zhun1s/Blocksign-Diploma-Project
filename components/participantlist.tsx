import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Separator } from "./separator";

type Participant = {
  id: string;
  name: string;
  email?: string;
  pfpUrl?: string;
};

export function ParticipantList({
  participants,
  onPressParticipant,
}: {
  participants: Participant[];
  onPressParticipant: (participant: Participant) => void;
}) {
  return (
    <View style={styles.participantContainer}>
      {participants.map((participant, index) => (
        <View key={participant.id}>
          <Pressable
            onPress={() => onPressParticipant(participant)}
            style={styles.participantRow}
          >
            <View style={styles.participantRowContainer}>
              <View style={styles.pfpContainer}>
                <Text style={styles.pfpText}>{participant.name.charAt(0)}</Text>
              </View>
              <View>
                <Text style={styles.name}>{participant.name}</Text>
                {!!participant.email && (
                  <Text style={styles.email}>{participant.email}</Text>
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
  name: { fontSize: 16, fontWeight: "600" },
  email: { fontSize: 14, color: "#767676", marginTop: 4 },

  participantContainer: {
    backgroundColor: "#Fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 16,
    borderRadius: 16,
    gap: 4,
  },

  participantRowContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 8,
  },

  pfpContainer: {
    width: 48,
    height: 48,
    borderRadius: 90,
    backgroundColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
  },
  pfpText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },

  bottomRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  badgesRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  deadlineIndicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#EDFAF1",
    borderRadius: 16,
    gap: 4,
  },
  importantIndicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#FFF4E7",
    borderRadius: 16,
    gap: 4,
  },
  deadlineText: { fontSize: 12, fontWeight: "600", color: "#4FBE79" },
  importantText: { fontSize: 12, fontWeight: "600", color: "#FF8223" },
});
