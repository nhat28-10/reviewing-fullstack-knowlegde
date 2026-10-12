/*
  React Native example: StyleSheet and Flexbox

  Cách chạy:
  - Tạo app React Native hoặc Expo.
  - Copy component App trong file này vào App.jsx.
*/

import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>StyleSheet & Flexbox</Text>
          <Text style={styles.subtitle}>
            Một vài layout thường gặp khi xây giao diện React Native.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Header</Text>

          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>NH</Text>
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.name}>Nhat</Text>
              <Text style={styles.jobTitle}>Fullstack Developer</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Action Row</Text>

          <View style={styles.actionRow}>
            <Text style={styles.cancelButton}>Cancel</Text>
            <Text style={styles.saveButton}>Save</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>justifyContent</Text>

          <View style={styles.demoBox}>
            <View style={styles.spaceBetweenRow}>
              <View style={styles.dot} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
          </View>

          <Text style={styles.note}>
            Với `flexDirection: "row"`, `justifyContent` căn theo chiều ngang.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>alignItems</Text>

          <View style={styles.centerBox}>
            <Text style={styles.centerText}>Center</Text>
          </View>

          <Text style={styles.note}>
            Kết hợp `justifyContent: "center"` và `alignItems: "center"` để căn
            giữa theo hai chiều.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4f6f8",
  },
  container: {
    gap: 16,
    padding: 20,
  },
  header: {
    marginBottom: 4,
  },
  title: {
    color: "#17202a",
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    color: "#5f6b7a",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  section: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
  },
  sectionTitle: {
    color: "#17202a",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 12,
  },
  profileHeader: {
    alignItems: "center",
    flexDirection: "row",
  },
  avatar: {
    alignItems: "center",
    backgroundColor: "#2563eb",
    borderRadius: 28,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  userInfo: {
    marginLeft: 12,
  },
  name: {
    color: "#17202a",
    fontSize: 18,
    fontWeight: "700",
  },
  jobTitle: {
    color: "#5f6b7a",
    fontSize: 14,
    marginTop: 4,
  },
  actionRow: {
    alignItems: "center",
    flexDirection: "row",
    height: 60,
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  cancelButton: {
    color: "#6b7280",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    color: "#2563eb",
    fontSize: 16,
    fontWeight: "700",
  },
  demoBox: {
    backgroundColor: "#e8f1ff",
    borderRadius: 8,
    padding: 14,
  },
  spaceBetweenRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dot: {
    backgroundColor: "#2563eb",
    borderRadius: 14,
    height: 28,
    width: 28,
  },
  centerBox: {
    alignItems: "center",
    backgroundColor: "#e8f1ff",
    borderRadius: 8,
    height: 120,
    justifyContent: "center",
  },
  centerText: {
    color: "#1f3a5f",
    fontSize: 16,
    fontWeight: "700",
  },
  note: {
    color: "#5f6b7a",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
});
