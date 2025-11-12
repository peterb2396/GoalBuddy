import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      console.log('Loading stored auth...'); // Debug log
      const storedToken = await AsyncStorage.getItem('authToken');
      const storedUser = await AsyncStorage.getItem('user');
      
      console.log('Stored token:', storedToken ? 'exists' : 'none'); // Debug log
      console.log('Stored user:', storedUser ? 'exists' : 'none'); // Debug log
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        console.log('Auth restored from storage'); // Debug log
      } else {
        console.log('No stored auth found'); // Debug log
      }
    } catch (error) {
      console.error('Error loading auth:', error);
    } finally {
      setLoading(false);
      console.log('Auth loading complete'); // Debug log
    }
  };

  const login = async (email, password) => {
    try {
      console.log('Attempting login...'); // Debug log
      const response = await authAPI.login(email, password);
      const { token: newToken, user: newUser } = response;
      
      await AsyncStorage.setItem('authToken', newToken);
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
      
      setToken(newToken);
      setUser(newUser);
      
      console.log('Login successful'); // Debug log
      return { success: true };
    } catch (error) {
      console.error('Login error:', error); // Debug log
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed. Please try again.' 
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      console.log('Attempting registration...'); // Debug log
      const response = await authAPI.register(name, email, password);
      const { token: newToken, user: newUser } = response;
      
      await AsyncStorage.setItem('authToken', newToken);
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
      
      setToken(newToken);
      setUser(newUser);
      
      console.log('Registration successful'); // Debug log
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error); // Debug log
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed. Please try again.' 
      };
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out...'); // Debug log
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      setToken(null);
      setUser(null);
      console.log('Logout complete'); // Debug log
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Calculate isAuthenticated based on both token and user
  const isAuthenticated = !!token && !!user;

  // Debug log whenever auth state changes
  useEffect(() => {
    console.log('Auth state changed:', { 
      isAuthenticated, 
      hasToken: !!token, 
      hasUser: !!user, 
      loading 
    });
  }, [isAuthenticated, token, user, loading]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading,
      login, 
      register, 
      logout,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;