import {
  StyleSheet,
  View,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import React, { useState } from 'react';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { useRouter } from 'expo-router';
import { useSignup } from '../../context/SignupContext';
import { supabase } from '../../supabaseClient';
import {
  TextInput,
  Button,
  Text,
  Card,
  HelperText,
} from 'react-native-paper';

const validationSchema = Yup.object().shape({
  password: Yup.string()
    .required('Password is required')
    .min(6, 'At least 6 characters'),
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
      // 1. Sign up user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: signupData.email,
        password: values.password,
      });
      if (error) throw error;

      const userId = data.user?.id;
      if (!userId) throw new Error('User ID not found');

      // 2. Save user profile
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

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.subtitle}>
            Create Password
          </Text>

          <Formik
            initialValues={{ password: '', confirmPassword: '' }}
            onSubmit={handleSignup}
            validationSchema={validationSchema}
            validateOnBlur={false}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <View>
                {/* Password Field */}
                <TextInput
                  label="Password *"
                  mode="outlined"
                  secureTextEntry={!showPassword}
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? 'eye' : 'eye-off'}
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                  style={styles.input}
                  error={touched.password && !!errors.password}
                  theme={{
                    colors: {
                      primary: '#007AFF',
                      outline: '#007AFF',
                    },
                  }}
                />
                {touched.password && errors.password && (
                  <HelperText type="error" visible={true}>
                    {errors.password}
                  </HelperText>
                )}

                {/* Confirm Password Field */}
                <TextInput
                  label="Confirm Password *"
                  mode="outlined"
                  secureTextEntry={!showConfirm}
                  value={values.confirmPassword}
                  onChangeText={handleChange('confirmPassword')}
                  onBlur={handleBlur('confirmPassword')}
                  right={
                    <TextInput.Icon
                      icon={showConfirm ? 'eye' : 'eye-off'}
                      onPress={() => setShowConfirm(!showConfirm)}
                    />
                  }
                  style={styles.input}
                  error={touched.confirmPassword && !!errors.confirmPassword}
                  theme={{
                    colors: {
                      primary: '#007AFF',
                      outline: '#007AFF',
                    },
                  }}
                />
                {touched.confirmPassword && errors.confirmPassword && (
                  <HelperText type="error" visible={true}>
                    {errors.confirmPassword}
                  </HelperText>
                )}

                <Button
                  mode="contained"
                  style={styles.signupButton}
                  onPress={() => handleSubmit()}
                >
                  Sign Up
                </Button>
              </View>
            )}
          </Formik>
        </Card.Content>
      </Card>
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
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  logo: { 
    width: 64, 
    height: 100, 
    marginBottom: 20,
  },
  progress: { 
    width: 230, 
    height: 80, 
    marginBottom: 20,
  },
  card: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 8,
  },
  subtitle: { 
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  input: {
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  signupButton: {
    marginTop: 16,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#007AFF',
  },
});