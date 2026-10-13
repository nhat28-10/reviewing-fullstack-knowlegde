/*
  React Native example: AsyncStorage and SecureStore

  Cách chạy:
  - Tạo app React Native hoặc Expo.
  - Cài @react-native-async-storage/async-storage.
  - Nếu dùng Expo, cài expo-secure-store.
  - Copy component App trong file này vào App.jsx.
*/

import React, { useEffect, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

const THEME_KEY = "@demo/theme";
const REFRESH_TOKEN_KEY = "refreshToken";

export default function App() {
  const [theme, setTheme] = useState("light");
  const [refreshToken, setRefreshToken] = useState(null);
  const [message, setMessage] = useState("Đang đọc dữ liệu đã lưu...");

  useEffect(() => {
    restoreSavedData();
  }, []);

  async function restoreSavedData() {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_KEY);
      const savedToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

      if (savedTheme) {
        setTheme(savedTheme);
      }

      setRefreshToken(savedToken);
      setMessage("Đã đọc xong dữ liệu từ storage.");
    } catch (error) {
      setMessage("Không thể đọc dữ liệu từ storage.");
    }
  }

  async function handleToggleTheme() {
    try {
      const nextTheme = theme === "light" ? "dark" : "light";

      await AsyncStorage.setItem(THEME_KEY, nextTheme);
      setTheme(nextTheme);
      setMessage(`Đã lưu theme "${nextTheme}" bằng AsyncStorage.`);
    } catch (error) {
      setMessage("Không thể lưu theme.");
    }
  }

  async function handleLogin() {
    try {
      const fakeRefreshToken = `refresh-token-${Date.now()}`;

      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, fakeRefreshToken);
      setRefreshToken(fakeRefreshToken);
      setMessage("Đã lưu refresh token bằng SecureStore.");
    } catch (error) {
      setMessage("Không thể lưu refresh token.");
    }
  }

  async function handleLogout() {
    try {
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      setRefreshToken(null);
      setMessage("Đã xóa refresh token khi logout.");
    } catch (error) {
      setMessage("Không thể xóa refresh token.");
    }
  }

  const isDark = theme === "dark";

  return (
    <SafeAreaView style={[styles.safeArea, isDark && styles.safeAreaDark]}>
      <View style={styles.container}>
        <Text style={[styles.title, isDark && styles.textLight]}>
          AsyncStorage & SecureStore
        </Text>
        <Text style={[styles.description, isDark && styles.descriptionDark]}>
          Theme được lưu bằng AsyncStorage. Refresh token được lưu bằng
          SecureStore.
        </Text>

        <View style={[styles.card, isDark && styles.cardDark]}>
          <Text style={[styles.label, isDark && styles.textLight]}>Theme</Text>
          <Text style={[styles.value, isDark && styles.descriptionDark]}>
            {theme}
          </Text>

          <Pressable style={styles.primaryButton} onPress={handleToggleTheme}>
            <Text style={styles.primaryButtonText}>Toggle Theme</Text>
          </Pressable>
        </View>

        <View style={[styles.card, isDark && styles.cardDark]}>
          <Text style={[styles.label, isDark && styles.textLight]}>
            Auth Session
          </Text>
          <Text style={[styles.value, isDark && styles.descriptionDark]}>
            {refreshToken ? "Logged in" : "Logged out"}
          </Text>

          <Text
            numberOfLines={1}
            style={[styles.tokenText, isDark && styles.descriptionDark]}
          >
            Token: {refreshToken ?? "empty"}
          </Text>

          <View style={styles.buttonRow}>
            <Pressable style={styles.primaryButton} onPress={handleLogin}>
              <Text style={styles.primaryButtonText}>Login</Text>
            </Pressable>

            <Pressable style={styles.secondaryButton} onPress={handleLogout}>
              <Text style={styles.secondaryButtonText}>Logout</Text>
            </Pressable>
          </View>
        </View>

        <View style={[styles.messageBox, isDark && styles.messageBoxDark]}>
          <Text style={[styles.messageText, isDark && styles.textLight]}>
            {message}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4f6f8",
  },
  safeAreaDark: {
    backgroundColor: "#111827",
  },
  container: {
    flex: 1,
    gap: 16,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    color: "#17202a",
    fontSize: 26,
    fontWeight: "700",
  },
  textLight: {
    color: "#ffffff",
  },
  description: {
    color: "#5f6b7a",
    fontSize: 15,
    lineHeight: 22,
  },
  descriptionDark: {
    color: "#cbd5e1",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
  },
  cardDark: {
    backgroundColor: "#1f2937",
  },
  label: {
    color: "#17202a",
    fontSize: 16,
    fontWeight: "700",
  },
  value: {
    color: "#5f6b7a",
    fontSize: 15,
    marginTop: 6,
  },
  tokenText: {
    color: "#5f6b7a",
    fontSize: 13,
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#2563eb",
    borderRadius: 8,
    flex: 1,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#2563eb",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: "#2563eb",
    fontSize: 15,
    fontWeight: "700",
  },
  messageBox: {
    backgroundColor: "#e8f1ff",
    borderRadius: 8,
    padding: 14,
  },
  messageBoxDark: {
    backgroundColor: "#263449",
  },
  messageText: {
    color: "#1f3a5f",
    fontSize: 14,
    lineHeight: 20,
  },
});
