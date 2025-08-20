import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import React, { useState } from 'react';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { useRouter } from 'expo-router';
import { useSignup } from '../../context/SignupContext';
import { supabase } from '../../supabaseClient';

const validationSchema = Yup.object().shape({
  phoneNumber: Yup.string()
    .required('Your Phone Number is required')
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits'),
  email: Yup.string()
    .required('Your Email is required')
    .email('Invalid email format'),
});

const SigninScreen = () => {
  const router = useRouter();
  const { setSignupData } = useSignup();
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailError, setEmailError] = useState('');

  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      // Check in profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .maybeSingle();

      if (profileError) {
        console.error('Error checking email in profiles:', profileError.message);
        throw profileError;
      }

      // If email exists in profiles, return true
      if (profileData) {
        return true;
      }

      // Check if email exists using RPC function (client-side approach)
      const { data: authData, error: authError } = await supabase
        .rpc('check_user_exists', { user_email: email.toLowerCase() });

      if (authError) {
        console.error('Error checking auth users:', authError.message);
        // If RPC fails, we'll assume the email doesn't exist to not block registration
        return false;
      }

      return authData || false;
    } catch (error) {
      console.error('Error checking email existence:', error);
      // If there's an error, we'll assume the email doesn't exist to not block registration
      return false;
    }
  };

  const handleNext = async (values: { phoneNumber: string; email: string }) => {
    setIsCheckingEmail(true);
    setEmailError('');
    
    try {
      const emailExists = await checkEmailExists(values.email);
      
      if (emailExists) {
        setEmailError('This email is already registered. Please use a different email or login.');
        return;
      }
      
      // If email doesn't exist, proceed
      setSignupData(values);
      router.push('./SigninScreen1');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to check email availability. Please try again.');
      console.error('Error checking email:', error);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require('./../image 2.png')} style={styles.logo} />
      <Image source={require('./../Bar1.png')} style={styles.progress} />

      <Formik
        initialValues={{ phoneNumber: '', email: '' }}
        onSubmit={handleNext}
        validationSchema={validationSchema}
        validateOnChange={false}
        validateOnBlur={false}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldTouched }) => (
          <View style={styles.backgroundform}>
            <Text style={styles.subtitle}>Personal Information</Text>
            <View style={styles.form}>
              <Text style={styles.title}>Mobile Number</Text>
              <TextInput
                style={[styles.input, isCheckingEmail && styles.inputDisabled]}
                placeholder="+63 Mobile Number"
                onChangeText={handleChange('phoneNumber')}
                onBlur={() => {
                  handleBlur('phoneNumber');
                  setFieldTouched('phoneNumber', true);
                }}
                value={values.phoneNumber}
                keyboardType="phone-pad"
                editable={!isCheckingEmail}
              />
              {touched.phoneNumber && errors.phoneNumber && (
                <Text style={styles.errorText}>{errors.phoneNumber}</Text>
              )}

              <Text style={styles.title}>Email</Text>
              <TextInput
                style={[styles.input, isCheckingEmail && styles.inputDisabled]}
                placeholder="Email"
                onChangeText={handleChange('email')}
                onBlur={() => {
                  handleBlur('email');
                  setFieldTouched('email', true);
                }}
                value={values.email}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isCheckingEmail}
              />
              {(touched.email && errors.email) && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
              
              {emailError ? (
                <Text style={styles.errorText}>{emailError}</Text>
              ) : null}

              <TouchableOpacity 
                style={[styles.buttonBase, isCheckingEmail && styles.buttonDisabled]} 
                onPress={() => handleSubmit()}
                disabled={isCheckingEmail}
              >
                <View style={styles.loginButton}>
                  {isCheckingEmail ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Next</Text>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Formik>
    </ScrollView>
  );
};

export default SigninScreen;

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
  title: { 
    fontSize: 15, 
    fontWeight: 'bold', 
    marginBottom: 2, 
    left: 2, 
    paddingHorizontal: 18 
  },
  form: { 
    width: '90%', 
    bottom: 8 
  },
  input: { 
    height: 50, 
    width: '90%', 
    borderColor: 'black', 
    borderWidth: 1, 
    borderRadius: 8, 
    paddingHorizontal: 16, 
    marginBottom: 10, 
    alignSelf: 'center' 
  },
  inputDisabled: {
    backgroundColor: '#f0f0f0',
    opacity: 0.7,
  },
  errorText: { 
    color: 'red', 
    fontSize: 12, 
    marginTop: -8, 
    marginBottom: 10, 
    marginLeft: 22, 
    fontWeight: '500' 
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
  buttonBase: { 
    alignSelf: 'center', 
    width: '90%' 
  },
  buttonDisabled: { 
    opacity: 0.7 
  },
  backgroundform: { 
    width: 320, 
    height: '50%', 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'white', 
    borderRadius: 20, 
    borderColor: 'gray', 
    borderWidth: 0.3, 
    bottom: 20,
    paddingVertical: 20
  },
  subtitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginBottom: 10
  },
  progress: { 
    width: 230, 
    height: 80, 
    alignSelf: 'center', 
    bottom: 55,
    marginBottom: 20
  },
});