/*
  React Native example: Passing params, navigate and goBack

  Cách chạy:
  - Tạo app React Native hoặc Expo.
  - Cài React Navigation và Native Stack.
  - Copy component App trong file này vào App.jsx.
*/

import React from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

const products = [
  { id: "p101", name: "Laptop", price: "$1200" },
  { id: "p102", name: "Mouse", price: "$25" },
  { id: "p103", name: "Keyboard", price: "$80" },
];

function ProductListScreen({ navigation, route }) {
  const selectedProductId = route.params?.selectedProductId;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Products</Text>
        <Text style={styles.description}>
          Bấm một sản phẩm để navigate sang ProductDetail kèm productId.
        </Text>

        {selectedProductId && (
          <View style={styles.noticeBox}>
            <Text style={styles.noticeText}>
              Last viewed product: {selectedProductId}
            </Text>
          </View>
        )}

        <View style={styles.list}>
          {products.map((product) => (
            <Pressable
              key={product.id}
              style={styles.productCard}
              onPress={() =>
                navigation.navigate("ProductDetail", {
                  productId: product.id,
                })
              }
            >
              <View>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productPrice}>{product.price}</Text>
              </View>

              <Text style={styles.linkText}>View</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

function ProductDetailScreen({ navigation, route }) {
  const productId = route.params?.productId;
  const product = products.find((item) => item.id === productId);

  function handleGoBack() {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }

  function handleReturnWithParams() {
    navigation.navigate("ProductList", {
      selectedProductId: productId,
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Product Detail</Text>
        <Text style={styles.description}>
          Màn hình này đọc dữ liệu bằng route.params.productId.
        </Text>

        <View style={styles.detailBox}>
          <Text style={styles.label}>Product ID</Text>
          <Text style={styles.value}>{productId ?? "unknown"}</Text>

          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{product?.name ?? "Not found"}</Text>

          <Text style={styles.label}>Price</Text>
          <Text style={styles.value}>{product?.price ?? "-"}</Text>
        </View>

        <Pressable style={styles.primaryButton} onPress={handleGoBack}>
          <Text style={styles.primaryButtonText}>Go Back</Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={handleReturnWithParams}>
          <Text style={styles.secondaryButtonText}>
            Return to List with params
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="ProductList"
          component={ProductListScreen}
          options={{ title: "Products" }}
        />
        <Stack.Screen
          name="ProductDetail"
          component={ProductDetailScreen}
          options={{ title: "Product Detail" }}
          initialParams={{ productId: "p101" }}
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
  noticeBox: {
    backgroundColor: "#e8f1ff",
    borderRadius: 8,
    marginTop: 16,
    padding: 12,
  },
  noticeText: {
    color: "#1f3a5f",
    fontSize: 14,
    fontWeight: "700",
  },
  list: {
    gap: 12,
    marginTop: 20,
  },
  productCard: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  productName: {
    color: "#17202a",
    fontSize: 17,
    fontWeight: "700",
  },
  productPrice: {
    color: "#5f6b7a",
    fontSize: 14,
    marginTop: 4,
  },
  linkText: {
    color: "#2563eb",
    fontSize: 15,
    fontWeight: "700",
  },
  detailBox: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    marginTop: 20,
    padding: 16,
  },
  label: {
    color: "#5f6b7a",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 12,
    textTransform: "uppercase",
  },
  value: {
    color: "#17202a",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 4,
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
    marginTop: 12,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: "#2563eb",
    fontSize: 16,
    fontWeight: "700",
  },
});
