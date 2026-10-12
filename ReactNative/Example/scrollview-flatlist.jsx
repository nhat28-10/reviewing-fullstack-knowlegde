/*
  React Native example: ScrollView vs FlatList

  Cách chạy:
  - Tạo app React Native hoặc Expo.
  - Copy component App trong file này vào App.jsx.
*/

import React, { useState } from "react";
import {
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const profileSections = [
  {
    id: "profile",
    title: "Thông tin cá nhân",
    description: "Tên, email, số điện thoại và ảnh đại diện.",
  },
  {
    id: "family",
    title: "Gia đình",
    description: "Thông tin nhóm gia đình, vai trò và thành viên chính.",
  },
  {
    id: "finance",
    title: "Tài chính",
    description: "Ngân sách tháng, chi tiêu gần đây và hạn mức cảnh báo.",
  },
  {
    id: "security",
    title: "Bảo mật",
    description: "Mật khẩu, đăng nhập hai lớp và thiết bị đang hoạt động.",
  },
];

const members = Array.from({ length: 40 }, (_, index) => ({
  id: String(index + 1),
  name: `Thành viên ${index + 1}`,
  role: index % 5 === 0 ? "Admin" : "Member",
}));

export default function App() {
  const [mode, setMode] = useState("scrollview");

  const isScrollViewMode = mode === "scrollview";

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.title}>ScrollView vs FlatList</Text>
          <Text style={styles.subtitle}>
            Chọn cách render phù hợp với lượng nội dung trên màn hình.
          </Text>
        </View>

        <View style={styles.segment}>
          <Pressable
            style={[
              styles.segmentButton,
              isScrollViewMode && styles.segmentButtonActive,
            ]}
            onPress={() => setMode("scrollview")}
          >
            <Text
              style={[
                styles.segmentText,
                isScrollViewMode && styles.segmentTextActive,
              ]}
            >
              ScrollView
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.segmentButton,
              !isScrollViewMode && styles.segmentButtonActive,
            ]}
            onPress={() => setMode("flatlist")}
          >
            <Text
              style={[
                styles.segmentText,
                !isScrollViewMode && styles.segmentTextActive,
              ]}
            >
              FlatList
            </Text>
          </Pressable>
        </View>

        {isScrollViewMode ? <ScrollViewExample /> : <FlatListExample />}
      </View>
    </SafeAreaView>
  );
}

function ScrollViewExample() {
  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.sectionTitle}>Profile / Settings screen</Text>
      <Text style={styles.note}>
        ScrollView phù hợp khi số lượng section ít và giao diện mỗi section có
        thể khác nhau.
      </Text>

      {profileSections.map((section) => (
        <View key={section.id} style={styles.card}>
          <Text style={styles.cardTitle}>{section.title}</Text>
          <Text style={styles.cardDescription}>{section.description}</Text>
        </View>
      ))}

      <View style={styles.tipBox}>
        <Text style={styles.tipTitle}>Ghi nhớ</Text>
        <Text style={styles.tipText}>
          ScrollView render toàn bộ children ngay từ đầu, nên không phù hợp với
          danh sách quá dài.
        </Text>
      </View>
    </ScrollView>
  );
}

function FlatListExample() {
  return (
    <FlatList
      data={members}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Family members</Text>
          <Text style={styles.note}>
            FlatList phù hợp với danh sách dài có item lặp lại cùng cấu trúc.
          </Text>
        </View>
      }
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      renderItem={({ item, index }) => (
        <View style={styles.memberRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{index + 1}</Text>
          </View>

          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>{item.name}</Text>
            <Text style={styles.memberRole}>{item.role}</Text>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4f6f8",
  },
  screen: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 16,
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
  segment: {
    backgroundColor: "#dde5ef",
    borderRadius: 8,
    flexDirection: "row",
    marginBottom: 16,
    padding: 4,
  },
  segmentButton: {
    alignItems: "center",
    borderRadius: 6,
    flex: 1,
    paddingVertical: 10,
  },
  segmentButtonActive: {
    backgroundColor: "#ffffff",
  },
  segmentText: {
    color: "#5f6b7a",
    fontSize: 14,
    fontWeight: "700",
  },
  segmentTextActive: {
    color: "#2563eb",
  },
  scrollContent: {
    gap: 12,
    paddingBottom: 24,
  },
  sectionTitle: {
    color: "#17202a",
    fontSize: 20,
    fontWeight: "700",
  },
  note: {
    color: "#5f6b7a",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
  },
  cardTitle: {
    color: "#17202a",
    fontSize: 16,
    fontWeight: "700",
  },
  cardDescription: {
    color: "#5f6b7a",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  tipBox: {
    backgroundColor: "#e8f1ff",
    borderRadius: 8,
    padding: 16,
  },
  tipTitle: {
    color: "#1f3a5f",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
  },
  tipText: {
    color: "#17202a",
    fontSize: 14,
    lineHeight: 20,
  },
  listContent: {
    paddingBottom: 24,
  },
  listHeader: {
    marginBottom: 12,
  },
  separator: {
    height: 10,
  },
  memberRow: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    flexDirection: "row",
    gap: 12,
    padding: 14,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: "#2563eb",
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    color: "#17202a",
    fontSize: 16,
    fontWeight: "700",
  },
  memberRole: {
    color: "#5f6b7a",
    fontSize: 14,
    marginTop: 4,
  },
});
