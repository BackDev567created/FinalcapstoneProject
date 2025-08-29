import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  FlatList
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../supabaseClient';
import { RequireAdmin } from '../Components/AuthGuard';
import { API_ENDPOINTS, PRODUCT_OPTIONS } from '../../shared/constants';

interface Product {
  id: string;
  name: string;
  description?: string;
  weight: string;
  price: number;
  image_url?: string;
  option: 'swap' | 'new';
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ProductFormData {
  name: string;
  description: string;
  weight: string;
  price: string;
  option: 'swap' | 'new';
  stock_quantity: string;
  image_url?: string;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOption, setSelectedOption] = useState<'all' | 'swap' | 'new'>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    weight: '',
    price: '',
    option: 'new',
    stock_quantity: '0'
  });
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  const fetchProducts = async () => {
    try {
      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedOption !== 'all') {
        query = query.eq('option', selectedOption);
      }

      if (searchQuery.trim()) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, selectedOption]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      weight: '',
      price: '',
      option: 'new',
      stock_quantity: '0'
    });
    setEditingProduct(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description || '',
      weight: product.weight,
      price: product.price.toString(),
      option: product.option,
      stock_quantity: product.stock_quantity.toString(),
      image_url: product.image_url
    });
    setEditingProduct(product);
    setModalVisible(true);
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setFormData(prev => ({
          ...prev,
          image_url: result.assets[0].uri
        }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadImage = async (uri: string): Promise<string | null> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const fileName = `product-${Date.now()}.jpg`;
      const { data, error } = await supabase.storage
        .from('products')
        .upload(fileName, blob);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim() || !formData.weight.trim() || !formData.price.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    if (isNaN(parseInt(formData.stock_quantity)) || parseInt(formData.stock_quantity) < 0) {
      Alert.alert('Error', 'Please enter a valid stock quantity');
      return;
    }

    setSubmitting(true);

    try {
      let imageUrl = formData.image_url;

      // Upload image if it's a local file
      if (imageUrl && imageUrl.startsWith('file://')) {
        const uploadedUrl = await uploadImage(imageUrl);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        weight: formData.weight.trim(),
        price: parseFloat(formData.price),
        option: formData.option,
        stock_quantity: parseInt(formData.stock_quantity),
        image_url: imageUrl
      };

      if (editingProduct) {
        // Update existing product
        const { data, error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)
          .select()
          .single();

        if (error) throw error;

        setProducts(prev => prev.map(p => p.id === editingProduct.id ? data : p));
        Alert.alert('Success', 'Product updated successfully');
      } else {
        // Create new product
        const { data, error } = await supabase
          .from('products')
          .insert(productData)
          .select()
          .single();

        if (error) throw error;

        setProducts(prev => [data, ...prev]);
        Alert.alert('Success', 'Product created successfully');
      }

      setModalVisible(false);
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      Alert.alert('Error', 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (product: Product) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('products')
                .update({ is_active: false })
                .eq('id', product.id);

              if (error) throw error;

              setProducts(prev => prev.filter(p => p.id !== product.id));
              Alert.alert('Success', 'Product deleted successfully');
            } catch (error) {
              console.error('Error deleting product:', error);
              Alert.alert('Error', 'Failed to delete product');
            }
          }
        }
      ]
    );
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productWeight}>{item.weight}</Text>
        <Text style={styles.productPrice}>₱{item.price.toLocaleString()}</Text>
        <Text style={styles.productStock}>Stock: {item.stock_quantity}</Text>
        <View style={[styles.optionBadge, { backgroundColor: item.option === 'new' ? '#4CAF50' : '#FF9800' }]}>
          <Text style={styles.optionText}>{item.option.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.productActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => openEditModal(item)}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4189C8" />
            <Text style={styles.loadingText}>Loading products...</Text>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <RequireAdmin>
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Product Management</Text>
            <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
              <Text style={styles.addButtonText}>+ Add Product</Text>
            </TouchableOpacity>
          </View>

          {/* Search and Filters */}
          <View style={styles.filtersContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            <View style={styles.filterButtons}>
              {(['all', 'new', 'swap'] as const).map(option => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.filterButton,
                    selectedOption === option && styles.filterButtonActive
                  ]}
                  onPress={() => setSelectedOption(option)}
                >
                  <Text style={[
                    styles.filterButtonText,
                    selectedOption === option && styles.filterButtonTextActive
                  ]}>
                    {option === 'all' ? 'All' : option.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Products List */}
          <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.productsList}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#4189C8']}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No products found</Text>
              </View>
            }
          />

          {/* Add/Edit Product Modal */}
          <Modal
            visible={modalVisible}
            animationType="slide"
            onRequestClose={() => setModalVisible(false)}
          >
            <SafeAreaView style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalContent}>
                <TextInput
                  style={styles.input}
                  placeholder="Product Name *"
                  value={formData.name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                />

                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Description"
                  value={formData.description}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                  multiline
                  numberOfLines={3}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Weight (e.g., 11kg) *"
                  value={formData.weight}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, weight: text }))}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Price *"
                  value={formData.price}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
                  keyboardType="numeric"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Stock Quantity"
                  value={formData.stock_quantity}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, stock_quantity: text }))}
                  keyboardType="numeric"
                />

                {/* Option Selection */}
                <Text style={styles.label}>Product Type:</Text>
                <View style={styles.optionButtons}>
                  {Object.values(PRODUCT_OPTIONS).map(option => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.optionButton,
                        formData.option === option && styles.optionButtonActive
                      ]}
                      onPress={() => setFormData(prev => ({ ...prev, option: option as 'swap' | 'new' }))}
                    >
                      <Text style={[
                        styles.optionButtonText,
                        formData.option === option && styles.optionButtonTextActive
                      ]}>
                        {option.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Image Upload */}
                <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                  <Text style={styles.imageButtonText}>
                    {formData.image_url ? 'Change Image' : 'Select Image'}
                  </Text>
                </TouchableOpacity>

                {formData.image_url && (
                  <Text style={styles.imageSelected}>
                    ✓ Image selected
                  </Text>
                )}

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.submitButton]}
                    onPress={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.submitButtonText}>
                        {editingProduct ? 'Update' : 'Create'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </SafeAreaView>
          </Modal>
        </SafeAreaView>
      </SafeAreaProvider>
    </RequireAdmin>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#666' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  addButton: {
    backgroundColor: '#4189C8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8
  },
  addButtonText: { color: '#fff', fontWeight: 'bold' },

  filtersContainer: { padding: 20, backgroundColor: '#fff' },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16
  },
  filterButtons: { flexDirection: 'row', gap: 8 },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4189C8'
  },
  filterButtonActive: { backgroundColor: '#4189C8' },
  filterButtonText: { color: '#4189C8', fontWeight: '500' },
  filterButtonTextActive: { color: '#fff' },

  productsList: { padding: 20 },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  productInfo: { flex: 1 },
  productName: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  productWeight: { fontSize: 14, color: '#666', marginBottom: 2 },
  productPrice: { fontSize: 16, fontWeight: 'bold', color: '#4189C8', marginBottom: 2 },
  productStock: { fontSize: 14, color: '#666', marginBottom: 8 },
  optionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start'
  },
  optionText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  productActions: { flexDirection: 'row', gap: 8 },
  actionButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
  editButton: { backgroundColor: '#FF9800' },
  editButtonText: { color: '#fff', fontWeight: 'bold' },
  deleteButton: { backgroundColor: '#F44336' },
  deleteButtonText: { color: '#fff', fontWeight: 'bold' },

  emptyContainer: { alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 16, color: '#666' },

  // Modal styles
  modalContainer: { flex: 1, backgroundColor: '#f5f5f5' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  closeButton: { fontSize: 24, color: '#666' },
  modalContent: { padding: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fff'
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  label: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8 },

  optionButtons: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  optionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4189C8',
    alignItems: 'center'
  },
  optionButtonActive: { backgroundColor: '#4189C8' },
  optionButtonText: { color: '#4189C8', fontWeight: 'bold' },
  optionButtonTextActive: { color: '#fff' },

  imageButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8
  },
  imageButtonText: { color: '#fff', fontWeight: 'bold' },
  imageSelected: { color: '#4CAF50', textAlign: 'center', marginBottom: 16 },

  modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  modalButton: { flex: 1, padding: 16, borderRadius: 8, alignItems: 'center' },
  cancelButton: { backgroundColor: '#666' },
  cancelButtonText: { color: '#fff', fontWeight: 'bold' },
  submitButton: { backgroundColor: '#4189C8' },
  submitButtonText: { color: '#fff', fontWeight: 'bold' }
});

export default Products;