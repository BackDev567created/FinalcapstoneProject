// app/user/PaymentScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Image,
  Modal,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "../../supabaseClient";

const PaymentScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{
    user_id?: string | string[];
    product_name?: string | string[];
    quantity?: string | string[];
    total_price?: string | string[];
    delivery_address?: string | string[];
  }>();

  // Normalize params
  const getOne = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v);

  const param_user_id = getOne(params.user_id);
  const product_name = getOne(params.product_name) ?? "";
  const quantity = Number(getOne(params.quantity) ?? 1);
  const total_price = Number(getOne(params.total_price) ?? 0);
  const delivery_address = getOne(params.delivery_address) ?? "";

  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleContinue = async () => {
    if (!selectedMethod) {
      Alert.alert("Select Payment", "Please select a payment method first.");
      return;
    }

    try {
      // Ensure user_id
      let user_id = param_user_id ?? null;
      if (!user_id) {
        const { data: authData, error: authErr } = await supabase.auth.getUser();
        if (authErr) throw authErr;
        user_id = authData.user?.id ?? null;
      }
      if (!user_id) {
        Alert.alert("Error", "No user is signed in.");
        return;
      }

      // Insert order
      const orderData = {
        user_id,
        product_name,
        quantity,
        total_price,
        delivery_address,
      };

      const { error } = await supabase.from("order_history").insert([orderData]);
      if (error) {
        console.error("Error saving order:", error.message);
        Alert.alert("Error", "Could not save order.");
        return;
      }

      // Show thank-you modal
      setShowModal(true);
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err.message ?? "Something went wrong.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Choose Payment Method</Text>

      {/* COD */}
      <TouchableOpacity
        style={[styles.optionBox, selectedMethod === "cod" && styles.selectedBox]}
        onPress={() => setSelectedMethod("cod")}
      >
        <Image source={require("../../assets/cod.png")} style={styles.icon} />
        <Text style={styles.optionText}>Cash on Delivery</Text>
      </TouchableOpacity>

      {/* GCash */}
      <TouchableOpacity
        style={[styles.optionBox, selectedMethod === "gcash" && styles.selectedBox]}
        onPress={() => setSelectedMethod("gcash")}
      >
        <Image source={require("../../assets/gcash.png")} style={styles.icon} />
        <Text style={styles.optionText}>GCash</Text>
      </TouchableOpacity>

      {/* Continue */}
      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>

      {/* Thank You Modal */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Thank you for your order!</Text>
            <Text style={styles.modalMessage}>
              Your order has been placed successfully.
            </Text>

            <TouchableOpacity
              style={styles.okButton}
              onPress={() => {
                setShowModal(false);
                // ✅ Directly go to Receipt inside /user folder
                router.push({
                  pathname: "/user/Receipt",
                  params: {
                    product_name,
                    quantity: quantity.toString(),
                    total_price: total_price.toString(),
                    delivery_address,
                  },
                });
              }}
            >
              <Text style={styles.okText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    justifyContent: "center",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },
  optionBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    justifyContent: "center",
  },
  selectedBox: {
    borderColor: "#007bff",
    backgroundColor: "#f0f8ff",
  },
  optionText: {
    fontSize: 18,
    fontWeight: "500",
    marginLeft: 10,
  },
  icon: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  continueButton: {
    backgroundColor: "#007bff",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  continueText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalBox: {
    backgroundColor: "white",
    padding: 25,
    borderRadius: 12,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  okButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  okText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
