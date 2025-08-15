import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../../supabaseClient';

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
      // Only upload image for new product
      let image_url: string | null = null;
      if (!editingId && image) image_url = await uploadImage(image);

      if (editingId) {
        // Edit mode: don't update image
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
    // Disable image change during edit
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
            <TouchableOpacity style={styles.editBtn} onPress={() => handleEdit(product)}>
              <Text>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(product.id)}>
              <Text>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* Form */}
      <TextInput style={styles.input} placeholder="Product Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Price" keyboardType="numeric" value={price} onChangeText={setPrice} />
      <TextInput style={styles.input} placeholder="Kilograms" keyboardType="numeric" value={kilograms} onChangeText={setKilograms} />
      <TextInput style={styles.input} placeholder="Stock" keyboardType="numeric" value={stock} onChangeText={setStock} />
      <TextInput style={styles.input} placeholder="Category (optional)" value={category} onChangeText={setCategory} />

      {/* Image picker only for new product */}
      {!editingId && (
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {image ? <Image source={{ uri: image }} style={styles.imagePreview} /> : <Text style={{ color: '#555' }}>Pick an image</Text>}
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.submitBtn} onPress={handleAddOrUpdateProduct} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>{editingId ? 'Update Product' : 'Add Product'}</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Product;

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12 },
  imagePicker: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 20, alignItems: 'center', marginBottom: 12 },
  imagePreview: { width: 100, height: 100, borderRadius: 8 },
  submitBtn: { backgroundColor: '#3498db', padding: 15, borderRadius: 8, alignItems: 'center' },
  submitText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  productCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 10, marginBottom: 12 },
  productImage: { width: 60, height: 60, borderRadius: 8 },
  productName: { fontWeight: 'bold', fontSize: 16 },
  buttonContainer: { flexDirection: 'row', gap: 8 },
  editBtn: { backgroundColor: '#f1c40f', padding: 5, borderRadius: 5 },
  deleteBtn: { backgroundColor: '#e74c3c', padding: 5, borderRadius: 5 },
});
