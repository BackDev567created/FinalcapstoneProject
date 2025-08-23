import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  BackHandler,
  Alert,
  Image,
  ScrollView,
  RefreshControl,
  Animated,
  Easing,
   Dimensions
} from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { Appbar, Button, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useCart } from '../Components/CartContent';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../supabaseClient';

const HomeScreen = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const { addToCart } = useCart();
  const insets = useSafeAreaInsets();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [animatingItems, setAnimatingItems] = useState<number[]>([]);
  const animatedValues = useRef(new Map()).current;
 const animateAddToCart = (itemId: number, item: any) => {
  // Create animated value if it doesn't exist
  if (!animatedValues.has(itemId)) {
    animatedValues.set(itemId, new Animated.Value(0));
  }

  const animValue = animatedValues.get(itemId);
  
  // Add to animating items
  setAnimatingItems(prev => [...prev, itemId]);

  // Start animation
  Animated.timing(animValue, {
    toValue: 1,
    duration: 800,
    easing: Easing.out(Easing.exp),
    useNativeDriver: true,
  }).start(() => {
    // Animation complete - remove from animating items and add to actual cart
    setAnimatingItems(prev => prev.filter(id => id !== itemId));
    handleAddToCart(item);
  });
};


  

  useEffect(() => {
    const backAction = () => {
      Alert.alert('Hold on!', 'Are you sure you want to exit the app?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'YES', onPress: () => BackHandler.exitApp() },
      ]);
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    fetchProducts();

    const subscription = supabase
      .channel('public:products')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => fetchProducts()
      )
      .subscribe();

    return () => {
      backHandler.remove();
      supabase.removeChannel(subscription);
    };
  }, []);

const fetchProducts = async (isRefreshing = false) => {
  if (isRefreshing) {
    setRefreshing(true);
  } else {
    setLoading(true);
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: false });

    if (error) throw error;

    const productsWithState = data.map(item => ({
      ...item,
      qty: 0,
      opt: 'swap' as 'swap' | 'new',
      image_url: item.image_url || null,
    }));

    setProducts(productsWithState);
  } catch (err: any) {
    console.error('Failed to fetch products:', err.message);
    Alert.alert('Error', 'Failed to fetch products');
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

const onRefresh = () => {
  fetchProducts(true); // Pass true to indicate it's a refresh
};

const handleAddToCart = async (item: any) => {
  if (item.qty <= 0) {
    Alert.alert('Quantity required', 'Please select at least 1 item.');
    return;
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    Alert.alert('Error', 'You must be logged in to add items to the cart.');
    return;
  }

  // ✅ TAMANG COMPUTATION: ₱900 PER ITEM FOR SWAP
  let totalPrice = 0;
  
  if (item.opt === 'swap') {
    // For swap: ₱900 PER ITEM
    totalPrice = 900 * item.qty;
  } else {
    // For new: regular price
    totalPrice = item.price * item.qty;
  }

  const weightValue = parseFloat(item.kilograms?.toString() || '0');

  const payload = {
    user_id: user.id,
    quantity: item.qty,
    totalprice: totalPrice,
    renewaltype: item.opt,
    kilograms: weightValue,
    productname: item.name,
    image_url: item.image_url || null,
  };

  try {
    const { error } = await supabase.from('addtocart').insert([payload]);
    if (error) throw error;

    addToCart({
      ...item,
      quantity: item.qty,
      option: item.opt,
      price: totalPrice,
      image_url: item.image_url || null,
    });

    Alert.alert('✅ Success', `${item.qty}x ${item.name} (${item.opt}) added to cart`);
  } catch (err: any) {
    console.error('Add to cart error:', err.message);
    Alert.alert('Error', 'Failed to add to cart');
  }
};

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Loading products...</Text>
      </View>
    );
  }


  // Add this component inside your HomeScreen component, before the return statement
