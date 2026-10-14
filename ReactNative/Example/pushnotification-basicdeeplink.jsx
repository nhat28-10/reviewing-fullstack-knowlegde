/*
  React Native example: Push Notification and Basic Deep Link

  Cách chạy:
  - Tạo app Expo.
  - Cài expo-notifications, expo-linking, @react-navigation/native,
    @react-navigation/native-stack.
  - Copy component App trong file này vào App.jsx.
*/

import React, { useEffect, useState } from "react";
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
import * as ExpoLinking from "expo-linking";
import * as Notifications from "expo-notifications";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const Stack = createNativeStackNavigator();

const linking = {
  prefixes: [ExpoLinking.createURL("/"), "myapp://"],
  config: {
    screens: {
      Home: "home",
      OrderDetail: "orders/:orderId",
    },
  },
};

async function requestNotificationPermission() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();

  if (existingStatus === "granted") {
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

function HomeScreen({ navigation }) {
  const [permissionStatus, setPermissionStatus] = useState("unknown");
  const demoUrl = ExpoLinking.createURL("/orders/o300");

  async function handleRequestPermission() {
    const granted = await requestNotificationPermission();
    setPermissionStatus(granted ? "granted" : "denied");

    if (!granted) {
      Alert.alert("Permission", "Notification permission was not granted.");
    }
  }

  async function handleScheduleNotification() {
    const granted = await requestNotificationPermission();
    setPermissionStatus(granted ? "granted" : "denied");

    if (!granted) {
      Alert.alert("Permission", "Notification permission was not granted.");
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Order Delivered",
        body: "Tap to open order o300.",
        data: {
          url: demoUrl,
          orderId: "o300",
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 2,
      },
    });

    Alert.alert("Scheduled", "Notification will appear in about 2 seconds.");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Push + Deep Link</Text>
        <Text style={styles.description}>
          Example này dùng local notification để mô phỏng push notification có
          data URL.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Permission</Text>
          <Text style={styles.value}>{permissionStatus}</Text>

          <Pressable style={styles.primaryButton} onPress={handleRequestPermission}>
            <Text style={styles.primaryButtonText}>Request Notification</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Deep Link URL</Text>
          <Text style={styles.urlText}>{demoUrl}</Text>

          <Pressable
            style={styles.primaryButton}
            onPress={() => navigation.navigate("OrderDetail", { orderId: "o300" })}
          >
            <Text style={styles.primaryButtonText}>Open Order Directly</Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={handleScheduleNotification}
          >
            <Text style={styles.secondaryButtonText}>Schedule Notification</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function OrderDetailScreen({ route }) {
  const orderId = route.params?.orderId ?? "unknown";

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Order Detail</Text>
        <Text style={styles.description}>
          Màn hình này được mở bằng route params hoặc deep link.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Order ID</Text>
          <Text style={styles.orderValue}>{orderId}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  useEffect(() => {
    const subscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const url = response.notification.request.content.data?.url;

        if (typeof url === "string") {
          Linking.openURL(url);
        }
      });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          name="OrderDetail"
          component={OrderDetailScreen}
          options={{ title: "Order Detail" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4f6f8",
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
  label: {
    color: "#5f6b7a",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  value: {
    color: "#17202a",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 6,
  },
  orderValue: {
    color: "#2563eb",
    fontSize: 28,
    fontWeight: "700",
    marginTop: 6,
  },
  urlText: {
    color: "#17202a",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
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
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#2563eb",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 10,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: "#2563eb",
    fontSize: 15,
    fontWeight: "700",
  },
});
