import React, { useState } from 'react';
import { StyleSheet, View, Image, Alert } from 'react-native';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import {
  TextInput,
  Button,
  HelperText,
  Card,
} from 'react-native-paper';

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .required('Email or username is required')
    .test(
      'is-valid-email-or-username',
      'Invalid email format',
      function (value) {
        if (!value) return false;
        const looksLikeEmail = value.includes('@');
        if (!looksLikeEmail) return true; // treat as username
        return Yup.string().email().isValidSync(value); // validate email
      }
    ),
  password: Yup.string().required('Password is required').min(4),
});

const LoginScreen: React.FC = () => {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    try {
      const result = await login(email, password);

      if (result.success) {
        Alert.alert('Welcome!', 'Login successful!');

        // For now, check if it's admin login by checking the email
        if (email === 'admin') {
          router.push('/tabs/BottomTab');
        } else {
          router.push('/Components/MainDrawer');
        }
      } else {
        Alert.alert('Login failed', result.message || 'Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login error', 'Something went wrong during login.');
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('./../image 2.png')} style={styles.logo} />
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <Formik
            initialValues={{ email: '', password: '' }}
            onSubmit={async (values) =>
              handleLogin(values.email, values.password)
            }
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
              <View>
                {/* Email / Username */}
                <TextInput
                  label="Email or Username"
                  mode="outlined"
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  autoCapitalize="none"
                  style={styles.input}
                  theme={{
    colors: {
      primary: '#007AFF', // active border
      outline: '#007AFF', // default border
    },
  }}
                />
                {errors.email && touched.email && (
                  <HelperText type="error" visible={true}>
                    {errors.email}
                  </HelperText>
                )}

                {/* Password */}
                <TextInput
                  label="Password"
                  mode="outlined"
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  secureTextEntry={!showPassword}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? 'eye' : 'eye-off'}
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                  style={styles.input}
                  theme={{
    colors: {
      primary: '#007AFF', // active border
      outline: '#007AFF', // default border
    },
  }}
                />
                {errors.password && touched.password && (
                  <HelperText type="error" visible={true}>
                    {errors.password}
                  </HelperText>
                )}

                {/* Login Button */}
                <Button
                  mode="contained"
                  style={styles.loginButton}
                  onPress={() => handleSubmit()}
                >
                  Signin
                </Button>

                {/* Signup Button */}
                <Button
                  mode="outlined"
                  style={styles.signButton}
                  onPress={() => router.push('./SigninScreen')}
                >
                  Signup
                </Button>

                {/* Forgot Password */}
                <Button
                  mode="text"
                  onPress={() =>
                    Alert.alert('Forgot Password', 'Feature coming soon.')
                  }
                >
                  Forgot Password?
                </Button>
              </View>
            )}
          </Formik>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffffff',
    padding: 16,
  },
  logo: {
    width: 84,
    height: 132,
    marginBottom: 30,
  },
  card: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 20,
    backgroundColor: '#fff',

  },
  input: {
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  loginButton: {
    marginTop: 16,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#007AFF', // restored color
  },
  signButton: {
    marginTop: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
});

export default LoginScreen;
