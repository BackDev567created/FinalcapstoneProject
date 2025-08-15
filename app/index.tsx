import { StyleSheet, Text, View, ImageBackground, Image, TouchableOpacity } from 'react-native';
import React from 'react';  
import { useFonts } from "expo-font";
import AppLoading from 'expo-app-loading';
import { useRouter } from 'expo-router';


function Index(){
  let [fontsLoaded] = useFonts({
    'Poppins-Bold': require('./../assets/fonts/Poppins-Bold.ttf')
  });


  // Early return if fonts are not loaded
  if (!fontsLoaded) {
    return <AppLoading />;
  }


  const router = useRouter()

  return (
    <View style={styles.container}>
      <ImageBackground source={require("./solane.png")} resizeMode="contain" style={styles.background}>
      </ImageBackground>
      <Image source={require("./image 2.png")} style={styles.logo} />
      <Text style={styles.mainText}>Culing's LPG Outlet</Text>
      <View>
      <TouchableOpacity style={styles.touchableArea} onPress={() => router.push("./screen/LoginScreen")}>
        <Text style={styles.touchableText}>Click To Continue</Text>
      </TouchableOpacity>
    </View>
  </View>
  );
}


export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',

  },
  textStyle: {
    color: "#ffffff",
    backgroundColor: "#00000099",
    padding: 16
  },
  logo: {
    width: 40,
    height: 60,
    position: 'absolute',
    top: 180
  },
  background: {
    width: 180.25,
    height: 362.41,
    position: 'absolute',
    top: 205,
  },
  mainText: {
    fontWeight: 'bold',
    color: '#4189C8',
    fontSize: 33,
    fontFamily: 'Poppins-Bold',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 500,
  },
  touchableArea: {
    position: 'fixed',
    bottom: 50, // Position it towards the bottom of the screen
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  touchableText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  }
});
