// components/CustomDrawer.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { router } from 'expo-router';

const Logout = (props: any) => {
  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      <View style={styles.logoutContainer}>
        <TouchableOpacity onPress={() => router.push("/screen/LoginScreen")} style={styles.logoutButton}>
          <Text style={styles.logoutText}> Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  logoutContainer: {
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    padding: 16,
  },
  logoutButton: {
    paddingVertical: 12,
  },
  logoutText: {
    fontSize: 16,
    color: '#d00',
    fontWeight: 'bold',
  },
});

export default Logout;
