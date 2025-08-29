// app/user/PaymentScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Image,
  Modal,
  Alert,
  ActivityIndicator,
  ScrollView
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "../../supabaseClient";
import { useSignup } from "../../context/SignupContext";

const PaymentScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { signupData } = useSignup();

  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState<string>("Customer");

  // Normalize params safely
  const getOne = (v?: string | string[]): string | undefined => {
    if (Array.isArray(v)) return v[0];
    return v;
  };

  // Extract ONLY the important parameters
  const product_name = getOne(params.product_name) || "";
  const quantity = Number(getOne(params.quantity) || 1);
  const total_price = Number(getOne(params.total_price) || 0);
  const delivery_address = getOne(params.delivery_address) || "";
  const kilograms = Number(getOne(params.kilograms) || 0);
  const renewal_type = getOne(params.renewal_type) || "";
  const image_url = getOne(params.image_url) || "";

  // Get current user and customer name
  useEffect(() => {
    const getUserAndProfile = async () => {
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          console.log("No user logged in");
          return;
        }

        setUserId(user.id);

        // Get customer name from users table
        const { data: userData, error: profileError } = await supabase
          .from("users")
          .select("full_name")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.log("Error fetching user:", profileError.message);
          // Fallback to signup context
          if (signupData?.firstName && signupData?.lastName) {
            setCustomerName(`${signupData.firstName} ${signupData.lastName}`);
          }
        } else if (userData) {
          setCustomerName(userData.full_name || "Customer");
        }
      } catch (error) {
        console.error("Error in getUserAndProfile:", error);
      }
    };

    getUserAndProfile();
  }, [signupData]);

  const handleContinue = async () => {
    if (!selectedMethod) {
      Alert.alert("Select Payment", "Please select a payment method first.");
      return;
    }

    if (!userId) {
      Alert.alert("Error", "No user is signed in.");
      return;
    }

    setLoading(true);

    try {
      // Prepare order data matching our schema
      const orderData = {
        user_id: userId,
        total_amount: total_price,
        payment_method: selectedMethod,
        status: "pending", // Use lowercase to match enum
        delivery_address: delivery_address,
        notes: `Product: ${product_name}, Quantity: ${quantity}, Weight: ${kilograms}kg, Type: ${renewal_type}`
      };

      console.log("Saving order data:", orderData);

      // Insert into orders table
      const { data, error } = await supabase
        .from("orders")
        .insert([orderData])
        .select()
        .single();

      if (error) {
        console.error("Error saving order:", error);
        Alert.alert("Error", "Could not save order: " + error.message);
        return;
      }

      // Save the order ID
      setOrderId(data.id);
      
      // Show success modal
      setShowModal(true);

    } catch (err: any) {
      console.error("Unexpected error:", err);
      Alert.alert("Error", "Something went wrong: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleModalOk = () => {
    setShowModal(false);
    // Navigate to receipt screen with order ID
    router.push({
      pathname: "/user/Receipt",
      params: {
        order_id: orderId,
        customer_name: customerName,
        payment_method: selectedMethod || ""
      }
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Processing your order...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Choose Payment Method</Text>

        {/* Payment Options */}
        <View style={styles.paymentOptions}>
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
        </View>

        {/* Order Summary - Show ONLY important fields */}
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          
          {image_url ? (
            <Image source={{ uri: image_url }} style={styles.productImage} />
          ) : null}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Product:</Text>
            <Text style={styles.detailValue}>{product_name}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Quantity:</Text>
            <Text style={styles.detailValue}>{quantity}</Text>
          </View>

          {kilograms > 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Kilograms:</Text>
              <Text style={styles.detailValue}>{kilograms} kg</Text>
            </View>
          )}

          {renewal_type && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Renewal Type:</Text>
              <Text style={styles.detailValue}>{renewal_type}</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Price:</Text>
            <Text style={styles.totalPrice}>₱{total_price.toFixed(2)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Customer:</Text>
            <Text style={styles.detailValue}>{customerName}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Delivery:</Text>
            <Text style={styles.detailValue}>{delivery_address}</Text>
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity 
          style={[styles.continueButton, (!selectedMethod || loading) && styles.disabledButton]} 
          onPress={handleContinue}
          disabled={!selectedMethod || loading}
        >
          <Text style={styles.continueText}>
            {loading ? "Processing..." : "Continue to Payment"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Thank You Modal */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Thank you! 🎉</Text>
            <Text style={styles.modalMessage}>
              Your order for {product_name} has been placed successfully.
            </Text>

            <TouchableOpacity
              style={styles.okButton}
              onPress={handleModalOk}
            >
              <Text style={styles.okText}>View Receipt</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
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
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#333",
  },
  paymentOptions: {
    marginBottom: 20,
  },
  optionBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    backgroundColor: "#fafafa",
  },
  selectedBox: {
    borderColor: "#007bff",
    backgroundColor: "#e6f2ff",
  },
  optionText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 12,
    color: "#333",
  },
  icon: {
    width: 35,
    height: 35,
    resizeMode: "contain",
  },
  summaryBox: {
    backgroundColor: "#f8f9fa",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#495057",
    textAlign: "center",
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    alignSelf: "center",
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007bff",
  },
  continueButton: {
    backgroundColor: "#007bff",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: "#ccc",
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
    borderRadius: 16,
    width: "85%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  modalMessage: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#666",
    lineHeight: 22,
  },
  okButton: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 35,
    borderRadius: 8,
  },
  okText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default PaymentScreen;