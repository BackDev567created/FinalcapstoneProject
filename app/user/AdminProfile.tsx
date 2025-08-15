// HomeScreen.tsx
import React, { useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather'; // or Ionicons, MaterialIcons, etc.
import Shop from 'react-native-vector-icons/Entypo';

const AdminProfile = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
          <SafeAreaView style={{ flex: 1 }}>
            <TouchableOpacity
              style={{ alignItems: 'baseline', margin: 16, top: 30 }}
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            >
              <Icon name="menu" size={24} color="#000" />
            </TouchableOpacity>
    
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={styles.text}>AdminScreen</Text>
            </View>
          </SafeAreaView>
        </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  text: {
    color: '#000', // fixed from #FFF (white on white)
    fontSize: 20,
    fontWeight: '500',
  },
});
export default AdminProfile;
