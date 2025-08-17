// app/user/Receipt.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../supabaseClient";

export default function Receipt() {
  const router = useRouter();
  const [latestOrder, setLatestOrder] = useState<any>(null);

  useEffect(() => {
    const fetchLatestOrder = async () => {
      const { data, error } = await supabase
        .from("order_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error("Error fetching order:", error.message);
      } else {
        setLatestOrder(data);
      }
    };

    fetchLatestOrder();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thank you for your order! 🎉</Text>

      {latestOrder ? (
        <View style={styles.card}>
          <Text style={styles.label}>Product: {latestOrder.product_name}</Text>
          <Text style={styles.label}>Quantity: {latestOrder.quantity}</Text>
          <Text style={styles.label}>
            Total: ₱{latestOrder.total_price.toFixed(2)}
          </Text>
          <Text style={styles.label}>
            Delivery Address: {latestOrder.delivery_address}
          </Text>
          <Text style={styles.date}>
            Ordered on: {new Date(latestOrder.order_date).toLocaleString()}
          </Text>
        </View>
      ) : (
        <Text style={styles.label}>Loading latest order...</Text>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace("../Components/MainDrawer")} // ✅ Diretso sa Home lang
      >
        <Text style={styles.buttonText}>OK</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    width: "100%",
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  date: {
    fontSize: 14,
    color: "gray",
    marginTop: 5,
  },
  button: {
    backgroundColor: "#2e86de",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
