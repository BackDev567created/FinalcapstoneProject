import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useSignup } from "../../context/SignupContext";
import * as Location from "expo-location";
import MapView, { Marker, PROVIDER_DEFAULT, UrlTile } from "react-native-maps";

const SigninScreen1 = () => {
  const router = useRouter();
  const { signupData, setSignupData } = useSignup();

  const [location, setLocation] = useState<any>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [addressText, setAddressText] = useState(signupData.address || "");

  // Get more accurate location with multiple providers
  const getAccurateLocation = async () => {
    try {
      // Request permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied", 
          "Location permission is required for better service.",
          [{ text: "OK", onPress: () => router.back() }]
        );
        return null;
      }

      // Enable better accuracy with these options
      const locationOptions = {
        accuracy: Location.Accuracy.BestForNavigation,
        timeout: 15000, // 15 seconds timeout
      };

      // Get current position with high accuracy
      const locationResult = await Location.getCurrentPositionAsync(locationOptions);
      
      if (locationResult) {
        // Get address from coordinates
        const geocode = await Location.reverseGeocodeAsync({
          latitude: locationResult.coords.latitude,
          longitude: locationResult.coords.longitude,
        });
        
        if (geocode.length > 0) {
          const address = geocode[0];
          const formattedAddress = `${address.name || ""} ${address.street || ""}, ${
            address.subregion || ""
          }, ${address.city || address.district || ""}, ${address.region || ""}, ${
            address.country || ""
          }`.replace(/\s*,\s*,/g, ',').replace(/,\s*$/, '').replace(/^\s*,/, '');
          
          return {
            coords: locationResult.coords,
            address: formattedAddress
          };
        }
        
        return {
          coords: locationResult.coords,
          address: ""
        };
      }
    } catch (error) {
      console.error("Error getting location:", error);
      
      // Fallback to less accurate method if high accuracy fails
      try {
        const fallbackLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Low,
        });
        
        return {
          coords: fallbackLocation.coords,
          address: ""
        };
      } catch (fallbackError) {
        console.error("Fallback location also failed:", fallbackError);
        Alert.alert(
          "Location Error", 
          "Unable to get your location. Please check your GPS settings or enter your address manually."
        );
      }
    }
    
    return null;
  };

  // Manual address search function
  const searchAddress = async () => {
    if (!addressText.trim()) return;
    
    try {
      setIsLoading(true);
      const geocodeResults = await Location.geocodeAsync(addressText);
      
      if (geocodeResults.length > 0) {
        const firstResult = geocodeResults[0];
        const newLocation = {
          latitude: firstResult.latitude,
          longitude: firstResult.longitude,
        };
        
        setLocation(newLocation);
        setSignupData({
          latitude: newLocation.latitude,
          longitude: newLocation.longitude,
          address: addressText,
        });
        
        // Update map region
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            ...newLocation,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }, 1000);
        }
      } else {
        Alert.alert("Not Found", "Address not found. Please try a different address.");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      Alert.alert("Error", "Failed to search address. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializeLocation = async () => {
      setIsLoading(true);
      
      // If we already have coordinates from previous step, use them
      if (signupData.latitude && signupData.longitude) {
        setLocation({
          latitude: signupData.latitude,
          longitude: signupData.longitude,
        });
        setIsLoading(false);
        return;
      }
      
      // Otherwise get new location
      const locationData = await getAccurateLocation();
      
      if (locationData) {
        setLocation(locationData.coords);
        setSignupData({
          latitude: locationData.coords.latitude,
          longitude: locationData.coords.longitude,
          address: locationData.address,
        });
        setAddressText(locationData.address);
      }
      
      setIsLoading(false);
    };

    initializeLocation();
  }, []);

  const handleNext = () => {
    if (!signupData.firstName || !signupData.lastName || !signupData.address) {
      Alert.alert("Missing Fields", "Please complete all required fields.");
      return;
    }
    router.push("/screen/SigninScreen2");
  };

  const mapRef = React.useRef<MapView>(null);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require("./../image 2.png")} style={styles.logo} />
      <Image source={require("./../Bar2.png")} style={styles.progress} />

      <View style={styles.backgroundform}>
        <Text style={styles.subtitle}>Customer Info</Text>
        <View style={styles.form}>
          <Text style={styles.title}>First Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="First Name"
            value={signupData.firstName || ""}
            onChangeText={(text) => setSignupData({ firstName: text })}
          />

          <Text style={styles.title}>Last Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Last Name"
            value={signupData.lastName || ""}
            onChangeText={(text) => setSignupData({ lastName: text })}
          />

          <Text style={styles.title}>Address *</Text>
          <View style={styles.addressContainer}>
            <TextInput
              style={[styles.input, styles.addressInput]}
              placeholder="Enter your address"
              value={addressText}
              onChangeText={setAddressText}
              multiline
            />
            <TouchableOpacity 
              style={styles.searchButton} 
              onPress={searchAddress}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.searchButtonText}>Search</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Location Status */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Getting your location...</Text>
            </View>
          ) : location ? (
            <View style={styles.mapContainer}>
              <Text style={styles.mapTitle}>Your Location</Text>
              <MapView
                ref={mapRef}
                provider={PROVIDER_DEFAULT}
                style={styles.map}
                initialRegion={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                showsUserLocation={true}
                showsMyLocationButton={true}
                showsCompass={true}
                zoomEnabled={true}
                scrollEnabled={true}
              >
<UrlTile
  urlTemplate="https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg"
  maximumZ={20}
/>
                          <Marker 
                  coordinate={location} 
                  title="Your Location" 
                  pinColor="#007AFF"
                />
              </MapView>
              <TouchableOpacity
                style={styles.fullBtn}
                onPress={() => setFullscreen(true)}
              >
                <Text style={styles.fullBtnText}>Full Screen Map</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.fullBtn, styles.refreshBtn]}
                onPress={async () => {
                  setIsLoading(true);
                  const locationData = await getAccurateLocation();
                  if (locationData) {
                    setLocation(locationData.coords);
                    setSignupData({
                      latitude: locationData.coords.latitude,
                      longitude: locationData.coords.longitude,
                      address: locationData.address,
                    });
                    setAddressText(locationData.address);
                  }
                  setIsLoading(false);
                }}
              >
                <Text style={styles.fullBtnText}>Refresh Location</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.errorText}>
              Location unavailable. Please enter your address manually and press Search.
            </Text>
          )}

          {/* Fullscreen Map Modal */}
          <Modal visible={fullscreen} animationType="slide">
            <View style={styles.fullscreenContainer}>
              {location && (
                <MapView
                  provider={PROVIDER_DEFAULT}
                  style={styles.fullscreenMap}
                  initialRegion={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  showsUserLocation={true}
                  showsMyLocationButton={true}
                >
                  <UrlTile
                    urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maximumZ={19}
                  />
                  <Marker coordinate={location} title="Your Location" />
                </MapView>
              )}
              <TouchableOpacity
                style={[styles.fullBtn, styles.closeBtn]}
                onPress={() => setFullscreen(false)}
              >
                <Text style={styles.fullBtnText}>Close Map</Text>
              </TouchableOpacity>
            </View>
          </Modal>

          <TouchableOpacity style={styles.buttonBase} onPress={handleNext}>
            <View style={styles.loginButton}>
              <Text style={styles.buttonText}>Next</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default SigninScreen1;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  logo: { 
    width: 64, 
    height: 100, 
    marginBottom: 5,
    marginTop: 60, 
    alignSelf: "center" 
  },
  progress: { 
    width: 230, 
    height: 80, 
    alignSelf: "center", 
    marginBottom: 20 
  },
  backgroundform: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 20,
    borderColor: "gray",
    borderWidth: 0.3,
    padding: 20,
    alignItems: "center",
    marginBottom: 30,
  },
  subtitle: { 
    fontSize: 18, 
    fontWeight: "bold", 
    marginBottom: 15,
    alignSelf: "flex-start" 
  },
  form: { 
    width: "100%" 
  },
  title: { 
    fontSize: 15, 
    fontWeight: "bold", 
    marginBottom: 2, 
    paddingHorizontal: 5 
  },
  input: {
    height: 50,
    width: "100%",
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  addressInput: {
    flex: 1,
    marginRight: 10,
    height: 50,
  },
  searchButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    height: 50,
    justifyContent: "center",
  },
  searchButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  loadingContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
  mapContainer: {
    width: "100%",
    marginBottom: 15,
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  map: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  fullBtn: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: "flex-start",
  },
  refreshBtn: {
    backgroundColor: "#34C759",
    marginLeft: 10,
  },
  closeBtn: {
    position: "absolute",
    bottom: 20,
    right: 20,
  },
  fullBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  fullscreenContainer: {
    flex: 1,
  },
  fullscreenMap: {
    flex: 1,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginVertical: 10,
  },
  buttonBase: { 
    alignSelf: "center", 
    width: "100%", 
    marginTop: 20 
  },
  loginButton: { 
    height: 50, 
    backgroundColor: "#007AFF", 
    justifyContent: "center", 
    alignItems: "center", 
    borderRadius: 8 
  },
  buttonText: { 
    color: "#eee6da", 
    fontSize: 18, 
    fontWeight: "bold" 
  },
});