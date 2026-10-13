/*
  React Native example: Responsive UI

  Cách chạy:
  - Tạo app React Native hoặc Expo.
  - Copy component App trong file này vào App.jsx.
*/

import React, { useMemo } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

const products = [
  { id: "1", name: "Laptop", price: "$1200" },
  { id: "2", name: "Mouse", price: "$25" },
  { id: "3", name: "Keyboard", price: "$80" },
  { id: "4", name: "Monitor", price: "$260" },
  { id: "5", name: "Headphone", price: "$95" },
  { id: "6", name: "Webcam", price: "$70" },
  { id: "7", name: "Desk Lamp", price: "$40" },
  { id: "8", name: "USB Hub", price: "$30" },
];

export default function App() {
  const { width } = useWindowDimensions();

  const columns = useMemo(() => {
    if (width >= 900) {
      return 3;
    }

    if (width >= 600) {
      return 2;
    }

    return 1;
  }, [width]);

  const contentMaxWidth = width >= 900 ? 840 : undefined;
  const cardWidth = `${100 / columns}%`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.screen, { maxWidth: contentMaxWidth }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Responsive Products</Text>
          <Text style={styles.subtitle}>
            Width: {Math.round(width)} | Columns: {columns}
          </Text>
        </View>

        <FlatList
          key={columns}
          data={products}
          numColumns={columns}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View
              style={[
                styles.cardWrapper,
                {
                  paddingHorizontal: columns > 1 ? 6 : 0,
                  width: cardWidth,
                },
              ]}
            >
              <View style={styles.card}>
                <View style={styles.productImage}>
                  <Text style={styles.productInitial}>{item.name[0]}</Text>
                </View>

                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productPrice}>{item.price}</Text>
              </View>
            </View>
          )}
          ListHeaderComponent={
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Breakpoint</Text>
              <Text style={styles.infoText}>
                Dưới 600: 1 cột. Từ 600: 2 cột. Từ 900: 3 cột và giới hạn
                chiều rộng nội dung.
              </Text>
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
    alignSelf: "center",
    flex: 1,
    padding: 20,
    width: "100%",
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
  listContent: {
    paddingBottom: 24,
  },
  infoBox: {
    backgroundColor: "#e8f1ff",
    borderRadius: 8,
    marginBottom: 12,
    padding: 16,
  },
  infoTitle: {
    color: "#1f3a5f",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
  },
  infoText: {
    color: "#17202a",
    fontSize: 14,
    lineHeight: 20,
  },
  cardWrapper: {
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
  },
  productImage: {
    alignItems: "center",
    aspectRatio: 1.8,
    backgroundColor: "#dbeafe",
    borderRadius: 8,
    justifyContent: "center",
    marginBottom: 12,
  },
  productInitial: {
    color: "#2563eb",
    fontSize: 28,
    fontWeight: "700",
  },
  productName: {
    color: "#17202a",
    fontSize: 16,
    fontWeight: "700",
  },
  productPrice: {
    color: "#5f6b7a",
    fontSize: 14,
    marginTop: 4,
  },
});
