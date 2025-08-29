import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  Alert
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '../../supabaseClient';
import { useCart } from '../Components/CartContent';
import { PRODUCT_OPTIONS } from '../../shared/constants';

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
}

const HomeScreen = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOption, setSelectedOption] = useState<'all' | 'swap' | 'new'>('all');
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  const router = useRouter();
  const { addToCart } = useCart();

  const fetchProducts = async () => {
    try {
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
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

  const updateQuantity = (productId: string, quantity: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(0, quantity)
    }));
  };

  const addToCartHandler = (product: Product) => {
    const quantity = quantities[product.id] || 1;

    if (quantity <= 0) {
      Alert.alert('Error', 'Please select a quantity greater than 0');
      return;
    }

    if (quantity > product.stock_quantity) {
      Alert.alert('Error', 'Not enough stock available');
      return;
    }

    addToCart({
      name: product.name,
      weight: product.weight,
      price: product.price,
      quantity,
      option: product.option
    });

    // Reset quantity
    setQuantities(prev => ({
      ...prev,
      [product.id]: 0
    }));

    Alert.alert('Success', `${product.name} added to cart!`);
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const quantity = quantities[item.id] || 0;
    const isOutOfStock = item.stock_quantity <= 0;

    return (
      <View style={styles.productCard}>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productWeight}>{item.weight}</Text>
          <Text style={styles.productDescription}>
            {item.description || 'No description available'}
          </Text>
          <Text style={styles.productPrice}>₱{item.price.toLocaleString()}</Text>

          <View style={styles.stockInfo}>
            <Text style={[
              styles.stockText,
              isOutOfStock && styles.outOfStockText
            ]}>
              {isOutOfStock ? 'Out of Stock' : `Stock: ${item.stock_quantity}`}
            </Text>
            <View style={[
              styles.optionBadge,
              { backgroundColor: item.option === 'new' ? '#4CAF50' : '#FF9800' }
            ]}>
              <Text style={styles.optionText}>{item.option.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {!isOutOfStock && (
          <View style={styles.cartControls}>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateQuantity(item.id, quantity - 1)}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>

              <Text style={styles.quantityText}>{quantity}</Text>

              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateQuantity(item.id, quantity + 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.addToCartButton, quantity === 0 && styles.addToCartButtonDisabled]}
              onPress={() => addToCartHandler(item)}
              disabled={quantity === 0}
            >
              <Text style={[
                styles.addToCartButtonText,
                quantity === 0 && styles.addToCartButtonTextDisabled
              ]}>
                Add to Cart
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {isOutOfStock && (
          <View style={styles.outOfStockContainer}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
      </View>
    );
  };

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
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Available Products</Text>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => router.push('/user/ShoppingCart')}
          >
            <Text style={styles.cartButtonText}>🛒 Cart</Text>
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
      </SafeAreaView>
    </SafeAreaProvider>
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
  cartButton: {
    backgroundColor: '#4189C8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8
  },
  cartButtonText: { color: '#fff', fontWeight: 'bold' },

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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  productInfo: { marginBottom: 16 },
  productName: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  productWeight: { fontSize: 14, color: '#666', marginBottom: 4 },
  productDescription: { fontSize: 14, color: '#666', marginBottom: 8, lineHeight: 20 },
  productPrice: { fontSize: 20, fontWeight: 'bold', color: '#4189C8', marginBottom: 8 },

  stockInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  stockText: { fontSize: 14, color: '#4CAF50', fontWeight: '500' },
  outOfStockText: { color: '#F44336' },
  optionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  optionText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  cartControls: { borderTopWidth: 1, borderTopColor: '#e0e0e0', paddingTop: 16 },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center'
  },
  quantityButtonText: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center'
  },

  addToCartButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  addToCartButtonDisabled: { backgroundColor: '#ccc' },
  addToCartButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  addToCartButtonTextDisabled: { color: '#999' },

  outOfStockContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 16,
    alignItems: 'center'
  },

  emptyContainer: { alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 16, color: '#666' }
});

export default HomeScreen;
