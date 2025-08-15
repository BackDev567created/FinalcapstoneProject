import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const Dashboard = () => {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.header}>Dashboard</Text>

          {/* Cards */}
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

          <View style={[styles.card, { backgroundColor: '#48C9B0' }]}>
            <Text style={styles.cardIcon}>🛢️</Text>
            <View>
              <Text style={styles.cardLabel}>Tank Stocks</Text>
              <Text style={styles.cardValue}>40</Text>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: '#58D68D' }]}>
            <Text style={styles.cardIcon}>💸</Text>
            <View>
              <Text style={styles.cardLabel}>Update Price (11kg)</Text>
              <Text style={styles.cardValue}>₱900</Text>
            </View>
          </View>
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
});
