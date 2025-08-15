import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Entypo } from '@expo/vector-icons';

type RadioButtonProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

const RadioButton = ({ label, selected, onPress }: RadioButtonProps) => (
  <TouchableOpacity style={styles.radioItem} onPress={onPress}>
    <View style={[styles.radioCircle, selected && styles.radioCircleSelected]}>
      {selected && <View style={styles.radioDot} />}
    </View>
    <Text style={styles.radioLabel}>{label}</Text>
  </TouchableOpacity>
);

const PaymentScreen = () => {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState('cash');

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push('/user/ShoppingCart')}
      >
        <Entypo name="arrow-long-left" size={36} color="#333" />
      </TouchableOpacity>

      <Image source={require('./../solane.png')} style={styles.logo} />

      <View style={styles.card}>
        <Text style={styles.title}>Payment Option</Text>
        <Text style={styles.subtitle}>Choose your preferred method:</Text>

        <RadioButton
          label="GCash"
          selected={selectedOption === 'Gcash'}
          onPress={() => setSelectedOption('Gcash')}
        />
        <RadioButton
          label="Cash on Delivery"
          selected={selectedOption === 'cash'}
          onPress={() => setSelectedOption('cash')}
        />

        <TouchableOpacity style={styles.proceedBtn}>
          <Text style={styles.proceedText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 48,
    left: 24,
  },
  logo: {
    width: 120,
    height: 180,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    color: '#1c1c1e',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioCircleSelected: {
    borderColor: '#007aff',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007aff',
  },
  radioLabel: {
    fontSize: 16,
    color: '#1f2937',
  },
  proceedBtn: {
    marginTop: 32,
    backgroundColor: '#007aff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  proceedText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
