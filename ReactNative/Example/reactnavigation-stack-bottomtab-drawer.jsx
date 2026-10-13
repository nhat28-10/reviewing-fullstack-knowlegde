/*
  React Native example: React Navigation Stack, Bottom Tab, Drawer

  Cách chạy:
  - Tạo app React Native hoặc Expo.
  - Cài React Navigation và các navigator cần dùng.
  - Copy component App trong file này vào App.jsx.
*/

import "react-native-gesture-handler";
import React from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

function ScreenContainer({ title, description, children }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        {children}
      </View>
    </SafeAreaView>
  );
}

function HomeScreen({ navigation }) {
  return (
    <ScreenContainer
      title="Home"
      description="Home nằm trong Stack. Bấm nút bên dưới để đi sâu vào Detail."
    >
      <Pressable
        style={styles.primaryButton}
        onPress={() => navigation.navigate("Detail", { productId: "p-1001" })}
      >
        <Text style={styles.primaryButtonText}>Open Product Detail</Text>
      </Pressable>
    </ScreenContainer>
  );
}

function DetailScreen({ route, navigation }) {
  const productId = route.params?.productId ?? "unknown";

  return (
    <ScreenContainer
      title="Product Detail"
      description={`Product id: ${productId}. Màn hình này được đẩy lên Stack.`}
    >
      <Pressable style={styles.secondaryButton} onPress={navigation.goBack}>
        <Text style={styles.secondaryButtonText}>Go Back</Text>
      </Pressable>
    </ScreenContainer>
  );
}

function SearchScreen() {
  return (
    <ScreenContainer
      title="Search"
      description="Search là một tab chính, ngang hàng với Home và Profile."
    />
  );
}

function ProfileScreen() {
  return (
    <ScreenContainer
      title="Profile"
      description="Profile được mở bằng Bottom Tab Navigator."
    />
  );
}

function SettingsScreen() {
  return (
    <ScreenContainer
      title="Settings"
      description="Settings được mở từ Drawer Navigator."
    />
  );
}

function AboutScreen() {
  return (
    <ScreenContainer
      title="About"
      description="About cũng là một route trong Drawer."
    />
  );
}

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Home Stack" }}
      />
      <Stack.Screen
        name="Detail"
        component={DetailScreen}
        options={{ title: "Product Detail" }}
      />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{ headerShown: false, title: "Home" }}
      />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator>
        <Drawer.Screen
          name="Main"
          component={MainTabs}
          options={{ headerShown: false, title: "Main Tabs" }}
        />
        <Drawer.Screen name="Settings" component={SettingsScreen} />
        <Drawer.Screen name="About" component={AboutScreen} />
      </Drawer.Navigator>
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
    marginTop: 8,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#2563eb",
    borderRadius: 8,
    marginTop: 20,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#2563eb",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 20,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: "#2563eb",
    fontSize: 16,
    fontWeight: "700",
  },
});
