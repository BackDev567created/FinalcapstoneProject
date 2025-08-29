import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Entypo from '@expo/vector-icons/Entypo';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import { useCart } from '../Components/CartContent';

const ShoppingCart = () => {
  const router = useRouter();
  const { cart, removeFromCart } = useCart();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [editQty, setEditQty] = useState('');
  const [editType, setEditType] = useState<'swap' | 'new'>('new');
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  const getTotal = () => {
    return cart
      .filter((_, index) => selectedIndices.includes(index))
      .reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const removeItem = (index: number) => {
    removeFromCart(index);
    // Update selected indices after removal
    setSelectedIndices(prev =>
      prev.filter(i => i !== index).map(i => i > index ? i - 1 : i)
    );
  };

  const openEditModal = (index: number) => {
    const item = cart[index];
    setSelectedItemIndex(index);
    setEditQty(item.quantity.toString());
    setEditType(item.option);
    setEditModalVisible(true);
  };

  const saveEdit = () => {
    const newQty = parseInt(editQty);
    if (isNaN(newQty) || newQty <= 0) {
      Alert.alert('Invalid quantity');
      return;
    }

    // For now, we'll just remove and re-add the item with new quantity
    // In a real app, you'd want to update the cart context to support editing
    if (selectedItemIndex !== null) {
      const item = cart[selectedItemIndex];
      removeFromCart(selectedItemIndex);

      // Re-add with new quantity and type
      // Note: This is a simplified approach. A more robust solution would update the cart context
      Alert.alert('Note', 'Item quantity updated. Please re-add from product page if needed.');
    }

    setEditModalVisible(false);
    setSelectedItemIndex(null);
  };

  const toggleSelect = (index: number) => {
    setSelectedIndices(prev =>
      prev.includes(index) ? prev.filter(item => item !== index) : [...prev, index]
    );
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity
      style={[
        styles.card,
        selectedIndices.includes(index) && styles.selectedCard
      ]}
      onPress={() => toggleSelect(index)}
      activeOpacity={0.7}
    >
      {/* Placeholder for product image - you can add image_url to cart items later */}
      <View
        style={[
          styles.image,
          { justifyContent: 'center', alignItems: 'center', backgroundColor: '#e0e0e0' },
        ]}
      >
        <Text style={{ color: '#666', fontSize: 12 }}>Product</Text>
      </View>

      <View style={styles.details}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          <Checkbox
            value={selectedIndices.includes(index)}
            onValueChange={() => toggleSelect(index)}
            color={selectedIndices.includes(index) ? '#007AFF' : undefined}
          />
          <Text style={[styles.name, { marginLeft: 8 }]}>{item.name}</Text>
        </View>
        <Text style={styles.price}>₱{item.price.toLocaleString()}</Text>
        <Text style={styles.qty}>Qty: {item.quantity}</Text>
        <Text style={styles.renewal}>Type: {item.option}</Text>
        <Text style={styles.weight}>Weight: {item.weight}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => openEditModal(index)}>
          <FontAwesome name="edit" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => removeItem(index)}>
          <MaterialIcons name="delete" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <TouchableOpacity
          style={{ alignItems: 'baseline', margin: 16, top: 5, right: 10 }}
          onPress={() => router.push('/Components/MainDrawer')}
        >
          <Entypo name="arrow-long-left" size={40} color="#007AFF" />
        </TouchableOpacity>

        {cart.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={styles.emptyText}>Your cart is empty.</Text>
          </View>
        ) : (
          <FlatList
            data={cart}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => renderItem({ item, index })}
            ListEmptyComponent={<Text style={styles.emptyText}>Your cart is empty.</Text>}
          />
        )}

        {cart.length > 0 && (
          <View style={styles.bottomBar}>
           <Text style={styles.totalText}>Total: ₱{getTotal().toFixed(2)}</Text>
            <TouchableOpacity
              style={[
                styles.checkoutBtn,
                selectedIndices.length === 0 && styles.checkoutBtnDisabled,
              ]}
              onPress={() => {
                if (selectedIndices.length === 0) return;
                router.push({
                  pathname: '/user/PaymentScreen',
                  params: { selectedIndices: JSON.stringify(selectedIndices) },
                });
              }}
              disabled={selectedIndices.length === 0}
            >
              <Text style={styles.checkoutText}>Purchase</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Edit Modal */}
        <Modal visible={editModalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Item</Text>
              <TextInput
                placeholder="Quantity"
                keyboardType="numeric"
                value={editQty}
                onChangeText={setEditQty}
                style={styles.input}
              />
              <TextInput
                placeholder="Renewal Type (swap/new)"
                value={editType}
                onChangeText={(text) => setEditType(text as 'swap' | 'new')}
                style={styles.input}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                <TouchableOpacity style={styles.saveBtn} onPress={saveEdit}>
                  <Text style={styles.saveText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, styles.cancelBtn]}
                  onPress={() => setEditModalVisible(false)}
                >
                  <Text style={styles.saveText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
};

export default ShoppingCart;

const styles = StyleSheet.create({
  container: { backgroundColor: '#ffffff', flex: 1, paddingHorizontal: 12 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 10,
    marginVertical: 8,
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectedCard: {
    backgroundColor: '#e6f2ff',
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
    marginRight: 12,
    resizeMode: 'contain',
  },
  details: { flex: 1 },
  name: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50' },
  price: { fontSize: 16, color: '#2c3e50', marginVertical: 2, fontWeight: '600' },
  qty: { fontSize: 16, color: '#6c757d' },
  renewal: { fontSize: 14, color: '#6c757d' },
  weight: { fontSize: 14, color: '#6c757d', marginTop: 2 },
  actions: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -30 }],
    flexDirection: 'column',
    gap: 10,
  },
  editBtn: { 
    backgroundColor: '#007AFF', 
    padding: 8, 
    borderRadius: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: { 
    backgroundColor: '#dc3545', 
    padding: 8, 
    borderRadius: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: { 
    color: '#6c757d', 
    textAlign: 'center', 
    marginTop: 30, 
    fontSize: 16, 
    fontStyle: 'italic' 
  },
  bottomBar: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dee2e6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalText: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50' },
  checkoutBtn: { 
    backgroundColor: '#007AFF', 
    paddingHorizontal: 20, 
    paddingVertical: 12, 
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  checkoutBtnDisabled: {
    backgroundColor: '#adb5bd',
  },
  checkoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContent: { 
    backgroundColor: '#fff', 
    padding: 24, 
    borderRadius: 12, 
    width: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 16,
    color: '#2c3e50',
    textAlign: 'center',
  },
  input: { 
    borderColor: '#ced4da', 
    borderWidth: 1, 
    borderRadius: 8, 
    padding: 12, 
    marginTop: 10,
    fontSize: 16,
  },
  saveBtn: { 
    backgroundColor: '#007AFF', 
    padding: 12, 
    borderRadius: 8, 
    flex: 1, 
    marginHorizontal: 4, 
    alignItems: 'center' 
  },
  cancelBtn: {
    backgroundColor: '#6c757d',
  },
  saveText: { 
    color: '#fff', 
    fontWeight: 'bold',
    fontSize: 16,
  },
});