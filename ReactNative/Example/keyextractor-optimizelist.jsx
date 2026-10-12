/*
  React Native example: FlatList keyExtractor and list optimization

  Cách chạy:
  - Tạo app React Native hoặc Expo.
  - Copy component App trong file này vào App.jsx.
*/

import React, { memo, useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const ITEM_HEIGHT = 64;
const SEPARATOR_HEIGHT = 10;
const ROW_HEIGHT = ITEM_HEIGHT + SEPARATOR_HEIGHT;

const initialMembers = [
  { id: "member-1", name: "Nhat", role: "Admin" },
  { id: "member-2", name: "Duy", role: "Member" },
  { id: "member-3", name: "Nghia", role: "Member" },
  { id: "member-4", name: "Giap", role: "Member" },
  { id: "member-5", name: "Minh", role: "Viewer" },
  { id: "member-6", name: "An", role: "Member" },
  { id: "member-7", name: "Bao", role: "Viewer" },
  { id: "member-8", name: "Linh", role: "Member" },
];

const MemberItem = memo(function MemberItem({ member, onRemove }) {
  return (
    <View style={styles.memberRow}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{member.name.slice(0, 1)}</Text>
      </View>

      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{member.name}</Text>
        <Text style={styles.memberRole}>{member.role}</Text>
      </View>

      <Pressable style={styles.removeButton} onPress={() => onRemove(member.id)}>
        <Text style={styles.removeButtonText}>Xóa</Text>
      </Pressable>
    </View>
  );
});

export default function App() {
  const [members, setMembers] = useState(initialMembers);
  const [nextNumber, setNextNumber] = useState(initialMembers.length + 1);

  const totalLabel = useMemo(() => {
    return `${members.length} thành viên`;
  }, [members.length]);

  const handleAddFirst = useCallback(() => {
    const newMember = {
      id: `member-${Date.now()}`,
      name: `New ${nextNumber}`,
      role: nextNumber % 2 === 0 ? "Member" : "Viewer",
    };

    setMembers((currentMembers) => [newMember, ...currentMembers]);
    setNextNumber((currentNumber) => currentNumber + 1);
  }, [nextNumber]);

  const handleReverse = useCallback(() => {
    setMembers((currentMembers) => [...currentMembers].reverse());
  }, []);

  const handleReset = useCallback(() => {
    setMembers(initialMembers);
    setNextNumber(initialMembers.length + 1);
  }, []);

  const handleRemove = useCallback((memberId) => {
    setMembers((currentMembers) =>
      currentMembers.filter((member) => member.id !== memberId),
    );
  }, []);

  const renderItem = useCallback(
    ({ item }) => <MemberItem member={item} onRemove={handleRemove} />,
    [handleRemove],
  );

  const keyExtractor = useCallback((item) => item.id, []);

  const getItemLayout = useCallback((_, index) => {
    return {
      length: ROW_HEIGHT,
      offset: ROW_HEIGHT * index,
      index,
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.title}>keyExtractor & Optimize List</Text>
          <Text style={styles.subtitle}>
            Dùng id ổn định để thêm, xóa, đảo thứ tự danh sách mà không làm
            React nhận diện sai item.
          </Text>
        </View>

        <View style={styles.toolbar}>
          <Pressable style={styles.primaryButton} onPress={handleAddFirst}>
            <Text style={styles.primaryButtonText}>Thêm đầu</Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={handleReverse}>
            <Text style={styles.secondaryButtonText}>Đảo thứ tự</Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={handleReset}>
            <Text style={styles.secondaryButtonText}>Reset</Text>
          </Pressable>
        </View>

        <FlatList
          data={members}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          getItemLayout={getItemLayout}
          initialNumToRender={8}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={styles.totalText}>{totalLabel}</Text>
              <Text style={styles.note}>
                Example này dùng `React.memo`, `useCallback` và `getItemLayout`
                cho item có chiều cao cố định.
              </Text>
            </View>
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>Danh sách đang rỗng.</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
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
  toolbar: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#2563eb",
    borderRadius: 8,
    flex: 1,
    paddingVertical: 11,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#c8d0d9",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 11,
  },
  secondaryButtonText: {
    color: "#2563eb",
    fontSize: 14,
    fontWeight: "700",
  },
  listContent: {
    paddingBottom: 24,
  },
  listHeader: {
    marginBottom: 12,
  },
  totalText: {
    color: "#17202a",
    fontSize: 18,
    fontWeight: "700",
  },
  note: {
    color: "#5f6b7a",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
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
    height: ITEM_HEIGHT,
    paddingHorizontal: 14,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: "#2563eb",
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 16,
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
    marginTop: 2,
  },
  removeButton: {
    backgroundColor: "#fee2e2",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  removeButtonText: {
    color: "#b91c1c",
    fontSize: 13,
    fontWeight: "700",
  },
  emptyBox: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 18,
  },
  emptyText: {
    color: "#5f6b7a",
    fontSize: 14,
  },
});
