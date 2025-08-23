import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../../supabaseClient';
import { MaterialIcons } from '@expo/vector-icons';
import {
  TextInput,
  Button,
  Text,
  Card,
  ActivityIndicator,
} from 'react-native-paper';

const Product = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [kilograms, setKilograms] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: false });
    if (error) Alert.alert('Error', error.message);
    else setProducts(data);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets[0]?.uri)
      setImage(result.assets[0].uri);
  };

  const uploadImage = async (uri: string) => {
    const fileExt = uri.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const fileBase64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const uInt8Array = Uint8Array.from(atob(fileBase64), c => c.charCodeAt(0));

    const { error } = await supabase.storage
      .from('product-images')
      .upload(fileName, uInt8Array, { contentType: `image/${fileExt}` });
    if (error) throw error;

    const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleAddOrUpdateProduct = async () => {
    if (!name || !price || !kilograms || !stock)
      return Alert.alert('Error', 'Please fill all required fields.');

    const priceNum = parseFloat(price);
    const kilosNum = parseFloat(kilograms);
    const stockNum = parseInt(stock);

    if (isNaN(priceNum) || isNaN(kilosNum) || isNaN(stockNum))
      return Alert.alert('Error', 'Please enter valid numbers');

    setLoading(true);
    try {
      let image_url: string | null = null;
      if (!editingId && image) image_url = await uploadImage(image);

      if (editingId) {
        const { error } = await supabase
          .from('products')
          .update({
            name,
            price: priceNum,
            kilograms: kilosNum,
            stock: stockNum,
            category: category || null,
          })
          .eq('id', editingId);
        if (error) throw error;
        setEditingId(null);
      } else {
        const { error } = await supabase
          .from('products')
          .insert([
            {
              name,
              price: priceNum,
              kilograms: kilosNum,
              stock: stockNum,
              category: category || null,
              image_url,
            },
          ]);
        if (error) throw error;
      }

      Alert.alert('Success', editingId ? 'Product updated!' : 'Product added!');
      setName(''); setPrice(''); setKilograms(''); setStock(''); setCategory(''); setImage(null);
      fetchProducts();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: any) => {
    setName(product.name);
    setPrice(product.price.toString());
    setKilograms(product.kilograms.toString());
    setStock(product.stock.toString());
    setCategory(product.category || '');
    setImage(null);
    setEditingId(product.id);
  };

  const handleDelete = async (id: number) => {
    Alert.alert('Confirm Delete', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          const { error } = await supabase.from('products').delete().eq('id', id);
          if (error) Alert.alert('Error', error.message);
          else fetchProducts();
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>{editingId ? 'Edit Product' : 'Add New Product'}</Text>

      {/* Display Products */}
      {products.map(product => (
        <View key={product.id} style={styles.productCard}>
          {product.image_url && <Image source={{ uri: product.image_url }} style={styles.productImage} />}
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text>
              ₱{product.price} | {product.kilograms}kg | Stock: {product.stock}
            </Text>
            {product.category && <Text>Category: {product.category}</Text>}
          </View>
          <View style={styles.buttonContainer}>
            <Button 
              mode="contained" 
              style={[styles.iconBtn, styles.editBtn]} 
              onPress={() => handleEdit(product)}
              compact
            >
              <MaterialIcons name="edit" size={20} color="#fff" />
            </Button>
            <Button 
              mode="contained" 
              style={[styles.iconBtn, styles.deleteBtn]} 
              onPress={() => handleDelete(product.id)}
              compact
            >
              <MaterialIcons name="delete" size={20} color="#fff" />
            </Button>
          </View>
        </View>
      ))}

      {/* Form with React Native Paper TextInput */}
      <Card style={styles.formCard}>
        <Card.Content>
          <TextInput
            label="Product Name *"
            mode="outlined"
            value={name}
            onChangeText={setName}
            style={styles.input}
            theme={{ colors: { primary: '#007AFF', outline: '#007AFF' } }}
          />
          
          <TextInput
            label="Price *"
            mode="outlined"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            style={styles.input}
            theme={{ colors: { primary: '#007AFF', outline: '#007AFF' } }}
          />
          
          <TextInput
            label="Kilograms *"
            mode="outlined"
            value={kilograms}
            onChangeText={setKilograms}
            keyboardType="numeric"
            style={styles.input}
            theme={{ colors: { primary: '#007AFF', outline: '#007AFF' } }}
          />
          
          <TextInput
            label="Stock *"
            mode="outlined"
            value={stock}
            onChangeText={setStock}
            keyboardType="numeric"
            style={styles.input}
            theme={{ colors: { primary: '#007AFF', outline: '#007AFF' } }}
          />
          
          <TextInput
            label="Category (optional)"
            mode="outlined"
            value={category}
            onChangeText={setCategory}
            style={styles.input}
            theme={{ colors: { primary: '#007AFF', outline: '#007AFF' } }}
          />

          {!editingId && (
            <Button 
              mode="outlined" 
              onPress={pickImage} 
              style={styles.imagePicker}
              icon={image ? "image" : "image-plus"}
            >
              {image ? 'Change Image' : 'Pick an Image'}
            </Button>
          )}

          {image && (
            <Image source={{ uri: image }} style={styles.imagePreview} />
          )}

          <Button
            mode="contained"
            onPress={handleAddOrUpdateProduct}
            disabled={loading}
            style={styles.submitBtn}
            loading={loading}
          >
            {editingId ? 'Update Product' : 'Add Product'}
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

export default Product;

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  formCard: {
    marginBottom: 20,
    borderRadius: 12,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  imagePicker: {
    marginBottom: 12,
    borderColor: '#007AFF',
  },
  imagePreview: { 
    width: 100, 
    height: 100, 
    borderRadius: 8, 
    alignSelf: 'center',
    marginBottom: 12,
  },
  submitBtn: {
    marginTop: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#007AFF',
  },
  productCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 10, 
    padding: 10, 
    marginBottom: 12 
  },
  productImage: { width: 60, height: 60, borderRadius: 8 },
  productName: { fontWeight: 'bold', fontSize: 16 },
  buttonContainer: { justifyContent: 'space-between', alignItems: 'center' },
  iconBtn: { 
    width: 45, 
    height: 45, 
    borderRadius: 8, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginVertical: 4,
    marginHorizontal: 4,
  },
  editBtn: { backgroundColor: '#f1c40f' },
  deleteBtn: { backgroundColor: '#e74c3c' },
});