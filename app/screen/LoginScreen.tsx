import { StyleSheet, Text, TextInput, View, Image, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { useRouter } from 'expo-router';
import { supabase } from '../../supabaseClient';
import { Ionicons } from '@expo/vector-icons';

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .required('Email or username is required')
    .test(
      'is-valid-email-or-username',
      'Invalid email format',
      function (value) {
        if (!value) return false;
        const looksLikeEmail = value.includes('@');
        if (!looksLikeEmail) return true; // Treat as username
        return Yup.string().email().isValidSync(value); // Validate email format
      }
    ),
  password: Yup.string().required('Password is required').min(4),
});

const LoginScreen: React.FC = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    try {
      const { data: admins, error: adminError } = await supabase
        .from('admins')
        .select('*');

      if (adminError) {
        console.error('Error fetching admins:', adminError.message);
      } else if (admins && admins.length > 0) {
        const matchedAdmin = admins.find(
          (admin: any) => admin.username === email && admin.password === password
        );

        if (matchedAdmin) {
          Alert.alert('Welcome Admin');
          router.push('/tabs/BottomTab');
          return;
        }
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !authData.user) {
        Alert.alert('Login failed', 'Invalid email or password');
        return;
      }

      router.push('/Components/MainDrawer');
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login error', 'Something went wrong during login.');
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('./../image 2.png')} style={styles.logo} />
      <Formik
        initialValues={{ email: '', password: '' }}
        onSubmit={async (values) => handleLogin(values.email, values.password)}
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
          <View style={styles.form}>
            <Text style={styles.title}>Email or Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter email"
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              value={values.email}
              autoCapitalize="none"
            />
            {errors.email && touched.email && <Text style={styles.errorText}>{errors.email}</Text>}

            <Text style={styles.title}>Password</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                value={values.password}
                secureTextEntry={!showPassword}
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
            {errors.password && touched.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}

            <TouchableOpacity style={styles.buttonBase} onPress={() => handleSubmit()}>
              <View style={styles.loginButton}>
                <Text style={styles.buttonText}>Login</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.buttonBase} onPress={() => router.push('./SigninScreen')}>
              <View style={styles.signButton}>
                <Text style={styles.signupText}>Signup</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => Alert.alert('Forgot Password', 'Feature coming soon.')}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
        )}
      </Formik>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    paddingTop: 120,
  },
  logo: {
    width: 84,
    height: 132,
    marginBottom: 480,
    position: 'absolute',
  },
  form: {
    width: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'left',
    paddingHorizontal: 20,
  },
  input: {
    height: 50,
    width: '90%',
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    alignSelf: 'center',
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingRight: 12,
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 16,
  },
  eyeIcon: {
    paddingHorizontal: 4,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
    marginLeft: 22,
    fontWeight: '500',
  },
  buttonBase: {
    alignSelf: 'center',
    width: '90%',
  },
  loginButton: {
    height: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 16,
  },
  signButton: {
    height: 50,
    backgroundColor: '#e9e9e9',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: '#eee6da',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupText: {
    color: 'gray',
    fontSize: 18,
    fontWeight: 'bold',
  },
  forgotPasswordText: {
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default LoginScreen;
