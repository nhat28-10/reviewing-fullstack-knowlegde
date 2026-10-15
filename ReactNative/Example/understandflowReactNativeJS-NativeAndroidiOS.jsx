/*
  React Native example: JavaScript <-> Native Android/iOS flow

  Cách chạy:
  - Tạo app React Native hoặc Expo.
  - Copy component App trong file này vào App.jsx.
  - Mở console để xem log từ JavaScript khi nhấn các nút.
*/

import { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

const flowSteps = [
  {
    number: "1",
    title: "Native nhận thao tác chạm",
    detail: "Hệ điều hành nhận touch trên Pressable.",
  },
  {
    number: "2",
    title: "Event đến JavaScript",
    detail: "React Native gọi hàm onPress trong code JS.",
  },
  {
    number: "3",
    title: "State được cập nhật",
    detail: "Handler gọi setCount để tạo state mới.",
  },
  {
    number: "4",
    title: "React tính UI mới",
    detail: "Renderer xác định phần giao diện cần thay đổi.",
  },
  {
    number: "5",
    title: "Native UI hiển thị kết quả",
    detail: "Text native cập nhật giá trị Count mới.",
  },
];

export default function App() {
  const [count, setCount] = useState(0);
  const [showFlow, setShowFlow] = useState(false);
  const [lastAction, setLastAction] = useState("Chưa có thao tác nào.");
  const { width, height } = useWindowDimensions();

  const platformName = Platform.select({
    android: "Android",
    ios: "iOS",
    default: Platform.OS,
  });

  const platformDescription = Platform.select({
    android: "Ứng dụng đang dùng native runtime và view của Android.",
    ios: "Ứng dụng đang dùng native runtime và view của iOS.",
    default: "Ứng dụng đang chạy trên một nền tảng được React Native hỗ trợ.",
  });

  const handleIncrease = () => {
    console.log("[JS] onPress received; scheduling count update");

    setCount((currentCount) => currentCount + 1);
    setShowFlow(true);
    setLastAction("JavaScript đã xử lý onPress và yêu cầu cập nhật Count.");
  };

  const handleShowNativeAlert = () => {
    console.log("[JS] requesting native Alert");

    setLastAction("JavaScript đã gọi Alert API của nền tảng.");
    Alert.alert(
      `Hello from ${platformName}`,
      "Alert này được hệ điều hành hiển thị dưới dạng UI native.",
      [{ text: "Đã hiểu" }],
    );
  };

  const handleReset = () => {
    setCount(0);
    setShowFlow(false);
    setLastAction("Đã reset state ở JavaScript.");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>REACT NATIVE RUNTIME</Text>
          <Text style={styles.title}>JavaScript ↔ Native</Text>
          <Text style={styles.subtitle}>
            Một màn hình nhỏ để quan sát JavaScript xử lý event, React cập nhật
            state và native UI hiển thị kết quả.
          </Text>
        </View>

        <View style={styles.platformCard}>
          <View style={styles.platformIcon}>
            <Text style={styles.platformIconText}>
              {Platform.OS.toUpperCase()}
            </Text>
          </View>
          <View style={styles.platformContent}>
            <Text style={styles.platformLabel}>Nền tảng hiện tại</Text>
            <Text style={styles.platformName}>{platformName}</Text>
            <Text style={styles.platformDescription}>
              {platformDescription}
            </Text>
          </View>
        </View>

        <View style={styles.counterCard}>
          <Text style={styles.cardLabel}>STATE TRONG JAVASCRIPT</Text>
          <Text style={styles.count}>{count}</Text>
          <Text style={styles.countDescription}>
            Giá trị này được render thành native Text.
          </Text>

          <View style={styles.actionRow}>
            <Pressable style={styles.primaryButton} onPress={handleIncrease}>
              <Text style={styles.primaryButtonText}>Tăng Count</Text>
            </Pressable>

            <Pressable style={styles.secondaryButton} onPress={handleReset}>
              <Text style={styles.secondaryButtonText}>Reset</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.cardLabel}>TRẠNG THÁI CUỐI</Text>
          <Text style={styles.statusText}>{lastAction}</Text>
        </View>

        <View style={styles.flowCard}>
          <Text style={styles.sectionTitle}>Luồng khi nhấn “Tăng Count”</Text>
          <Text style={styles.sectionDescription}>
            Nhấn nút để đánh dấu các bước trong luồng thực thi ở mức khái niệm.
          </Text>

          {flowSteps.map((step) => {
            const isActive = showFlow;

            return (
              <View key={step.number} style={styles.flowRow}>
                <View
                  style={[
                    styles.stepNumber,
                    isActive && styles.stepNumberActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.stepNumberText,
                      isActive && styles.stepNumberTextActive,
                    ]}
                  >
                    {step.number}
                  </Text>
                </View>
                <View style={styles.stepContent}>
                  <Text
                    style={[
                      styles.stepTitle,
                      isActive && styles.stepTitleActive,
                    ]}
                  >
                    {step.title}
                  </Text>
                  <Text style={styles.stepDetail}>{step.detail}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <Pressable style={styles.alertButton} onPress={handleShowNativeAlert}>
          <Text style={styles.alertButtonTitle}>Mở native alert</Text>
          <Text style={styles.alertButtonDescription}>
            JavaScript gọi `Alert.alert`, Android/iOS sẽ hiển thị hộp thoại.
          </Text>
        </Pressable>

        <View style={styles.dimensionsCard}>
          <Text style={styles.cardLabel}>NATIVE WINDOW → JAVASCRIPT</Text>
          <Text style={styles.dimensionsValue}>
            {Math.round(width)} × {Math.round(height)}
          </Text>
          <Text style={styles.dimensionsDescription}>
            Xoay thiết bị hoặc đổi kích thước cửa sổ để `useWindowDimensions`
            nhận kích thước mới và component re-render.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4f6fb",
  },
  screen: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  eyebrow: {
    color: "#0f766e",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  title: {
    color: "#102a43",
    fontSize: 30,
    fontWeight: "800",
    marginTop: 5,
  },
  subtitle: {
    color: "#52657a",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  platformCard: {
    alignItems: "center",
    backgroundColor: "#dff7f3",
    borderColor: "#9adfd5",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    padding: 16,
  },
  platformIcon: {
    alignItems: "center",
    backgroundColor: "#0f766e",
    borderRadius: 12,
    justifyContent: "center",
    minHeight: 54,
    paddingHorizontal: 9,
  },
  platformIconText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "800",
  },
  platformContent: {
    flex: 1,
    marginLeft: 13,
  },
  platformLabel: {
    color: "#0f766e",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  platformName: {
    color: "#102a43",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 2,
  },
  platformDescription: {
    color: "#39605b",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  counterCard: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#e0e6ef",
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 14,
    padding: 20,
  },
  cardLabel: {
    color: "#718096",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.9,
  },
  count: {
    color: "#102a43",
    fontSize: 56,
    fontWeight: "800",
    marginTop: 4,
  },
  countDescription: {
    color: "#52657a",
    fontSize: 13,
    textAlign: "center",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#0f766e",
    borderRadius: 10,
    flex: 1,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#b9c6d6",
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: "#34516e",
    fontSize: 14,
    fontWeight: "800",
  },
  statusCard: {
    backgroundColor: "#edf2f7",
    borderRadius: 13,
    marginTop: 14,
    padding: 15,
  },
  statusText: {
    color: "#34516e",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 5,
  },
  flowCard: {
    backgroundColor: "#ffffff",
    borderColor: "#e0e6ef",
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 14,
    padding: 16,
  },
  sectionTitle: {
    color: "#102a43",
    fontSize: 19,
    fontWeight: "800",
  },
  sectionDescription: {
    color: "#64748b",
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 16,
    marginTop: 4,
  },
  flowRow: {
    flexDirection: "row",
    paddingBottom: 14,
  },
  stepNumber: {
    alignItems: "center",
    backgroundColor: "#e6ebf2",
    borderRadius: 999,
    height: 29,
    justifyContent: "center",
    marginRight: 11,
    width: 29,
  },
  stepNumberActive: {
    backgroundColor: "#0f766e",
  },
  stepNumberText: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "800",
  },
  stepNumberTextActive: {
    color: "#ffffff",
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    color: "#455a70",
    fontSize: 14,
    fontWeight: "800",
  },
  stepTitleActive: {
    color: "#102a43",
  },
  stepDetail: {
    color: "#718096",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  alertButton: {
    backgroundColor: "#102a43",
    borderRadius: 14,
    marginTop: 14,
    padding: 16,
  },
  alertButtonTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
  alertButtonDescription: {
    color: "#c6d3e0",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  dimensionsCard: {
    backgroundColor: "#fff7e6",
    borderColor: "#f5d799",
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 14,
    padding: 16,
  },
  dimensionsValue: {
    color: "#9a5b00",
    fontSize: 24,
    fontWeight: "800",
    marginTop: 4,
  },
  dimensionsDescription: {
    color: "#805b20",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
});
