/*
  React Native example: View, Text, Image, TextInput, Pressable, TouchableOpacity

  Cách chạy:
  - Tạo app React Native hoặc Expo.
  - Copy component App trong file này vào App.jsx.
*/

import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function App() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("Hãy nhập tên và chọn một hành động.");
  const trimmedName = name.trim();

  function handleGreeting() {
    if (!trimmedName) {
      setMessage("Bạn cần nhập tên trước khi chào.");
      return;
    }

    setMessage(`Xin chào, ${trimmedName}!`);
  }

  function handleLongPress() {
    setMessage("Bạn vừa nhấn giữ Pressable.");
  }

  function handleReset() {
    setName("");
    setMessage("Form đã được reset.");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Image
              source={{ uri: "https://reactnative.dev/img/tiny_logo.png" }}
              style={styles.logo}
            />

            <View style={styles.headerText}>
              <Text style={styles.title}>React Native Basic Components</Text>
              <Text style={styles.subtitle}>
                View, Text, Image, TextInput, Pressable và TouchableOpacity
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Tên của bạn</Text>
            <TextInput
              autoCapitalize="words"
              placeholder="Ví dụ: Nhat"
              style={styles.input}
              value={name}
              onChangeText={setName}
            />

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
              ]}
              onPress={handleGreeting}
              onLongPress={handleLongPress}
            >
              <Text style={styles.primaryButtonText}>Chào bằng Pressable</Text>
            </Pressable>

            <TouchableOpacity
              activeOpacity={0.65}
              style={styles.secondaryButton}
              onPress={handleReset}
            >
              <Text style={styles.secondaryButtonText}>
                Reset bằng TouchableOpacity
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.messageBox}>
            <Text style={styles.messageLabel}>Kết quả</Text>
            <Text style={styles.messageText}>{message}</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4f6f8",
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    gap: 18,
    justifyContent: "center",
    padding: 20,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
  },
  logo: {
    height: 56,
    width: 56,
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: "#17202a",
    fontSize: 22,
    fontWeight: "700",
  },
  subtitle: {
    color: "#5f6b7a",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    gap: 12,
    padding: 16,
  },
  label: {
    color: "#17202a",
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#ffffff",
    borderColor: "#c8d0d9",
    borderRadius: 8,
    borderWidth: 1,
    color: "#17202a",
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingVertical: 12,
  },
  primaryButtonPressed: {
    backgroundColor: "#1d4ed8",
    transform: [{ scale: 0.98 }],
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    alignItems: "center",
    borderColor: "#2563eb",
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: "#2563eb",
    fontSize: 16,
    fontWeight: "700",
  },
  messageBox: {
    backgroundColor: "#e8f1ff",
    borderRadius: 8,
    padding: 16,
  },
  messageLabel: {
    color: "#1f3a5f",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  messageText: {
    color: "#17202a",
    fontSize: 16,
    lineHeight: 22,
  },
});
