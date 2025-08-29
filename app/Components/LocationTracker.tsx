import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useLocation, LocationData } from '../hooks/useLocation';

interface LocationTrackerProps {
  orderId: string;
  customerName: string;
  deliveryAddress: string;
  onLocationUpdate?: (location: LocationData) => void;
}

export const LocationTracker: React.FC<LocationTrackerProps> = ({
  orderId,
  customerName,
  deliveryAddress,
  onLocationUpdate,
}) => {
  const {
    location,
    loading,
    error,
    getCurrentLocation,
    startLocationTracking,
    getLocationHistory,
    watchLocation,
  } = useLocation(orderId);

  const [locationHistory, setLocationHistory] = useState<LocationData[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [locationSubscription, setLocationSubscription] = useState<any>(null);

  // Load location history on mount
  useEffect(() => {
    loadLocationHistory();
  }, [orderId]);

  // Notify parent of location updates
  useEffect(() => {
    if (location && onLocationUpdate) {
      onLocationUpdate(location);
    }
  }, [location]);

  const loadLocationHistory = async () => {
    try {
      const history = await getLocationHistory(orderId);
      const formattedHistory: LocationData[] = history.map(item => ({
        latitude: parseFloat(item.latitude),
        longitude: parseFloat(item.longitude),
        timestamp: new Date(item.timestamp),
        orderId: item.order_id,
      }));
      setLocationHistory(formattedHistory);
    } catch (err) {
      console.error('Failed to load location history:', err);
    }
  };

  const handleStartTracking = async () => {
    try {
      setIsTracking(true);

      // Start continuous location tracking
      const stopTracking = await startLocationTracking(30000); // Update every 30 seconds

      // Also start watching for position changes
      const subscription = await watchLocation();
      setLocationSubscription(subscription);

      Alert.alert(
        'Location Tracking Started',
        `Now tracking delivery location for ${customerName}`,
        [{ text: 'OK' }]
      );

      return () => {
        if (stopTracking) stopTracking();
        if (subscription) subscription.remove();
      };
    } catch (err) {
      console.error('Failed to start tracking:', err);
      setIsTracking(false);
      Alert.alert('Error', 'Failed to start location tracking');
    }
  };

  const handleStopTracking = () => {
    setIsTracking(false);
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }
    Alert.alert(
      'Location Tracking Stopped',
      `Stopped tracking delivery location for ${customerName}`,
      [{ text: 'OK' }]
    );
  };

  const handleGetCurrentLocation = async () => {
    const currentLoc = await getCurrentLocation();
    if (currentLoc) {
      Alert.alert(
        'Current Location',
        `Lat: ${currentLoc.latitude.toFixed(6)}\nLng: ${currentLoc.longitude.toFixed(6)}`,
        [{ text: 'OK' }]
      );
    }
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Location Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleGetCurrentLocation}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Delivery Tracking</Text>
        <Text style={styles.subtitle}>{customerName}</Text>
        <Text style={styles.address}>{deliveryAddress}</Text>
      </View>

      <View style={styles.mapContainer}>
        {location ? (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            showsUserLocation={true}
            showsMyLocationButton={true}
          >
            {/* Current location marker */}
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="Current Location"
              description={`Last updated: ${location.timestamp.toLocaleTimeString()}`}
              pinColor="blue"
            />

            {/* Location history polyline */}
            {locationHistory.length > 1 && (
              <Polyline
                coordinates={locationHistory.map(loc => ({
                  latitude: loc.latitude,
                  longitude: loc.longitude,
                }))}
                strokeColor="#007AFF"
                strokeWidth={3}
              />
            )}

            {/* History markers */}
            {locationHistory.map((loc, index) => (
              <Marker
                key={index}
                coordinate={{
                  latitude: loc.latitude,
                  longitude: loc.longitude,
                }}
                title={`Stop ${index + 1}`}
                description={loc.timestamp.toLocaleString()}
                pinColor="gray"
              />
            ))}
          </MapView>
        ) : (
          <View style={styles.noLocationContainer}>
            <Text style={styles.noLocationText}>
              {loading ? 'Getting location...' : 'No location data available'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, isTracking && styles.buttonDisabled]}
          onPress={handleStartTracking}
          disabled={isTracking}
        >
          <Text style={[styles.buttonText, isTracking && styles.buttonTextDisabled]}>
            {isTracking ? 'Tracking...' : 'Start Tracking'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.stopButton, !isTracking && styles.buttonDisabled]}
          onPress={handleStopTracking}
          disabled={!isTracking}
        >
          <Text style={[styles.buttonText, !isTracking && styles.buttonTextDisabled]}>
            Stop Tracking
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.locationButton]}
          onPress={handleGetCurrentLocation}
        >
          <Text style={styles.buttonText}>Get Location</Text>
        </TouchableOpacity>
      </View>

      {location && (
        <View style={styles.locationInfo}>
          <Text style={styles.locationText}>
            Lat: {location.latitude.toFixed(6)}
          </Text>
          <Text style={styles.locationText}>
            Lng: {location.longitude.toFixed(6)}
          </Text>
          <Text style={styles.locationText}>
            Updated: {location.timestamp.toLocaleTimeString()}
          </Text>
          {location.accuracy && (
            <Text style={styles.locationText}>
              Accuracy: ±{location.accuracy.toFixed(0)}m
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2,
  },
  address: {
    fontSize: 14,
    color: '#888',
  },
  mapContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  map: {
    flex: 1,
  },
  noLocationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  noLocationText: {
    fontSize: 16,
    color: '#666',
  },
  controls: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  stopButton: {
    backgroundColor: '#dc3545',
  },
  locationButton: {
    backgroundColor: '#28a745',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonTextDisabled: {
    color: '#999',
  },
  locationInfo: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});