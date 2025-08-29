import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  fallback?: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = false,
  requireAdmin = false,
  fallback
}) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (requireAuth && !isAuthenticated) {
      // Redirect to login if authentication is required but user is not authenticated
      router.replace('/screen/LoginScreen');
      return;
    }

    if (requireAdmin && (!isAuthenticated || user?.role !== 'admin')) {
      // Redirect to home if admin access is required but user is not admin
      router.replace('/user/HomeScreen');
      return;
    }

    if (isAuthenticated && !requireAuth) {
      // If user is authenticated and we're on a public page, redirect to appropriate dashboard
      if (user?.role === 'admin') {
        router.replace('/tabs/BottomTab');
      } else {
        router.replace('/Components/MainDrawer');
      }
      return;
    }
  }, [isLoading, isAuthenticated, user, requireAuth, requireAdmin, router]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#4189C8" />
      </View>
    );
  }

  // If authentication check fails and we have a fallback, show it
  if (requireAuth && !isAuthenticated && fallback) {
    return <>{fallback}</>;
  }

  // If admin access is required but user is not admin and we have a fallback, show it
  if (requireAdmin && (!isAuthenticated || user?.role !== 'admin') && fallback) {
    return <>{fallback}</>;
  }

  // Render children if all checks pass
  return <>{children}</>;
};

// Higher-order component for protecting entire screens
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  options: { requireAuth?: boolean; requireAdmin?: boolean } = {}
) => {
  return (props: P) => (
    <AuthGuard {...options}>
      <Component {...props} />
    </AuthGuard>
  );
};

// Specific guards for common use cases
export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthGuard requireAuth>{children}</AuthGuard>
);

export const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthGuard requireAuth requireAdmin>{children}</AuthGuard>
);

export const GuestOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthGuard requireAuth={false}>{children}</AuthGuard>
);