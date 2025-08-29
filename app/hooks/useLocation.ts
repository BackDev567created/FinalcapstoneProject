import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { supabase } from '../../supabaseClient';

export interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: Date;
  accuracy?: number;
  orderId?: string;
}

export const useLocation = (orderId?: string) => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<Location.PermissionStatus | null>(null);

  // Request location permissions
  const requestPermissions = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);

      if (status !== 'granted') {
        setError('Location permission denied');
        return false;
      }

      return true;
    } catch (err) {
      setError('Failed to request location permissions');
      return false;
    }
  };

  // Get current location
  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      setError(null);

      const hasPermission = await requestPermissions();
      if (!hasPermission) return null;

      const locationData = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const currentLocation: LocationData = {
        latitude: locationData.coords.latitude,
        longitude: locationData.coords.longitude,
        timestamp: new Date(),
        accuracy: locationData.coords.accuracy || undefined,
        orderId,
      };

      setLocation(currentLocation);
      return currentLocation;
    } catch (err) {
      setError('Failed to get current location');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Save location to database
  const saveLocation = async (locationData: LocationData) => {
    try {
      if (!orderId) {
        console.warn('No orderId provided for location tracking');
        return;
      }

      const { error } = await supabase
        .from('locations')
        .insert([
          {
            order_id: orderId,
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            timestamp: locationData.timestamp.toISOString(),
          }
        ]);

      if (error) {
        console.error('Failed to save location:', error);
        setError('Failed to save location to database');
      } else {
        console.log('Location saved successfully');
      }
    } catch (err) {
      console.error('Error saving location:', err);
      setError('Failed to save location');
    }
  };

  // Start location tracking
  const startLocationTracking = async (intervalMs: number = 30000) => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      // Get initial location
      await getCurrentLocation();

      // Set up interval for continuous tracking
      const intervalId = setInterval(async () => {
        const currentLoc = await getCurrentLocation();
        if (currentLoc && orderId) {
          await saveLocation(currentLoc);
        }
      }, intervalMs);

      return () => clearInterval(intervalId);
    } catch (err) {
      setError('Failed to start location tracking');
    }
  };

  // Get location history for an order
  const getLocationHistory = async (targetOrderId: string) => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('order_id', targetOrderId)
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Failed to fetch location history:', error);
        setError('Failed to fetch location history');
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Error fetching location history:', err);
      setError('Failed to fetch location history');
      return [];
    }
  };

  // Watch position changes
  const watchLocation = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      const locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000, // Update every 10 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        (locationData) => {
          const newLocation: LocationData = {
            latitude: locationData.coords.latitude,
            longitude: locationData.coords.longitude,
            timestamp: new Date(),
            accuracy: locationData.coords.accuracy || undefined,
            orderId,
          };

          setLocation(newLocation);

          if (orderId) {
            saveLocation(newLocation);
          }
        }
      );

      return locationSubscription;
    } catch (err) {
      setError('Failed to watch location');
    }
  };

  return {
    location,
    loading,
    error,
    permissionStatus,
    requestPermissions,
    getCurrentLocation,
    saveLocation,
    startLocationTracking,
    getLocationHistory,
    watchLocation,
  };
};