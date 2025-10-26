import apiClient, { STORAGE_KEYS } from './index';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type User = {
  nickname: string;
  firstName?: string;
  lastName?: string;
  customerId?: string;
};

export type LoginRequest = {
  nickname: string;
  password: string;
};

export type LoginResponse = {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
};

export type RegisterRequest = {
  firstName: string;
  lastName: string;
  password: string;
  streetNumber: string;
  streetName: string;
  city: string;
  state: string;
  zip: string;
};

export type RegisterResponse = {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
};

export type TokenResponse = {
  success: boolean;
  result?: string;
  message?: string;
};

/**
 * Get authentication token from backend
 */
export const getToken = async (): Promise<string> => {
  try {
    const response = await apiClient.post<TokenResponse>('/api/token/');
    
    if (response.data.success && response.data.result) {
      return response.data.result;
    }
    
    throw new Error(response.data.message || 'Failed to get token');
  } catch (error: any) {
    console.error('Error getting token:', error);
    throw new Error(error.response?.data?.message || 'Network error getting token');
  }
};

/**
 * Login user with nickname and password
 */
export const login = async (nickname: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post<LoginResponse>('/api/auth/login', {
      nickname: nickname.trim(),
      password,
    });

    if (response.data.success) {
      // Store token if provided
      if (response.data.token) {
        await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.data.token);
      }
      
      // Store user data if provided
      if (response.data.user) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user));
      }
    }

    return response.data;
  } catch (error: any) {
    console.error('Login error:', error);
    
    // Handle error response
    if (error.response?.data) {
      return {
        success: false,
        message: error.response.data.message || 'Could not log in.',
      };
    }
    
    return {
      success: false,
      message: 'Network error. Please try again.',
    };
  }
};

/**
 * Register new user
 */
export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
  try {
    const response = await apiClient.post<RegisterResponse>('/api/users', data);
    
    if (response.data.success) {
      // Store token if provided
      if (response.data.token) {
        await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.data.token);
      }
      
      // Store user data if provided
      if (response.data.user) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user));
      }
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Registration error:', error);
    
    if (error.response?.data) {
      return {
        success: false,
        message: error.response.data.message || 'Could not register user.',
      };
    }
    
    return {
      success: false,
      message: 'Network error. Please try again.',
    };
  }
};

/**
 * Logout user - clear stored data
 */
export const logout = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([STORAGE_KEYS.ACCESS_TOKEN, STORAGE_KEYS.USER]);
  } catch (error) {
    console.error('Error during logout:', error);
    throw error;
  }
};

/**
 * Get stored user data
 */
export const getStoredUser = async (): Promise<User | null> => {
  try {
    const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error('Error reading stored user:', error);
    return null;
  }
};

/**
 * Get stored token
 */
export const getStoredToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  } catch (error) {
    console.error('Error reading stored token:', error);
    return null;
  }
};
