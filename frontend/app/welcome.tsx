import { Image } from "expo-image";
import { router, Stack } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function WelcomeScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.background}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.container}>
          <Image
            style={styles.logo}
            source={require("../assets/images/BLS-logo.png")}
            contentFit="contain"
          />
          <View style={styles.heroCard}>
            <Text style={styles.title}>Welcome</Text>
            <Text style={styles.subtitle}>
              Manage projects, tasks, and documents in one place.
            </Text>
          </View>

          <Pressable
            onPress={() => router.push("/login")}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.primaryButtonText}>Log In</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/signup")}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.secondaryButtonText}>Sign Up</Text>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#F2F2F2",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 24,
  },
  container: {
    marginHorizontal: 16,
    gap: 16,
  },
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 24,
    gap: 8,
  },
  logo: {
    width: 100,
    height: 40,
  },
  title: {
    fontSize: 40,
    fontWeight: "700",
    color: "#111111",
  },
  subtitle: {
    fontSize: 15,
    color: "#5D5D5D",
    lineHeight: 22,
  },
  actionsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
  },
  primaryButton: {
    borderRadius: 12,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DADADA",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
  },
  secondaryButtonText: {
    color: "#111111",
    fontSize: 16,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.9,
  },
});
