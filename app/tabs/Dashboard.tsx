import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  ActivityIndicator, 
  RefreshControl, 
  TouchableOpacity 
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../supabaseClient';
import { useRouter } from 'expo-router';

const Dashboard = () => {
  const [tankStock, setTankStock] = useState<number | null>(null);
  const [chatCount, setChatCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const calculateTotalStock = (data: any[]) => {
    return data?.reduce((sum: number, item: any) => sum + (item.stock || 0), 0) || 0;
  };

  const fetchStocks = async () => {
    try {
      const { data, error } = await supabase.from('products').select('stock');
      if (error) throw error;
      setTankStock(calculateTotalStock(data || []));
    } catch (err) {
      console.error('Error fetching stocks:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchChats = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('user_id', { count: 'exact' });
      if (error) throw error;

      // Count unique users
      const uniqueUsers = new Set(data.map((msg: any) => msg.user_id));
      setChatCount(uniqueUsers.size);
    } catch (err) {
      console.error('Error fetching chats:', err);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    Promise.all([fetchStocks(), fetchChats()]);
  };

  useEffect(() => {
    fetchStocks();
    fetchChats();

    const stockChannel = supabase
      .channel('products-stock')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => fetchStocks()
      )
      .subscribe();

    const chatChannel = supabase
      .channel('messages-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        () => fetchChats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(stockChannel);
      supabase.removeChannel(chatChannel);
    };
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#007AFF']}
              tintColor="#007AFF"
              progressBackgroundColor="#ffffff"
            />
          }
        >
          <Text style={styles.header}>Dashboard</Text>

          {/* Hardcoded Cards */}
          <View style={[styles.card, { backgroundColor: '#00B0F0' }]}>
            <Text style={styles.cardIcon}>💰</Text>
            <View>
              <Text style={styles.cardLabel}>Total Earnings Today</Text>
              <Text style={styles.cardValue}>₱5,000</Text>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: '#8E44AD' }]}>
            <Text style={styles.cardIcon}>📦</Text>
            <View>
              <Text style={styles.cardLabel}>Total Complete Orders</Text>
              <Text style={styles.cardValue}>10</Text>
            </View>
          </View>

          {/* Total Chats */}
          <TouchableOpacity 
            style={[styles.card, { backgroundColor: '#6d4e7bff' }]}
            onPress={() => router.push('/tabs/ChatsList')} // Fixed the route path
          >
            <Text style={styles.cardIcon}>💬</Text>
            <View>
              <Text style={styles.cardLabel}>Total Chats</Text>
              <Text style={styles.cardValue}>{chatCount}</Text>
            </View>
          </TouchableOpacity>

          {/* Dynamic Tank Stocks */}
          <View style={[styles.card, { backgroundColor: '#48C9B0' }]}>
            <Text style={styles.cardIcon}>🛢️</Text>
            <View>
              <Text style={styles.cardLabel}>Tank Stocks</Text>
              {loading ? (
                <ActivityIndicator size="large" color="#fff" />
              ) : (
                <Text style={styles.cardValue}>{tankStock}</Text>
              )}
            </View>
          </View>

          {/* Last Updated Time */}
          <Text style={styles.updatedText}>
            Last updated: {new Date().toLocaleTimeString()}
            {refreshing && ' (Refreshing...)'}
          </Text>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: { padding: 20, paddingBottom: 40 },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 40,
    marginBottom: 16,
    gap: 12,
  },
  cardIcon: { fontSize: 60, color: '#fff', width: 50, textAlign: 'center' },
  cardLabel: { fontSize: 20, color: '#fff', marginBottom: 4 },
  cardValue: { fontSize: 40, fontWeight: 'bold', color: '#fff' },
  updatedText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
})