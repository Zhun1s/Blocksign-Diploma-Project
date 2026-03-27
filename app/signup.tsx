import ArrowLeftIcon from "@/assets/icons/ArrowLeftIcon";
import { router, Stack } from "expo-router";
import { useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

export default function SignupScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSignup = () => {
    console.log("Sign up", {
      fullName,
      email,
      passwordLength: password.length,
    });
    router.replace("/(tabs)");
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.background}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()}>
              <ArrowLeftIcon />
            </Pressable>
            <Text style={styles.pageTitle}>Sign Up</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your name"
              placeholderTextColor="#9A9A9A"
              style={styles.input}
            />

            <Text style={[styles.label, styles.sectionSpacing]}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#9A9A9A"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />

            <Text style={[styles.label, styles.sectionSpacing]}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Create password"
              placeholderTextColor="#9A9A9A"
              secureTextEntry
              style={styles.input}
            />
          </View>

          <Pressable
            onPress={onSignup}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.primaryButtonText}>Create Account</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/login")}
            style={styles.linkRow}
          >
            <Text style={styles.linkText}>Already have an account? Log In</Text>
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
    paddingBottom: 24,
  },
  container: {
    marginTop: 100,
    marginHorizontal: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: "700",
  },
  card: {
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  input: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111111",
    backgroundColor: "#FFFFFF",
  },
  sectionSpacing: {
    marginTop: 14,
  },
  primaryButton: {
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  pressed: {
    opacity: 0.9,
  },
  linkRow: {
    marginTop: 14,
    alignItems: "center",
  },
  linkText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#444444",
  },
});
