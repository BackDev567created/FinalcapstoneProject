import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, Image 
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../supabaseClient';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';

const Profile = () => {
  const router = useRouter();
  const [settingsVisible, setSettingsVisible] = useState(false);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert(error.message);
    } else {
      router.push('/screen/LoginScreen');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Admin info</Text>

      <View style={styles.card}>
        <TouchableOpacity style={styles.settingsIcon} onPress={() => setSettingsVisible(true)}>
          <Ionicons name="settings-outline" size={24} color="#333" />
        </TouchableOpacity>

        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={50} color="#fff" />
          </View>
          <Text style={styles.serial}>Serial Number: #0001</Text>
        </View>

        <Text style={styles.username}>@Culing</Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>Juan Dela Cruz</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Address</Text>
          <Text style={styles.value}>Vinisitahan Bacacay Abay</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Mobile Number</Text>
          <Text style={styles.value}>099305****</Text>
        </View>
        <View style={styles.joinedRow}>
          <Text>Joined</Text>
          <Text>23/11/2024</Text>
        </View>
      </View>

      {/* Settings Modal */}
      <Modal isVisible={settingsVisible} onBackdropPress={() => setSettingsVisible(false)}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Settings</Text>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSettingsVisible(false)} style={styles.closeBtn}>
            <Text style={{ color: '#3498db' }}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E6E6FA', alignItems: 'center', paddingTop: 50 },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  card: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    position: 'relative',
  },
  settingsIcon: { position: 'absolute', top: 20, right: 20 },
  avatarContainer: { alignItems: 'center', marginBottom: 10 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#B0C4DE', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  serial: { fontSize: 12, color: '#555' },
  username: { backgroundColor: '#D3D3D3', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 10, marginBottom: 20 },
  infoRow: { width: '100%', marginBottom: 15 },
  label: { fontSize: 12, color: '#888' },
  value: { fontSize: 16, borderBottomWidth: 1, borderBottomColor: '#ccc', paddingVertical: 5 },
  joinedRow: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 20, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  logoutBtn: { backgroundColor: '#e74c3c', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 8, marginBottom: 10 },
  logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  closeBtn: { padding: 10 },
});
