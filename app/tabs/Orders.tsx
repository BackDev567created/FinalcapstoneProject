import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// Sample data (added more to ensure scroll)
const cardData = [
  {
    name: 'John Doe',
    date: 'June 3 2024',
    time: '3:20 PM',
    location: 'Purok-4 Vinisitahan',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVq5BLhZUApoO5YJb1BCf8ihrbFOiD8M-_5AtbVUkbwN1JyQOroMkXdek_igOrbjf_gB0&usqp=CAU',
    color: '#00B0F0',
  },
  {
    name: 'Jane Smith',
    date: 'June 3 2024',
    time: '4:10 PM',
    location: 'Purok-5 Vinisitahan',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVq5BLhZUApoO5YJb1BCf8ihrbFOiD8M-_5AtbVUkbwN1JyQOroMkXdek_igOrbjf_gB0&usqp=CAU',
    color: '#8E44AD',
  },
  {
    name: 'Michael Johnson',
    date: 'June 3 2024',
    time: '2:45 PM',
    location: 'Purok-6 Vinisitahan',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVq5BLhZUApoO5YJb1BCf8ihrbFOiD8M-_5AtbVUkbwN1JyQOroMkXdek_igOrbjf_gB0&usqp=CAU',
    color: '#58D68D',
  },
  {
    name: 'Emily Brown',
    date: 'June 3 2024',
    time: '1:30 PM',
    location: 'Purok-7 Vinisitahan',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVq5BLhZUApoO5YJb1BCf8ihrbFOiD8M-_5AtbVUkbwN1JyQOroMkXdek_igOrbjf_gB0&usqp=CAU',
    color: '#00B0F0',
  },
  {
    name: 'Chris Evans',
    date: 'June 3 2024',
    time: '5:00 PM',
    location: 'Purok-1 Vinisitahan',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVq5BLhZUApoO5YJb1BCf8ihrbFOiD8M-_5AtbVUkbwN1JyQOroMkXdek_igOrbjf_gB0&usqp=CAU',
    color: '#8E44AD',
  },
  {
    name: 'Lana White',
    date: 'June 3 2024',
    time: '3:50 PM',
    location: 'Purok-2 Vinisitahan',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVq5BLhZUApoO5YJb1BCf8ihrbFOiD8M-_5AtbVUkbwN1JyQOroMkXdek_igOrbjf_gB0&usqp=CAU',
    color: '#48C9B0',
  },
  {
    name: 'George Hill',
    date: 'June 3 2024',
    time: '6:15 PM',
    location: 'Purok-3 Vinisitahan',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVq5BLhZUApoO5YJb1BCf8ihrbFOiD8M-_5AtbVUkbwN1JyQOroMkXdek_igOrbjf_gB0&usqp=CAU',
    color: '#00B0F0',
  },
];

const Orders = () => {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {cardData.map((item, index) => (
            <View key={index} style={[styles.card, { backgroundColor: item.color }]}>
              <Image source={{ uri: item.image }} style={styles.avatar} />

              <View style={styles.infoContainer}>
                <Text style={styles.date}>{item.date}</Text>
                <Text style={styles.location}>Location: {item.location}</Text>
                <Text style={styles.name}>{item.name}</Text>
              </View>

              <View style={styles.rightContainer}>
                <Text style={styles.time}>{item.time}</Text>
                <TouchableOpacity style={styles.button}>
                  <Text style={styles.buttonText}>View</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default Orders;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#e6e6fa', // light lavender
  },
  container: {
    padding: 12,
    paddingBottom: 24,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 16, // more padding
    marginBottom: 14,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  date: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  location: {
    color: '#fff',
    fontSize: 12,
    marginTop: 1,
  },
  name: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 6,
  },
  rightContainer: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 60,
  },
  time: {
    color: '#fff',
    fontSize: 13,
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  buttonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
