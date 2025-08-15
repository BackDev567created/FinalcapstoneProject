import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import React, { useState } from 'react';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { useRouter } from 'expo-router';
import { useSignup } from '../../context/SignupContext';
import { supabase } from '../../supabaseClient';
import { Ionicons } from '@expo/vector-icons';

// Validation Schema
const validationSchema = Yup.object().shape({
  password: Yup.string()
    .required('Please fill out the form')
    .min(4, 'Password must be at least 4 characters'),
  confirmPassword: Yup.string()
    .required('Password must match')
    .oneOf([Yup.ref('password')], 'Passwords must match'),
});

const SigninScreen2 = () => {
  const router = useRouter();
  const { signupData, resetSignupData } = useSignup();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignup = async (values: { password: string; confirmPassword: string }) => {
    const { email, phoneNumber, firstName, lastName, address } = signupData;
    const { password } = values;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { phoneNumber, firstName, lastName, address },
      },
    });

    if (error) {
      Alert.alert('Signup Error', error.message);
      console.log('Signup failed:', error.message);
      return;
    }

    const userId = data?.user?.id;
    if (userId) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          first_name: firstName,
          last_name: lastName,
          address: address,
        });

      if (profileError) {
        console.error('❌ Failed to insert profile:', profileError.message);
        Alert.alert('Profile Save Error', profileError.message);
        return;
      } else {
        console.log('✅ Profile info saved!');
      }
    }

    Alert.alert('Signup Success', 'Please verify your email before logging in.');
    resetSignupData();
    router.push('/screen/LoginScreen');
  };

  return (
    <View style={styles.container}>
      <Image source={require('./../image 2.png')} style={styles.logo} />
      <Image source={require('./../image3.png')} style={styles.progress} />

      <Formik
        initialValues={{ password: '', confirmPassword: '' }}
        onSubmit={handleSignup}
        validationSchema={validationSchema}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
        }) => (
          <View style={styles.backgroundform}>
            <Text style={styles.subtitle}>Password</Text>
            <View style={styles.form}>
              {/* Password Field */}
              <Text style={styles.title}>Password</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Type Here"
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
                    size={20}
                    color="gray"
                  />
                </TouchableOpacity>
              </View>
              {touched.password && errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}

              {/* Confirm Password Field */}
              <Text style={styles.title}>Confirm Password</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Type Here"
                  secureTextEntry={!showConfirmPassword}
                  onChangeText={handleChange('confirmPassword')}
                  onBlur={handleBlur('confirmPassword')}
                  value={values.confirmPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye' : 'eye-off'}
                    size={20}
                    color="gray"
                  />
                </TouchableOpacity>
              </View>
              {touched.confirmPassword && errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}

              {/* Submit Button */}
              <TouchableOpacity style={styles.buttonBase} onPress={() => handleSubmit()}>
                <View style={styles.loginButton}>
                  <Text style={styles.buttonText}>Sign Up</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Formik>
    </View>
  );
};

export default SigninScreen2;

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    paddingTop: 120,
  },
  logo: { width: 64, height: 100, marginBottom: 550, position: 'absolute' },
  progress: { width: 230, height: 80, alignSelf: 'center', bottom: 55 },
  backgroundform: {
    width: 320.48,
    height: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    borderColor: 'gray',
    borderWidth: 0.3,
    bottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingBottom: 12,
    position: 'absolute',
    top: 20,
    left: 20,
  },
  form: { width: '90%', bottom: 8, paddingTop: 10, marginTop: 10 },
  title: { fontSize: 15, fontWeight: 'bold', marginBottom: 2, left: 20 },
  inputContainer: {
    width: '90%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  eyeIcon: { position: 'absolute', right: 10 },
  input: { flex: 1, height: 40, paddingHorizontal: 10 },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: -10,
    marginBottom: 1,
    marginLeft: 22,
    fontWeight: '500',
  },
  loginButton: {
    height: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    bottom: 30,
  },
  buttonBase: { alignSelf: 'center', width: '90%', position: 'absolute', top: 220 },
  buttonText: { color: '#eee6da', fontSize: 18, fontWeight: 'bold', shadowColor: 'black' },
});
