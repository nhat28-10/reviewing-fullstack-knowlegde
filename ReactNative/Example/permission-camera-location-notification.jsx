/*
  React Native example: Permission for Camera, Location and Notification

  Cách chạy:
  - Tạo app Expo.
  - Cài expo-camera, expo-location, expo-notifications.
  - Copy component App trong file này vào App.jsx.
*/

import React, { useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Camera } from "expo-camera";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";

function formatPermission(permission) {
  if (!permission) {
    return "Not requested";
  }

  return `${permission.status} | granted: ${permission.granted ? "yes" : "no"}`;
}

function openAppSettings() {
  Alert.alert(
    "Permission blocked",
    "Bạn cần mở Settings để cấp lại quyền cho ứng dụng.",
    [
      { text: "Cancel" },
      { text: "Open Settings", onPress: () => Linking.openSettings() },
    ],
  );
}

export default function App() {
  const [cameraPermission, setCameraPermission] = useState(null);
  const [locationPermission, setLocationPermission] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState(null);
  const [locationText, setLocationText] = useState("No location yet");

  async function handleCameraPermission() {
    const permission = await Camera.requestCameraPermissionsAsync();
    setCameraPermission(permission);

    if (permission.granted) {
      Alert.alert("Camera", "Camera permission granted.");
      return;
    }

    if (!permission.canAskAgain) {
      openAppSettings();
    }
  }

  async function handleLocationPermission() {
    const permission = await Location.requestForegroundPermissionsAsync();
    setLocationPermission(permission);

    if (!permission.granted) {
      if (!permission.canAskAgain) {
        openAppSettings();
      }

      return;
    }

    const currentLocation = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = currentLocation.coords;

    setLocationText(
      `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
    );
  }

  async function handleNotificationPermission() {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Default",
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const permission = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });

    setNotificationPermission(permission);

    if (!permission.granted && !permission.canAskAgain) {
      openAppSettings();
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Permissions</Text>
        <Text style={styles.description}>
          Xin quyền đúng lúc người dùng cần tính năng: camera, vị trí và
          notification.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Camera</Text>
          <Text style={styles.status}>{formatPermission(cameraPermission)}</Text>
          <Pressable style={styles.primaryButton} onPress={handleCameraPermission}>
            <Text style={styles.primaryButtonText}>Request Camera</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Location</Text>
          <Text style={styles.status}>{formatPermission(locationPermission)}</Text>
          <Text style={styles.helperText}>Current: {locationText}</Text>
          <Pressable
            style={styles.primaryButton}
            onPress={handleLocationPermission}
          >
            <Text style={styles.primaryButtonText}>Request Location</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Notification</Text>
          <Text style={styles.status}>
            {formatPermission(notificationPermission)}
          </Text>
          <Pressable
            style={styles.primaryButton}
            onPress={handleNotificationPermission}
          >
            <Text style={styles.primaryButtonText}>Request Notification</Text>
          </Pressable>
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
  container: {
    flex: 1,
    gap: 14,
    justifyContent: "center",
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
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
  },
  cardTitle: {
    color: "#17202a",
    fontSize: 18,
    fontWeight: "700",
  },
  status: {
    color: "#5f6b7a",
    fontSize: 14,
    marginTop: 8,
  },
  helperText: {
    color: "#5f6b7a",
    fontSize: 13,
    marginTop: 4,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#2563eb",
    borderRadius: 8,
    marginTop: 14,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
});
