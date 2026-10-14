/*
  React Native example: App lifecycle with AppState

  Cách chạy:
  - Tạo app React Native hoặc Expo.
  - Copy component App trong file này vào App.jsx.
*/

import React, { useEffect, useRef, useState } from "react";
import {
  AppState,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

function createLogMessage(message) {
  const time = new Date().toLocaleTimeString();
  return `${time} - ${message}`;
}

export default function App() {
  const previousState = useRef(AppState.currentState);
  const [appState, setAppState] = useState(AppState.currentState ?? "unknown");
  const [activeCount, setActiveCount] = useState(0);
  const [logs, setLogs] = useState([
    createLogMessage(`Initial state: ${AppState.currentState ?? "unknown"}`),
  ]);

  useEffect(() => {
    const changeSubscription = AppState.addEventListener(
      "change",
      (nextState) => {
        const wasNotActive = previousState.current !== "active";
        const isNowActive = nextState === "active";

        setAppState(nextState);
        setLogs((currentLogs) => [
          createLogMessage(
            `change: ${previousState.current ?? "unknown"} -> ${nextState}`,
          ),
          ...currentLogs,
        ]);

        if (wasNotActive && isNowActive) {
          setActiveCount((currentCount) => currentCount + 1);
          setLogs((currentLogs) => [
            createLogMessage("App returned to active. Refresh data here."),
            ...currentLogs,
          ]);
        }

        previousState.current = nextState;
      },
    );

    const memorySubscription = AppState.addEventListener("memoryWarning", () => {
      setLogs((currentLogs) => [
        createLogMessage("memoryWarning: clear cache if needed."),
        ...currentLogs,
      ]);
    });

    const androidSubscriptions =
      Platform.OS === "android"
        ? [
            AppState.addEventListener("focus", () => {
              setLogs((currentLogs) => [
                createLogMessage("Android focus"),
                ...currentLogs,
              ]);
            }),
            AppState.addEventListener("blur", () => {
              setLogs((currentLogs) => [
                createLogMessage("Android blur"),
                ...currentLogs,
              ]);
            }),
          ]
        : [];

    return () => {
      changeSubscription.remove();
      memorySubscription.remove();
      androidSubscriptions.forEach((subscription) => subscription.remove());
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>App Lifecycle</Text>
        <Text style={styles.description}>
          Chuyển app xuống background rồi mở lại để xem AppState thay đổi.
        </Text>

        <View style={styles.statusCard}>
          <Text style={styles.label}>Current AppState</Text>
          <Text style={styles.stateValue}>{appState}</Text>

          <Text style={styles.label}>Returned to active</Text>
          <Text style={styles.countValue}>{activeCount} lần</Text>
        </View>

        <View style={styles.logHeader}>
          <Text style={styles.logTitle}>Lifecycle logs</Text>
          <Text style={styles.logHint}>
            Android có thêm event focus/blur.
          </Text>
        </View>

        <ScrollView style={styles.logBox} contentContainerStyle={styles.logList}>
          {logs.map((log, index) => (
            <Text key={`${log}-${index}`} style={styles.logText}>
              {log}
            </Text>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4f6f8",
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    color: "#17202a",
    fontSize: 26,
    fontWeight: "700",
  },
  description: {
    color: "#5f6b7a",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  statusCard: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    marginTop: 18,
    padding: 16,
  },
  label: {
    color: "#5f6b7a",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 10,
    textTransform: "uppercase",
  },
  stateValue: {
    color: "#2563eb",
    fontSize: 28,
    fontWeight: "700",
    marginTop: 4,
  },
  countValue: {
    color: "#17202a",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 4,
  },
  logHeader: {
    marginTop: 18,
  },
  logTitle: {
    color: "#17202a",
    fontSize: 18,
    fontWeight: "700",
  },
  logHint: {
    color: "#5f6b7a",
    fontSize: 14,
    marginTop: 4,
  },
  logBox: {
    backgroundColor: "#111827",
    borderRadius: 8,
    marginTop: 10,
  },
  logList: {
    padding: 14,
  },
  logText: {
    color: "#d1d5db",
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 8,
  },
});
