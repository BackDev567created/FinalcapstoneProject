// app/user/Receipt.tsx
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "../../supabaseClient";

interface OrderData {
  id: string;
  total_amount: number;
  payment_method: string;
  status: string;
  delivery_address: string;
  notes: string;
  created_at: string;
  user?: {
    full_name: string;
  };
}

export default function Receipt() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  // Get order ID from navigation params
  const getOne = (v?: string | string[]): string | undefined => {
    if (Array.isArray(v)) return v[0];
    return v;
  };

  const order_id = getOne(params.order_id);
  const customer_name = getOne(params.customer_name) || "Customer";
  const payment_method = getOne(params.payment_method) || "";

  useEffect(() => {
    if (order_id) {
      fetchOrderDetails();
    }
  }, [order_id]);

  const fetchOrderDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          user:users(full_name)
        `)
        .eq('id', order_id)
        .single();

      if (error) throw error;
      setOrderData(data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading receipt...</Text>
      </View>
    );
  }

  if (!orderData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Order not found</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace("/Components/MainDrawer")}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Order Confirmed! 🎉</Text>
      <Text style={styles.subtitle}>Order ID: #{orderData.id.substring(0, 8)}</Text>

      <View style={styles.card}>
        {/* Order Details */}
        <View style={styles.detailRow}>
          <Text style={styles.label}>Order Status:</Text>
          <Text style={[styles.value, styles.statusBadge]}>{orderData.status.toUpperCase()}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Total Amount:</Text>
          <Text style={styles.price}>₱{orderData.total_amount.toFixed(2)}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Payment Method:</Text>
          <Text style={styles.value}>{(payment_method || orderData.payment_method).toUpperCase()}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Customer:</Text>
          <Text style={styles.value}>{orderData.user?.full_name || customer_name}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Delivery Address:</Text>
          <Text style={styles.value}>{orderData.delivery_address}</Text>
        </View>

        {orderData.notes && (
          <View style={styles.detailRow}>
            <Text style={styles.label}>Order Notes:</Text>
            <Text style={styles.value}>{orderData.notes}</Text>
          </View>
        )}

        <Text style={styles.date}>
          Ordered on: {new Date(orderData.created_at).toLocaleString()}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace("/Components/MainDrawer")}
      >
        <Text style={styles.buttonText}>Done</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    padding: 20,
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 18,
    color: "#dc3545",
    textAlign: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
    color: "#007bff",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    width: "100%",
    padding: 20,
    borderRadius: 12,
    backgroundColor: "#f9f9f9",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    alignSelf: "center",
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingVertical: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  value: {
    fontSize: 16,
    color: "#555",
  },
  statusBadge: {
    color: "#4CAF50",
    fontWeight: "bold",
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007bff",
  },
  date: {
    fontSize: 14,
    color: "gray",
    marginTop: 15,
    textAlign: "center",
    fontStyle: "italic",
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});