const FlyingItem = ({ itemId, product }: { itemId: number, product: any }) => {
  const animValue = animatedValues.get(itemId);
  
  if (!animValue) return null;

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  
  const startX = screenWidth / 2 - 100; // Approximate center of product card
  const startY = screenHeight / 2;
  const endX = screenWidth - 40; // Cart icon position (right side)
  const endY = 60; // Cart icon position (top)

  const translateX = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, endX - startX]
  });

  const translateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, endY - startY]
  });

  const scale = animValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.2, 0.5]
  });

  const opacity = animValue.interpolate({
    inputRange: [0, 0.8, 1],
    outputRange: [1, 1, 0]
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: startX,
        top: startY,
        transform: [{ translateX }, { translateY }, { scale }],
        opacity,
        zIndex: 1000,
      }}
    >
      <View style={styles.flyingItem}>
        {product.image_url ? (
          <Image
            source={{ uri: product.image_url }}
            style={styles.flyingImage}
            resizeMode="contain"
          />
        ) : (
          <Text style={styles.flyingText}>+1</Text>
        )}
      </View>
    </Animated.View>
  );
};

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <Appbar.Header style={{ backgroundColor: '#fff' }}>
          <Appbar.Action icon="menu" onPress={() => navigation.dispatch(DrawerActions.openDrawer())} />
          <Appbar.Action
            icon="cart"
            size={30}
            onPress={() => router.push('/user/ShoppingCart')}
            style={{ marginLeft: 'auto' }}
          />
        </Appbar.Header>

           {animatingItems.map(itemId => {
        const product = products.find(p => p.id === itemId);
        return product ? (
          <FlyingItem key={itemId} itemId={itemId} product={product} />
        ) : null;
      })}

        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 1 }}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
           refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={['#007aff']} // iOS
      tintColor="#007aff" // iOS
      progressBackgroundColor="#ffffff"
    />
  }>

            
          {products.map((item, index) => (
            <Card key={index} style={styles.card}>
              <Card.Content style={styles.content}>
           {item.image_url ? (
          <Image
            source={{ uri: item.image_url }}
            style={styles.image}
            resizeMode="contain"/>
                ) : (
                  <View
                    style={[
                      styles.image,
                      { backgroundColor: '#ddd', justifyContent: 'center', alignItems: 'center' }
                    ]}
                  >
                    <Text>No Image</Text>
                  </View>
                )}


                  <View style={styles.infoContainer}>
                    <View style={styles.textSection}>
                      <Text style={styles.title}>{item.name}</Text>
                      <Text style={styles.subTitle}>{item.kilograms} kgs</Text>
                      <Text style={styles.price}>
                      ₱ {item.opt === 'swap' ? 900 : item.price} {item.opt === 'swap' && 'per item (swap)'}</Text>
                  </View>

                  <View style={styles.controlsSection}>
                    <View style={styles.optionRow}>
                      <TouchableOpacity
                        onPress={() =>
                          setProducts(prev => {
                            const newProducts = [...prev];
                            newProducts[index].qty = Math.max(0, newProducts[index].qty - 1);
                            return newProducts;
                          })
                        }
                        style={styles.qtyBtn}
                      >
                        <Text style={styles.qtyText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.qtyNumber}>{item.qty}</Text>
                      <TouchableOpacity
                        onPress={() =>
                          setProducts(prev => {
                            const newProducts = [...prev];
                            newProducts[index].qty += 1;
                            return newProducts;
                          })
                        }
                        style={styles.qtyBtn}
                      >
                        <Text style={styles.qtyText}>+</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.cartRow}>
                      <View style={styles.quantityControl}>
                        <TouchableOpacity
                          style={[styles.optionButton, item.opt === 'swap' && styles.optionButtonActive]}
                          onPress={() =>
                            setProducts(prev => {
                              const newProducts = [...prev];
                              newProducts[index].opt = 'swap';
                              return newProducts;
                            })
                          }
                        >
                          <Text style={styles.optionText}>Swap</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.optionButton, item.opt === 'new' && styles.optionButtonActive]}
                          onPress={() =>
                            setProducts(prev => {
                              const newProducts = [...prev];
                              newProducts[index].opt = 'new';
                              return newProducts;
                            })
                          }
                        >
                          <Text style={styles.optionText}>New</Text>
                        </TouchableOpacity>
                      </View>
                      <Button
                        mode="contained"
                        style={styles.addToCartBtn}
                        onPress={() => animateAddToCart(item.id, item)} 
                      >
                        Add to cart
                      </Button>
                    </View>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>

    
  );
};

export default HomeScreen;

// Styles remain unchanged
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  content: { alignItems: 'center', justifyContent: 'center' },
  card: {
    margin: 10,
    marginTop: 10,
    borderRadius: 12,
    borderColor: '#a2a3a4ff',
    borderWidth: 0.2,
    overflow: 'hidden',
    backgroundColor: '#e1e6ecff',
    width: '90%',
    alignSelf: 'center',
  },
  image: { width: 200, height: 250, marginBottom: 10 },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#BBCCDC',
    padding: 16,
    width: 354,
    top: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    height: 100,
  },
  textSection: { flex: 1, gap: 4, left: 10 },
  controlsSection: { flex: 1.5, alignItems: 'flex-end', gap: 10 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#2a2a2a' },
  subTitle: { fontSize: 14, color: '#555' },
  price: { fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
    top: 35,
    right: 14,
    borderRadius: 6,
    borderWidth: 1.7,
    borderColor: 'black',
  },
  optionButton: {
    flex: 1,
    paddingVertical: 2,
    paddingHorizontal: 9,
    borderRadius: 6,
    alignItems: 'center',
    backgroundColor: '#ecececff',
    right: 10,
    borderColor: '#313030ff',
    borderWidth: 1.7,
  },
  optionButtonActive: { backgroundColor: '#599feaff' },
  optionText: { color: '#000000ff', fontWeight: '500', top: 1 },
  cartRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  quantityControl: {
    flexDirection: 'column',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 4,
    height: 75,
    bottom: 27,
    right: 12,
    borderColor: 'black',
    borderRadius: 1,
  },
  qtyBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#ddd',
    borderColor: 'black',
    borderRadius: 4,
  },
  qtyText: { fontSize: 16, fontWeight: 'bold', borderRadius: 2 },
  qtyNumber: { width: 32, textAlign: 'center', fontSize: 16 },
  addToCartBtn: {
    backgroundColor: '#007aff',
    borderRadius: 10,
    height: 40,
    bottom: 7,
    right: 11,
  },
   flyingItem: {
    backgroundColor: '#007aff',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 5,
  },
  flyingImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  flyingText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
