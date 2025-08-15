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
import { supabase } from '../../supabaseClient';

const ShoppingCart = () => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [editQty, setEditQty] = useState('');
  const [editType, setEditType] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Fetch cart items for the logged-in user
  const fetchCartItems = async () => {
    setLoading(true);
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('No user logged in:', userError?.message);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('addtocart')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching cart:', error.message);
    } else {
      setCartItems(data || []);
    }
    setLoading(false);
  };

  const getTotal = () => {
    return cartItems
      .filter(item => selectedIds.includes(item.id))
      .reduce((total, item) => total + Number(item.totalprice || 0), 0);
  };

  const removeItem = async (id: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('addtocart')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting:', error.message);
      return;
    }
    setCartItems(prev => prev.filter(item => item.id !== id));
    setSelectedIds(prev => prev.filter(i => i !== id));
  };

  const openEditModal = (item: any) => {
    setSelectedItem(item);
    setEditQty(item.quantity.toString());
    setEditType(item.renewaltype);
    setEditModalVisible(true);
  };

  const saveEdit = async () => {
    const newQty = parseInt(editQty);
    if (isNaN(newQty) || newQty <= 0) {
      Alert.alert('Invalid quantity');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const updatedTotalPrice =
      (selectedItem.totalprice / selectedItem.quantity) * newQty;

    const { error } = await supabase
      .from('addtocart')
      .update({
        quantity: newQty,
        renewaltype: editType,
        totalprice: updatedTotalPrice,
      })
      .eq('id', selectedItem.id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Update error:', error.message);
      Alert.alert('Update failed');
    } else {
      fetchCartItems();
      setEditModalVisible(false);
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />

      <View style={styles.details}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          <Checkbox
            value={selectedIds.includes(item.id)}
            onValueChange={() => toggleSelect(item.id)}
            color={selectedIds.includes(item.id) ? '#007aff' : undefined}
          />
          <Text style={[styles.name, { marginLeft: 8 }]}>{item.productname}</Text>
        </View>
        <Text style={styles.price}>₱{item.totalprice}</Text>
        <Text style={styles.qty}>Qty: {item.quantity}</Text>
        <Text style={styles.renewal}>Type: {item.renewaltype}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => openEditModal(item)}>
          <FontAwesome name="edit" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => removeItem(item.id)}>
          <MaterialIcons name="delete" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <TouchableOpacity
          style={{ alignItems: 'baseline', margin: 16, top: 5, right: 10 }}
          onPress={() => router.push('/Components/MainDrawer')}
        >
          <Entypo name="arrow-long-left" size={40} color="#fff" />
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator size="large" color="#fff" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={cartItems}
            keyExtractor={item => item.id.toString()}
            renderItem={renderItem}
            ListEmptyComponent={<Text style={styles.emptyText}>Your cart is empty.</Text>}
          />
        )}

        <View style={styles.bottomBar}>
          <Text style={styles.totalText}>Total: ₱{getTotal()}</Text>
          <TouchableOpacity
            style={[
              styles.checkoutBtn,
              selectedIds.length === 0 && { backgroundColor: '#999' },
            ]}
            onPress={() => {
              if (selectedIds.length === 0) return;
              router.push({
                pathname: '/user/PaymentScreen',
                params: { selectedIds: JSON.stringify(selectedIds) },
              });
            }}
            disabled={selectedIds.length === 0}
          >
            <Text style={styles.checkoutText}>Purchase</Text>
          </TouchableOpacity>
        </View>

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
                onChangeText={setEditType}
                style={styles.input}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                <TouchableOpacity style={styles.saveBtn} onPress={saveEdit}>
                  <Text style={styles.saveText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: '#999' }]}
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
  container: { backgroundColor: '#2b2b2b', flex: 1, paddingHorizontal: 12 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 10,
    marginVertical: 8,
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#555',
    marginRight: 12,
    resizeMode: 'contain',
  },
  details: { flex: 1 },
  name: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  price: { fontSize: 16, color: '#fff', marginVertical: 2 },
  qty: { fontSize: 16, color: '#fff' },
  renewal: { fontSize: 14, color: '#ccc' },
  actions: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -30 }],
    flexDirection: 'column',
    gap: 10,
  },
  editBtn: { backgroundColor: '#007aff', padding: 8, borderRadius: 8 },
  deleteBtn: { backgroundColor: '#d9534f', padding: 8, borderRadius: 8 },
  emptyText: { color: '#aaa', textAlign: 'center', marginTop: 30, fontSize: 16, fontStyle: 'italic' },
  bottomBar: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalText: { fontSize: 18, fontWeight: 'bold' },
  checkoutBtn: { backgroundColor: '#007aff', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  checkoutText: { color: '#fff', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', padding: 24, borderRadius: 12, width: '85%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  input: { borderColor: '#aaa', borderWidth: 1, borderRadius: 8, padding: 10, marginTop: 10 },
  saveBtn: { backgroundColor: '#007aff', padding: 10, borderRadius: 8, flex: 1, marginHorizontal: 4, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: 'bold' },
});
