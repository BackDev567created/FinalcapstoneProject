// app/user/Profile.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, ActivityIndicator } from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { supabase } from '../../supabaseClient';

const Profile = () => {
  const navigation = useNavigation();
  const [profile, setProfile] = useState<any>(null);
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Get user from Supabase Auth
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) return;

        setEmail(user.email || 'No email');

        // Fetch profile from your 'profiles' table
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.log('Error fetching profile:', profileError.message);
        } else {
          setProfile(data);
        }
      } catch (error) {
        console.log('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <TouchableOpacity
          style={{ alignItems: 'baseline', margin: 16, top: 30 }}
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        >
          <Icon name="menu" size={24} color="#000" />
        </TouchableOpacity>

        <View style={styles.profileContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" />
          ) : profile ? (
            <>
              <Text style={styles.text}>First Name: {profile.first_name}</Text>
              <Text style={styles.text}>Last Name: {profile.last_name}</Text>
              <Text style={styles.text}>Address: {profile.address}</Text>
              <Text style={styles.text}>Phone: {profile.phone_number || 'Not provided'}</Text>
              <Text style={styles.text}>Email: {email}</Text>
            </>
          ) : (
            <Text style={styles.text}>No profile found.</Text>
          )}
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
  profileContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#000',
    fontSize: 18,
    fontWeight: '500',
    marginVertical: 4,
  },
});

export default Profile;
