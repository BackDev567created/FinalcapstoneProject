import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import React, { useState } from 'react';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { useRouter } from 'expo-router';
import { useSignup } from '../../context/SignupContext';
import { supabase } from '../../supabaseClient';
import { Ionicons } from '@expo/vector-icons';

const validationSchema = Yup.object().shape({
  password: Yup.string().required('Password is required').min(6, 'At least 6 characters'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm your password'),
});

const SigninScreen2 = () => {
  const router = useRouter();
  const { signupData } = useSignup();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSignup = async (values: { password: string; confirmPassword: string }) => {
    try {
      // 1. Sign up in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: signupData.email,
        password: values.password,
      });
      if (error) throw error;

      const userId = data.user?.id;
      if (!userId) throw new Error('User ID not found');

      // 2. Save all data in profiles table
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: userId,
          email: signupData.email,
          phone_number: signupData.phoneNumber,
          first_name: signupData.firstName,
          last_name: signupData.lastName,
          address: signupData.address,
          latitude: signupData.latitude,
          longitude: signupData.longitude,
        },
      ]);
      if (profileError) throw profileError;

      Alert.alert('Success', 'Please check your email to confirm before login.');
      router.replace('/screen/LoginScreen');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require('./../image 2.png')} style={styles.logo} />
      <Image source={require('./../Bar3.png')} style={styles.progress} />

      <Formik
        initialValues={{ password: '', confirmPassword: '' }}
        onSubmit={handleSignup}
        validationSchema={validationSchema}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View style={styles.backgroundform}>
            <Text style={styles.subtitle}>Create Password</Text>
            <View style={styles.form}>
              {/* Password Field */}
              <Text style={styles.title}>Password</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Password"
                  secureTextEntry={!showPassword}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  value={values.password}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye' : 'eye-off'}
                    size={24}
                    color="gray"
                  />
                </TouchableOpacity>
              </View>
              {touched.password && errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}

              {/* Confirm Password Field */}
              <Text style={styles.title}>Confirm Password</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirm Password"
                  secureTextEntry={!showConfirm}
                  onChangeText={handleChange('confirmPassword')}
                  onBlur={handleBlur('confirmPassword')}
                  value={values.confirmPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirm(!showConfirm)}
                >
                  <Ionicons
                    name={showConfirm ? 'eye' : 'eye-off'}
                    size={24}
                    color="gray"
                  />
                </TouchableOpacity>
              </View>
              {touched.confirmPassword && errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}

              <TouchableOpacity style={styles.buttonBase} onPress={() => handleSubmit()}>
                <View style={styles.loginButton}>
                  <Text style={styles.buttonText}>Sign Up</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Formik>
    </ScrollView>
  );
};

export default SigninScreen2;

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    paddingTop: 120 
  },
  logo: { 
    width: 64, 
    height: 100, 
    marginBottom: 550, 
    position: 'absolute' 
  },
  progress: { 
    width: 230, 
    height: 80, 
    alignSelf: 'center', 
    bottom: 55 
  },
  backgroundform: { 
    width: 320.48, 
    height: '50%', 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'white', 
    borderRadius: 20, 
    borderColor: 'gray', 
    borderWidth: 0.3, 
    bottom: 20 
  },
  subtitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    right: 45, 
    bottom: 54 
  },
  form: { 
    width: '90%', 
    bottom: 8 
  },
  title: { 
    fontSize: 15, 
    fontWeight: 'bold', 
    marginBottom: 2, 
    left: 2, 
    paddingHorizontal: 18 
  },
  passwordWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    width: '90%', 
    alignSelf: 'center',
    borderColor: 'black', 
    borderWidth: 1, 
    borderRadius: 8, 
    marginBottom: 10, 
    paddingRight: 10 
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 16,
  },
  eyeIcon: { 
    paddingHorizontal: 8 
  },
  errorText: { 
    color: 'red', 
    fontSize: 12, 
    marginTop: -10, 
    marginBottom: 1, 
    marginLeft: 22, 
    fontWeight: '500' 
  },
  buttonBase: { 
    alignSelf: 'center', 
    width: '90%' 
  },
  loginButton: { 
    height: 50, 
    backgroundColor: '#007AFF', 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderRadius: 8, 
    top: 40 
  },
  buttonText: { 
    color: '#eee6da', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
});