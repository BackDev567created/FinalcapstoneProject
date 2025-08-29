import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../supabaseClient';
import { useRouter } from 'expo-router';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { RequireAdmin } from '../Components/AuthGuard';

interface DashboardStats {
  totalEarnings: number;
  todayEarnings: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalStock: number;
  lowStockItems: number;
  totalCustomers: number;
  activeChats: number;
  monthlyData: Array<{ month: string; sales: number; orders: number }>;
  orderStatusData: Array<{ name: string; count: number; color: string }>;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalEarnings: 0,
    todayEarnings: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalStock: 0,
    lowStockItems: 0,
    totalCustomers: 0,
    activeChats: 0,
    monthlyData: [],
    orderStatusData: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchDashboardStats = async () => {
    try {
      // Fetch orders and calculate earnings
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('total_amount, status, created_at');

      if (ordersError) throw ordersError;

      // Calculate earnings
      const totalEarnings = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const today = new Date().toDateString();
      const todayEarnings = orders
        ?.filter(order => new Date(order.created_at).toDateString() === today)
        ?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      // Order statistics
      const totalOrders = orders?.length || 0;
      const pendingOrders = orders?.filter(order => order.status === 'pending').length || 0;
      const completedOrders = orders?.filter(order => order.status === 'delivered').length || 0;

      // Fetch products and stock data
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('stock_quantity');

      if (productsError) throw productsError;

      const totalStock = products?.reduce((sum, product) => sum + (product.stock_quantity || 0), 0) || 0;
      const lowStockItems = products?.filter(product => (product.stock_quantity || 0) <= 10).length || 0;

      // Fetch customers count
      const { count: totalCustomers, error: customersError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      if (customersError) throw customersError;

      // Fetch active chats
      const { data: messages, error: messagesError } = await supabase
        .from('chat_messages')
        .select('sender_id')
        .order('created_at', { ascending: false })
        .limit(100);

      if (messagesError) throw messagesError;

      const uniqueSenders = new Set(messages?.map(msg => msg.sender_id) || []);
      const activeChats = uniqueSenders.size;

      // Generate monthly data (last 6 months)
      const monthlyData = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthName = date.toLocaleString('default', { month: 'short' });

        const monthOrders = orders?.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate.getMonth() === date.getMonth() &&
                 orderDate.getFullYear() === date.getFullYear();
        }) || [];

        monthlyData.push({
          month: monthName,
          sales: monthOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0),
          orders: monthOrders.length
        });
      }

      // Order status distribution
      const orderStatusData = [
        { name: 'Pending', count: orders?.filter(o => o.status === 'pending').length || 0, color: '#FFC107' },
        { name: 'Confirmed', count: orders?.filter(o => o.status === 'confirmed').length || 0, color: '#2196F3' },
        { name: 'Preparing', count: orders?.filter(o => o.status === 'preparing').length || 0, color: '#FF9800' },
        { name: 'Out for Delivery', count: orders?.filter(o => o.status === 'out_for_delivery').length || 0, color: '#9C27B0' },
        { name: 'Delivered', count: orders?.filter(o => o.status === 'delivered').length || 0, color: '#4CAF50' },
        { name: 'Cancelled', count: orders?.filter(o => o.status === 'cancelled').length || 0, color: '#F44336' }
      ].filter(item => item.count > 0);

      setStats({
        totalEarnings,
        todayEarnings,
        totalOrders,
        pendingOrders,
        completedOrders,
        totalStock,
        lowStockItems,
        totalCustomers: totalCustomers || 0,
        activeChats,
        monthlyData,
        orderStatusData
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardStats();
  };

  useEffect(() => {
    fetchDashboardStats();

    // Set up real-time subscriptions
    const ordersChannel = supabase
      .channel('orders-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchDashboardStats)
      .subscribe();

    const productsChannel = supabase
      .channel('products-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, fetchDashboardStats)
      .subscribe();

    const chatChannel = supabase
      .channel('chat-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages' }, fetchDashboardStats)
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(productsChannel);
      supabase.removeChannel(chatChannel);
    };
  }, []);

  if (loading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4189C8" />
            <Text style={styles.loadingText}>Loading dashboard...</Text>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(65, 137, 200, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  const screenWidth = Dimensions.get('window').width;

  return (
    <RequireAdmin>
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#4189C8']}
                tintColor="#4189C8"
                progressBackgroundColor="#ffffff"
              />
            }
          >
            <Text style={styles.header}>Admin Dashboard</Text>

            {/* Key Metrics Cards */}
            <View style={styles.metricsGrid}>
              <View style={[styles.metricCard, { backgroundColor: '#4CAF50' }]}>
                <Text style={styles.metricIcon}>💰</Text>
                <View>
                  <Text style={styles.metricLabel}>Today's Earnings</Text>
                  <Text style={styles.metricValue}>₱{stats.todayEarnings.toLocaleString()}</Text>
                </View>
              </View>

              <View style={[styles.metricCard, { backgroundColor: '#2196F3' }]}>
                <Text style={styles.metricIcon}>📦</Text>
                <View>
                  <Text style={styles.metricLabel}>Total Orders</Text>
                  <Text style={styles.metricValue}>{stats.totalOrders}</Text>
                </View>
              </View>

              <View style={[styles.metricCard, { backgroundColor: '#FF9800' }]}>
                <Text style={styles.metricIcon}>⏳</Text>
                <View>
                  <Text style={styles.metricLabel}>Pending Orders</Text>
                  <Text style={styles.metricValue}>{stats.pendingOrders}</Text>
                </View>
              </View>

              <View style={[styles.metricCard, { backgroundColor: '#9C27B0' }]}>
                <Text style={styles.metricIcon}>✅</Text>
                <View>
                  <Text style={styles.metricLabel}>Completed Orders</Text>
                  <Text style={styles.metricValue}>{stats.completedOrders}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.metricCard, { backgroundColor: '#607D8B' }]}
                onPress={() => router.push('/tabs/ChatsList')}
              >
                <Text style={styles.metricIcon}>💬</Text>
                <View>
                  <Text style={styles.metricLabel}>Active Chats</Text>
                  <Text style={styles.metricValue}>{stats.activeChats}</Text>
                </View>
              </TouchableOpacity>

              <View style={[styles.metricCard, { backgroundColor: '#795548' }]}>
                <Text style={styles.metricIcon}>👥</Text>
                <View>
                  <Text style={styles.metricLabel}>Total Customers</Text>
                  <Text style={styles.metricValue}>{stats.totalCustomers}</Text>
                </View>
              </View>

              <View style={[styles.metricCard, { backgroundColor: '#00BCD4' }]}>
                <Text style={styles.metricIcon}>🛢️</Text>
                <View>
                  <Text style={styles.metricLabel}>Total Stock</Text>
                  <Text style={styles.metricValue}>{stats.totalStock}</Text>
                </View>
              </View>

              <View style={[styles.metricCard, { backgroundColor: '#F44336' }]}>
                <Text style={styles.metricIcon}>⚠️</Text>
                <View>
                  <Text style={styles.metricLabel}>Low Stock Items</Text>
                  <Text style={styles.metricValue}>{stats.lowStockItems}</Text>
                </View>
              </View>
            </View>

            {/* Monthly Sales Chart */}
            {stats.monthlyData.length > 0 && (
              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Monthly Sales Trend</Text>
                <LineChart
                  data={{
                    labels: stats.monthlyData.map(item => item.month),
                    datasets: [{
                      data: stats.monthlyData.map(item => item.sales)
                    }]
                  }}
                  width={screenWidth - 40}
                  height={220}
                  chartConfig={{
                    ...chartConfig,
                    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                  }}
                  bezier
                  style={styles.chart}
                />
              </View>
            )}

            {/* Order Status Distribution */}
            {stats.orderStatusData.length > 0 && (
              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Order Status Distribution</Text>
                <PieChart
                  data={stats.orderStatusData}
                  width={screenWidth - 40}
                  height={220}
                  chartConfig={chartConfig}
                  accessor="count"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  style={styles.chart}
                />
              </View>
            )}

            {/* Monthly Orders Chart */}
            {stats.monthlyData.length > 0 && (
              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Monthly Orders</Text>
                <BarChart
                  data={{
                    labels: stats.monthlyData.map(item => item.month),
                    datasets: [{
                      data: stats.monthlyData.map(item => item.orders)
                    }]
                  }}
                  width={screenWidth - 40}
                  height={220}
                  yAxisLabel=""
                  yAxisSuffix=""
                  chartConfig={{
                    ...chartConfig,
                    color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                  }}
                  style={styles.chart}
                />
              </View>
            )}

            {/* Summary Stats */}
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Earnings:</Text>
                <Text style={styles.summaryValue}>₱{stats.totalEarnings.toLocaleString()}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Average Order Value:</Text>
                <Text style={styles.summaryValue}>
                  ₱{stats.totalOrders > 0 ? (stats.totalEarnings / stats.totalOrders).toFixed(2) : '0.00'}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Completion Rate:</Text>
                <Text style={styles.summaryValue}>
                  {stats.totalOrders > 0 ? ((stats.completedOrders / stats.totalOrders) * 100).toFixed(1) : '0'}%
                </Text>
              </View>
            </View>

            <Text style={styles.updatedText}>
              Last updated: {new Date().toLocaleString()}
              {refreshing && ' (Refreshing...)'}
            </Text>
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    </RequireAdmin>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: { padding: 20, paddingBottom: 40 },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#666', marginTop: 10 },

  // Metrics grid and cards
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: '48%',
    minHeight: 80,
  },
  metricIcon: { fontSize: 24, color: '#fff', marginRight: 12 },
  metricLabel: { fontSize: 12, color: '#fff', marginBottom: 2, flex: 1 },
  metricValue: { fontSize: 18, fontWeight: 'bold', color: '#fff' },

  // Charts
  chartContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  chart: {
    borderRadius: 8,
  },

  // Summary section
  summaryContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#333',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4189C8',
  },

  // Legacy styles (keeping for compatibility)
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