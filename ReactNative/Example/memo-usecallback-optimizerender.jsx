/*
  React Native example: memo, useCallback and render optimization

  Cách chạy:
  - Tạo app React Native hoặc Expo.
  - Copy component App trong file này vào App.jsx.
  - Mở console, sau đó nhập vào TextInput để so sánh log render của hai list.

  Lưu ý: React Strict Mode trong môi trường development có thể làm log xuất hiện
  nhiều hơn một lần để phát hiện side effect. Production không có hành vi này.
*/

import React, { memo, useCallback, useState } from "react";
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const initialMessages = [
  { id: "message-1", author: "An", text: "Chào mọi người!", liked: false },
  {
    id: "message-2",
    author: "Bình",
    text: "Hôm nay học React Native nhé?",
    liked: false,
  },
  {
    id: "message-3",
    author: "Chi",
    text: "Mình đang tìm hiểu memo và useCallback.",
    liked: false,
  },
];

const MessageItem = memo(function MessageItem({
  id,
  author,
  text,
  liked,
  onToggleLike,
  variant,
}) {
  console.log(`[${variant}] MessageItem render:`, id);

  return (
    <View style={styles.messageCard}>
      <View style={styles.messageContent}>
        <Text style={styles.author}>{author}</Text>
        <Text style={styles.message}>{text}</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${liked ? "Bỏ thích" : "Thích"} tin nhắn của ${author}`}
        style={[styles.likeButton, liked && styles.likeButtonActive]}
        onPress={() => onToggleLike(id)}
      >
        <Text style={[styles.likeText, liked && styles.likeTextActive]}>
          {liked ? "Đã thích" : "Thích"}
        </Text>
      </Pressable>
    </View>
  );
});

export default function App() {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const [optimized, setOptimized] = useState(true);

  const handleToggleLike = useCallback((messageId) => {
    setMessages((currentMessages) =>
      currentMessages.map((message) =>
        message.id === messageId
          ? { ...message, liked: !message.liked }
          : message,
      ),
    );
  }, []);

  const renderOptimizedItem = useCallback(
    ({ item }) => (
      <MessageItem
        id={item.id}
        author={item.author}
        text={item.text}
        liked={item.liked}
        onToggleLike={handleToggleLike}
        variant="optimized"
      />
    ),
    [handleToggleLike],
  );

  const renderUnoptimizedItem = ({ item }) => (
    <MessageItem
      id={item.id}
      author={item.author}
      text={item.text}
      liked={item.liked}
      onToggleLike={(messageId) => handleToggleLike(messageId)}
      variant="unoptimized"
    />
  );

  const activeRenderItem = optimized
    ? renderOptimizedItem
    : renderUnoptimizedItem;

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={activeRenderItem}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.screen}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <Text style={styles.eyebrow}>RENDER LAB</Text>
              <Text style={styles.title}>memo + useCallback</Text>
              <Text style={styles.subtitle}>
                Nhập nội dung bên dưới rồi xem console. State draft làm App
                re-render nhưng dữ liệu tin nhắn không đổi.
              </Text>
            </View>

            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Nhập để làm component cha re-render..."
              placeholderTextColor="#7c8494"
              style={styles.input}
            />

            <View style={styles.draftBox}>
              <Text style={styles.draftLabel}>Draft hiện tại</Text>
              <Text style={styles.draftValue}>
                {draft || "Chưa có nội dung"}
              </Text>
            </View>

            <Text style={styles.modeLabel}>Chọn chế độ so sánh</Text>
            <View style={styles.modeRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: !optimized }}
                style={[
                  styles.modeButton,
                  !optimized && styles.modeButtonActive,
                ]}
                onPress={() => setOptimized(false)}
              >
                <Text
                  style={[
                    styles.modeButtonText,
                    !optimized && styles.modeButtonTextActive,
                  ]}
                >
                  Chưa tối ưu
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: optimized }}
                style={[
                  styles.modeButton,
                  optimized && styles.modeButtonActive,
                ]}
                onPress={() => setOptimized(true)}
              >
                <Text
                  style={[
                    styles.modeButtonText,
                    optimized && styles.modeButtonTextActive,
                  ]}
                >
                  Đã tối ưu
                </Text>
              </Pressable>
            </View>

            <View style={styles.statusBox}>
              <Text style={styles.statusTitle}>
                {optimized
                  ? "Đang dùng callback ổn định"
                  : "Đang tạo callback mới"}
              </Text>
              <Text style={styles.statusText}>
                {optimized
                  ? "renderItem và onToggleLike được giữ ổn định bằng useCallback."
                  : "Mỗi item nhận một onToggleLike mới nên memo không thể bỏ qua re-render."}
              </Text>
            </View>

            <Text style={styles.listTitle}>Tin nhắn mẫu</Text>
          </View>
        }
        ListFooterComponent={
          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>Cách kiểm tra</Text>
            <Text style={styles.tipText}>
              Chọn từng chế độ rồi nhập draft. Console có log [unoptimized] sau
              mỗi ký tự, còn item [optimized] có thể bỏ qua render vì props
              không đổi.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f3f5f9",
  },
  screen: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 18,
  },
  eyebrow: {
    color: "#6558d3",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.6,
  },
  title: {
    color: "#172033",
    fontSize: 30,
    fontWeight: "800",
    marginTop: 5,
  },
  subtitle: {
    color: "#5c6577",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  input: {
    backgroundColor: "#ffffff",
    borderColor: "#d9deea",
    borderRadius: 12,
    borderWidth: 1,
    color: "#172033",
    fontSize: 15,
    paddingHorizontal: 15,
    paddingVertical: 13,
  },
  draftBox: {
    backgroundColor: "#ebe9ff",
    borderRadius: 12,
    marginTop: 10,
    padding: 14,
  },
  draftLabel: {
    color: "#6558d3",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  draftValue: {
    color: "#302b63",
    fontSize: 15,
    marginTop: 4,
  },
  modeLabel: {
    color: "#172033",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 18,
  },
  modeRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  modeButton: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#d2d8e5",
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 11,
  },
  modeButtonActive: {
    backgroundColor: "#6558d3",
    borderColor: "#6558d3",
  },
  modeButtonText: {
    color: "#5c6577",
    fontSize: 14,
    fontWeight: "800",
  },
  modeButtonTextActive: {
    color: "#ffffff",
  },
  statusBox: {
    backgroundColor: "#ffffff",
    borderColor: "#e1e5ee",
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 10,
    padding: 14,
  },
  statusTitle: {
    color: "#172033",
    fontSize: 14,
    fontWeight: "800",
  },
  statusText: {
    color: "#697386",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 3,
  },
  listTitle: {
    color: "#172033",
    fontSize: 19,
    fontWeight: "800",
    marginBottom: 12,
    marginTop: 20,
  },
  separator: {
    height: 10,
  },
  messageCard: {
    alignItems: "center",
    backgroundColor: "#f7f8fb",
    borderRadius: 12,
    flexDirection: "row",
    padding: 12,
  },
  messageContent: {
    flex: 1,
    paddingRight: 10,
  },
  author: {
    color: "#172033",
    fontSize: 14,
    fontWeight: "800",
  },
  message: {
    color: "#5c6577",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  likeButton: {
    backgroundColor: "#ffffff",
    borderColor: "#cfd5e2",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  likeButtonActive: {
    backgroundColor: "#6558d3",
    borderColor: "#6558d3",
  },
  likeText: {
    color: "#5c6577",
    fontSize: 12,
    fontWeight: "700",
  },
  likeTextActive: {
    color: "#ffffff",
  },
  tipBox: {
    backgroundColor: "#172033",
    borderRadius: 14,
    marginTop: 18,
    padding: 16,
  },
  tipTitle: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },
  tipText: {
    color: "#cbd2df",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 5,
  },
});
