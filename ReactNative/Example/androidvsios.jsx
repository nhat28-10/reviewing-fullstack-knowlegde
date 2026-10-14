/*
  React Native example: Android vs iOS with Platform.OS and Platform.select

  Cách chạy:
  - Tạo app React Native hoặc Expo.
  - Copy component App trong file này vào App.jsx.
*/

import React from "react";
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const platformLabel = Platform.select({
  android: "Android",
  ios: "iOS",
  default: "Unknown platform",
});

const backBehaviorText = Platform.select({
  android: "Android có system Back button.",
  ios: "iOS thường dùng Back trên UI hoặc swipe gesture.",
  default: "Back behavior phụ thuộc platform.",
});

export default function App() {
  const isIOS = Platform.OS === "ios";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Android vs iOS</Text>
          <Text style={styles.subtitle}>
            App đang chạy trên: {platformLabel}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Platform.OS</Text>
          <Text style={styles.cardText}>
            Giá trị hiện tại: {Platform.OS}
          </Text>
          <Text style={styles.cardText}>
            {isIOS ? "Đây là nhánh iOS." : "Đây là nhánh Android/default."}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Platform.select()</Text>
          <View style={styles.loginButton}>
            <Text style={styles.loginButtonText}>Login</Text>
          </View>
          <Text style={styles.helperText}>
            Button dùng màu và shadow khác nhau theo platform.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Navigation behavior</Text>
          <Text style={styles.cardText}>{backBehaviorText}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Safe Area</Text>
          <Text style={styles.cardText}>
            SafeAreaView giúp nội dung tránh notch, status bar hoặc vùng home
            indicator trên thiết bị phù hợp.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Platform.select({
      android: "#f4f7f2",
      ios: "#f4f6fb",
      default: "#f4f6f8",
    }),
  },
  container: {
    gap: 14,
    padding: 20,
  },
  header: {
    marginBottom: 4,
  },
  title: {
    color: "#17202a",
    fontSize: 26,
    fontWeight: "700",
  },
  subtitle: {
    color: "#5f6b7a",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 6,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    ...Platform.select({
      android: {
        elevation: 3,
      },
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.14,
        shadowRadius: 6,
      },
    }),
  },
  cardTitle: {
    color: "#17202a",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  cardText: {
    color: "#5f6b7a",
    fontSize: 15,
    lineHeight: 22,
  },
  helperText: {
    color: "#5f6b7a",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
  },
  loginButton: {
    alignItems: "center",
    borderRadius: Platform.select({
      android: 6,
      ios: 10,
      default: 8,
    }),
    marginTop: 4,
    paddingVertical: 12,
    ...Platform.select({
      android: {
        backgroundColor: "#4caf50",
        elevation: 2,
      },
      ios: {
        backgroundColor: "#007aff",
      },
      default: {
        backgroundColor: "#2563eb",
      },
    }),
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});
