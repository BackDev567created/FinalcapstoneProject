import { useSignup } from '../../context/SignupContext'; // Correct import
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
  TouchableOpacity,
} from 'react-native';
import React, { useContext } from 'react';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { useRouter } from 'expo-router';
import { SignupContext } from '../../context/SignupContext';

const validationSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required').min(4),
  lastName: Yup.string().required('Last name is required').min(4),
  address: Yup.string().required('Address is required').min(4),
});


const SigninScreen1 = () => {
  const router = useRouter();
  const { setSignupData } = useSignup(); // ✅ Use the correct method from context

  const handleNext = (values: { firstName: string; lastName: string; address: string }) => {
    setSignupData(values); // ✅ Save to context
    router.push('/screen/SigninScreen2');
  };


  return (
    <View style={styles.container}>
      <Image source={require('./../image 2.png')} style={styles.logo} />
      <Image source={require('./../Bar2.png')} style={styles.progress} />

      <Formik
        initialValues={{ firstName: '', lastName: '', address: '' }}
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
            <Text style={styles.subtitle}>Customer Information</Text>
            <View style={styles.form}>
              <Text style={styles.title}>First Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Type Here"
                onChangeText={handleChange('firstName')}
                onBlur={handleBlur('firstName')}
                value={values.firstName}
              />

              <Text style={styles.title}>Last Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Type Here"
                onChangeText={handleChange('lastName')}
                onBlur={handleBlur('lastName')}
                value={values.lastName}
              />

              <Text style={styles.title}>Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Type Here"
                onChangeText={handleChange('address')}
                onBlur={handleBlur('address')}
                value={values.address}
              />

              {(touched.firstName && errors.firstName) ||
              (touched.lastName && errors.lastName) ||
              (touched.address && errors.address) ? (
                <Text style={styles.errorText}>Please fill out the form</Text>
              ) : null}

              <TouchableOpacity
                style={styles.buttonBase}
                onPress={() => handleSubmit()}
              >
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

export default SigninScreen1;

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
    marginBottom: 600,
    position: 'absolute',
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 2,
    left: 20,
  },
  form: {
    width: '90%',
    bottom: 8,
  },
  input: {
    height: 40,
    width: '90%',
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 9,
    marginBottom: 15,
    alignSelf: 'center',
    flexWrap: 'nowrap',
  },
  errorWrapper: {
    marginTop: 5,
    marginBottom: 10,
    paddingLeft: 20,
    alignSelf: 'flex-start',
  },
  errorText: {
    color: 'red',
    fontSize: 13,
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
    shadowColor: 'black',
  },
  buttonBase: {
    alignSelf: 'center',
    width: '90%',
    position: 'absolute',
    top: 220,
  },
  backgroundform: {
    width: 320.48,
    height: '65%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    borderColor: 'gray',
    borderWidth: 0.3,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingBottom: 12,
    position: 'absolute',
    top: 20,
    left: 20,
  },
  progress: {
    width: 230,
    height: 80,
    alignSelf: 'center',
    bottom: 20,
  },
});
