import * as SecureStore from 'expo-secure-store';
import { supabase } from '../../supabaseClient';
import { API_ENDPOINTS, STORAGE_KEYS } from '../../shared/constants';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  address?: string;
  role: 'admin' | 'customer';
}

export interface AuthResponse {
  success: boolean;
  data?: {
    token: string;
    user: User;
  };
  message?: string;
}

class AuthService {
  private token: string | null = null;

  // Store token securely
  private async storeToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, token);
      this.token = token;
    } catch (error) {
      console.error('Error storing token:', error);
    }
  }

  // Get stored token
  private async getStoredToken(): Promise<string | null> {
    try {
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      this.token = token;
      return token;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  // Remove stored token
  private async removeToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      this.token = null;
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }

  // Store user data
  private async storeUserData(user: User): Promise<void> {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  }

  // Get stored user data
  async getStoredUserData(): Promise<User | null> {
    try {
      const userData = await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  // Remove stored user data
  private async removeUserData(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
    } catch (error) {
      console.error('Error removing user data:', error);
    }
  }

  // Login with Supabase (for now, until backend is ready)
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      // First, try admin login
      const { data: admins, error: adminError } = await supabase
        .from('admins')
        .select('*');

      if (adminError) {
        console.error('Error fetching admins:', adminError);
      } else if (admins && admins.length > 0) {
        const matchedAdmin = admins.find(
          (admin: any) => admin.username === email
        );

        if (matchedAdmin) {
          // For now, simple password comparison (should use bcrypt in production)
          if (password === 'admin123') {
            const adminUser: User = {
              id: matchedAdmin.id,
              email: matchedAdmin.username,
              full_name: 'Administrator',
              role: 'admin',
            };

            await this.storeToken('admin-token-' + Date.now()); // Temporary token
            await this.storeUserData(adminUser);

            return {
              success: true,
              data: {
                token: 'admin-token-' + Date.now(),
                user: adminUser,
              },
            };
          }
        }
      }

      // If not admin, try regular user login with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !authData.user) {
        return {
          success: false,
          message: 'Invalid email or password',
        };
      }

      // Get user profile from database
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !userProfile) {
        return {
          success: false,
          message: 'User profile not found',
        };
      }

      const user: User = {
        id: userProfile.id,
        email: userProfile.email,
        full_name: userProfile.full_name,
        phone: userProfile.phone,
        address: userProfile.address,
        role: userProfile.role,
      };

      await this.storeToken(authData.session?.access_token || '');
      await this.storeUserData(user);

      return {
        success: true,
        data: {
          token: authData.session?.access_token || '',
          user,
        },
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'An unexpected error occurred',
      };
    }
  }

  // Register with Supabase (for now, until backend is ready)
  async register(userData: {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
    address?: string;
  }): Promise<AuthResponse> {
    try {
      // 1. Sign up user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });

      if (authError || !authData.user) {
        return {
          success: false,
          message: authError?.message || 'Failed to create account',
        };
      }

      // 2. Create user profile in users table
      const { error: profileError } = await supabase.from('users').insert([
        {
          id: authData.user.id,
          email: userData.email,
          full_name: userData.full_name,
          phone: userData.phone,
          address: userData.address,
          role: 'customer',
        },
      ]);

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Try to clean up the auth user if profile creation fails
        await supabase.auth.admin.deleteUser(authData.user.id);
        return {
          success: false,
          message: 'Failed to create user profile',
        };
      }

      // For now, create a temporary token since we don't have email confirmation
      const tempToken = 'temp-' + Date.now();
      await this.storeToken(tempToken);
      await this.storeUserData({
        id: authData.user.id,
        email: userData.email,
        full_name: userData.full_name,
        phone: userData.phone,
        address: userData.address,
        role: 'customer',
      });

      return {
        success: true,
        data: {
          token: tempToken,
          user: {
            id: authData.user.id,
            email: userData.email,
            full_name: userData.full_name,
            phone: userData.phone,
            address: userData.address,
            role: 'customer',
          },
        },
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'An unexpected error occurred during registration',
      };
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      // Clear local storage
      await this.removeToken();
      await this.removeUserData();

      // Sign out from Supabase if needed
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getStoredToken();
      const user = await this.getStoredUserData();
      return !!(token && user);
    } catch (error) {
      return false;
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    return await this.getStoredUserData();
  }

  // Get auth token
  async getToken(): Promise<string | null> {
    return await this.getStoredToken();
  }

  // Validate token with backend
  async validateToken(): Promise<boolean> {
    try {
      const token = await this.getToken();
      if (!token) return false;

      // You can add token validation logic here
      // For now, just check if token exists
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const authService = new AuthService();