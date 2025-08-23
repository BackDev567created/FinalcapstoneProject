import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  Modal,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useSignup } from "../../context/SignupContext";
import * as Location from "expo-location";
import MapView, { Marker, PROVIDER_DEFAULT, UrlTile } from "react-native-maps";
import {
  TextInput,
  Button,
  Text,
  ActivityIndicator,
  Card,
} from "react-native-paper";

const SigninScreen1 = () => {
  const router = useRouter();
  const { signupData, setSignupData } = useSignup();

  const [location, setLocation] = useState<any>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [addressText, setAddressText] = useState(signupData.address || "");
  const [showPassword, setShowPassword] = useState(false);

  // Get more accurate location with multiple providers
  const getAccurateLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required for better service.",
          [{ text: "OK", onPress: () => router.back() }]
        );
        return null;
      }

      const locationOptions = {
        accuracy: Location.Accuracy.BestForNavigation,
        timeout: 15000,
      };

      const locationResult = await Location.getCurrentPositionAsync(locationOptions);

      if (locationResult) {
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
          }`
            .replace(/\s*,\s*,/g, ",")
            .replace(/,\s*$/, "")
            .replace(/^\s*,/, "");

          return {
            coords: locationResult.coords,
            address: formattedAddress,
          };
        }

        return {
          coords: locationResult.coords,
          address: "",
        };
      }
    } catch (error) {
      console.error("Error getting location:", error);

      try {
        const fallbackLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Low,
        });

        return {
          coords: fallbackLocation.coords,
          address: "",
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

  // Manual address search
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

        if (mapRef.current) {
          mapRef.current.animateToRegion(
            {
              ...newLocation,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            },
            1000
          );
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

      if (signupData.latitude && signupData.longitude) {
        setLocation({
          latitude: signupData.latitude,
          longitude: signupData.longitude,
        });
        setIsLoading(false);
        return;
      }

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

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.subtitle}>
            Customer Info
          </Text>

          <TextInput
            label="First Name *"
            mode="outlined"
            value={signupData.firstName || ""}
            onChangeText={(text) => setSignupData({ firstName: text })}
            style={styles.input}
            disabled={isLoading}
            theme={{
              colors: {
                primary: '#007AFF',
                outline: '#007AFF',
              },
            }}
          />

          <TextInput
            label="Last Name *"
            mode="outlined"
            value={signupData.lastName || ""}
            onChangeText={(text) => setSignupData({ lastName: text })}
            style={styles.input}
            disabled={isLoading}
            theme={{
              colors: {
                primary: '#007AFF',
                outline: '#007AFF',
              },
            }}
          />

          <Text variant="bodyLarge" style={styles.title}>
            Address *
          </Text>
          <View style={styles.addressContainer}>
            <TextInput
              label="Enter your address"
              mode="outlined"
              value={addressText}
              onChangeText={setAddressText}
              style={[styles.input, styles.addressInput]}
              disabled={isLoading}
              multiline
              numberOfLines={2}
              theme={{
                colors: {
                  primary: '#007AFF',
                  outline: '#007AFF',
                },
              }}
            />
            <Button
              mode="contained"
              style={styles.searchButton}
              onPress={searchAddress}
              disabled={isLoading}
              icon={isLoading ? () => <ActivityIndicator size="small" color="#fff" /> : "magnify"}
            >
              {isLoading ? "" : "Search"}
            </Button>
          </View>

          {/* Location Status */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Getting your location...</Text>
            </View>
          ) : location ? (
            <View style={styles.mapContainer}>
              <Text variant="titleSmall" style={styles.mapTitle}>
                Your Location
              </Text>
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
              <View style={styles.buttonRow}>
                <Button
                  mode="contained"
                  style={styles.fullBtn}
                  onPress={() => setFullscreen(true)}
                >
                  Full Screen Map
                </Button>
                <Button
                  mode="contained"
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
                  Refresh Location
                </Button>
              </View>
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
              <Button
                mode="contained"
                style={[styles.fullBtn, styles.closeBtn]}
                onPress={() => setFullscreen(false)}
              >
                Close Map
              </Button>
            </View>
          </Modal>

          <Button
            mode="contained"
            style={styles.nextButton}
            onPress={handleNext}
          >
            Next
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

export default SigninScreen1;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  logo: {
    width: 64,
    height: 100,
    marginBottom: 5,
    marginTop: 40,
    alignSelf: "center",
  },
  progress: {
    width: 230,
    height: 80,
    alignSelf: "center",
    marginBottom: 20,
  },
  card: {
    width: "100%",
    borderRadius: 12,
    paddingVertical: 8,
  },
  subtitle: {
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  title: {
    marginBottom: 8,
    paddingHorizontal: 5,
  },
  input: {
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  addressInput: {
    flex: 1,
    marginRight: 10,
  },
  searchButton: {
    height: 56,
    justifyContent: "center",
    borderRadius: 4,
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
    marginBottom: 10,
  },
  map: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  fullBtn: {
    flex: 1,
    marginHorizontal: 4,
  },
  refreshBtn: {
    backgroundColor: "#34C759",
  },
  closeBtn: {
    position: "absolute",
    bottom: 20,
    right: 20,
  },
  fullscreenContainer: {
    flex: 1,
    justifyContent: "center",
  },
  fullscreenMap: {
    flex: 1,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginVertical: 10,
  },
  nextButton: {
    marginTop: 16,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#007AFF",
  },
});