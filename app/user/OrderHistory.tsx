// app/user/OrderHistory.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Feather";
import { supabase } from "../../supabaseClient";
import { useRouter } from "expo-router";

const OrderHistory = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.log("No user logged in");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("timestamp", { ascending: false });

    if (error) {
      console.log("Error fetching orders:", error.message);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  const toggleSelect = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((item) => item !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectAll) setSelected([]);
    else setSelected(orders.map((item) => item.id));
    setSelectAll(!selectAll);
  };

  const deleteSelected = async () => {
    if (!selected.length) {
      Alert.alert("No orders selected", "Please select orders to delete.");
      return;
    }

    const { error } = await supabase
      .from("orders")
      .delete()
      .in("id", selected);

    if (error) Alert.alert("Error", error.message);
    else {
      Alert.alert("Deleted", "Selected orders deleted.");
      setOrders(orders.filter((o) => !selected.includes(o.id)));
      setSelected([]);
      setSelectAll(false);
    }
  };

  const deleteOne = async (id: string) => {
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) Alert.alert("Error", error.message);
    else {
      Alert.alert("Deleted", "Order deleted.");
      setOrders(orders.filter((o) => o.id !== id));
      setSelected(selected.filter((s) => s !== id));
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View
      style={[
        styles.card,
        selected.includes(item.id) && { backgroundColor: "#ffe5e5" },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.product}>{item.product_name}</Text>
        <Text style={styles.details}>Qty: {item.quantity}</Text>
        <Text style={styles.details}>Total: ₱{item.total_price}</Text>
        <Text style={styles.details}>Payment: {item.payment_method}</Text>
        <Text style={styles.details}>Status: {item.status}</Text>
        <Text style={styles.details}>Address: {item.delivery_address}</Text>
        <Text style={styles.date}>
          {new Date(item.timestamp).toLocaleString()}
        </Text>

        <TouchableOpacity
          style={styles.receiptButton}
          onPress={() =>
            router.push({
              pathname: "/user/Receipt",
              params: { orderId: item.id },
            })
          }
        >
          <Text style={styles.receiptButtonText}>View Receipt</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => deleteOne(item.id)} style={{ marginLeft: 10 }}>
        <Icon name="trash-2" size={22} color="red" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={{ alignItems: "baseline", margin: 16 }}
        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      >
        <Icon name="menu" size={24} color="#000" />
      </TouchableOpacity>

      <View style={{ flex: 1, marginTop: 10, paddingHorizontal: 16 }}>
        <Text style={styles.title}>Order History</Text>

        {orders.length > 0 && (
          <View style={styles.controls}>
            <TouchableOpacity style={styles.button} onPress={toggleSelectAll}>
              <Text style={styles.buttonText}>
                {selectAll ? "Unselect All" : "Select All"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "red" }]}
              onPress={deleteSelected}
            >
              <Text style={[styles.buttonText, { color: "#fff" }]}>
                Delete Selected
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {loading ? (
          <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />
        ) : orders.length === 0 ? (
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            No orders found.
          </Text>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F0F0" },
  title: { fontSize: 22, fontWeight: "600", marginBottom: 16, textAlign: "center" },
  controls: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  button: { padding: 10, backgroundColor: "#ddd", borderRadius: 8 },
  buttonText: { fontWeight: "600", color: "#000" },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  product: { fontSize: 18, fontWeight: "600", color: "#000" },
  details: { fontSize: 14, color: "#333", marginTop: 2 },
  date: { fontSize: 12, color: "#666", marginTop: 8 },
  receiptButton: {
    marginTop: 8,
    backgroundColor: "#2e86de",
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: "center",
  },
  receiptButtonText: { color: "#fff", fontWeight: "bold" },
});

export default OrderHistory;
