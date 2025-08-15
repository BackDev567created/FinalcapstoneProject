import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { useRouter } from 'expo-router';
import { useSignup } from '../../context/SignupContext';

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
  const { setSignupData } = useSignup(); // ✅ Correct context method

  const handleNext = (values: { phoneNumber: string; email: string }) => {
    setSignupData(values); // ✅ Save data
    router.push('./SigninScreen1'); // ✅ Go to next screen
  };

  return (
    <View style={styles.container}>
      <Image source={require('./../image 2.png')} style={styles.logo} />
      <Image source={require('./../Bar1.png')} style={styles.progress} />

      <Formik
        initialValues={{ phoneNumber: '', email: '' }}
        onSubmit={handleNext}
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
            <Text style={styles.subtitle}>Personal Information</Text>
            <View style={styles.form}>
              <Text style={styles.title}>Mobile Number</Text>
              <TextInput
                style={styles.input}
                placeholder="+63 Mobile Number"
                onChangeText={handleChange('phoneNumber')}
                onBlur={handleBlur('phoneNumber')}
                value={values.phoneNumber}
                keyboardType="phone-pad"
              />
              {touched.phoneNumber && errors.phoneNumber && (
                <Text style={styles.errorText}>{errors.phoneNumber}</Text>
              )}

              <Text style={styles.title}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Email"
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                value={values.email}
                keyboardType="email-address"
              />
              {touched.email && errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}

       <TouchableOpacity style={styles.buttonBase} onPress={() => handleSubmit()}>
  <View style={styles.loginButton}>
    <Text style={styles.buttonText}>Next</Text>
  </View>
</TouchableOpacity>

            </View>
          </View>
        )}
      </Formik>
    </View>
  );
};

export default SigninScreen;

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
    width: 64,
    height: 100,
    marginBottom: 550,
    position: 'absolute',
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 2,
    left: 2,
    paddingHorizontal: 18,
  },
  form: {
    width: '90%',
    bottom: 8,
  },
  input: {
    height: 50,
    width: '90%',
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 7,
    marginBottom: 10,
    alignSelf: 'center',
  },
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
    top: 40,
  },
  buttonText: {
    color: '#eee6da',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonBase: {
    alignSelf: 'center',
    width: '90%',
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
    bottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    right: 45,
    bottom: 54,
  },
  progress: {
    width: 230,
    height: 80,
    alignSelf: 'center',
    bottom: 55,
  },
});
