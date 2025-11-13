// Add this to your app to debug auth issues
// Import and add to navigation: <Stack.Screen name="Debug" component={DebugScreen} />

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { authAPI, goalsAPI } from '../services/api';

export default function DebugScreen() {
  const [logs, setLogs] = useState([]);
  const { token, user } = useAuth();

  const log = (message, type = 'info') => {
    const emoji = type === 'error' ? '❌' : type === 'success' ? '✅' : '🔍';
    const newLog = `${emoji} ${message}`;
    console.log(newLog);
    setLogs(prev => [newLog, ...prev]);
  };

  const testStoredToken = async () => {
    log('Testing stored token...');
    try {
      const storedToken = await AsyncStorage.getItem('authToken');
      const storedUser = await AsyncStorage.getItem('user');
      
      log(`Token in storage: ${storedToken ? 'YES' : 'NO'}`, storedToken ? 'success' : 'error');
      log(`User in storage: ${storedUser ? 'YES' : 'NO'}`, storedUser ? 'success' : 'error');
      
      if (storedToken) {
        log(`Token length: ${storedToken.length}`);
        log(`Token start: ${storedToken.substring(0, 50)}...`);
        log(`Token parts: ${storedToken.split('.').length} (should be 3)`, 
          storedToken.split('.').length === 3 ? 'success' : 'error');
      }
      
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        log(`User: ${userData.email}`);
      }
    } catch (error) {
      log(`Error reading storage: ${error.message}`, 'error');
    }
  };

  const testContextAuth = () => {
    log('Testing auth context...');
    log(`Token in context: ${token ? 'YES' : 'NO'}`, token ? 'success' : 'error');
    log(`User in context: ${user ? 'YES' : 'NO'}`, user ? 'success' : 'error');
    
    if (token) {
      log(`Context token start: ${token.substring(0, 50)}...`);
    }
    
    if (user) {
      log(`Context user: ${user.email}`);
    }
  };

  const testAPI = async () => {
    log('Testing API call to /auth/me...');
    try {
      const response = await authAPI.getMe();
      log(`API Success: ${response.email}`, 'success');
    } catch (error) {
      log(`API Error: ${error.response?.status} - ${error.response?.data?.error}`, 'error');
      log(`Error details: ${error.message}`, 'error');
    }
  };

  const testGoalsAPI = async () => {
    log('Testing API call to /goals...');
    try {
      const response = await goalsAPI.getGoals();
      log(`Goals API Success: ${response.length} goals`, 'success');
    } catch (error) {
      log(`Goals API Error: ${error.response?.status} - ${error.response?.data?.error}`, 'error');
    }
  };

  const clearStorage = async () => {
    log('Clearing AsyncStorage...');
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      log('Storage cleared', 'success');
    } catch (error) {
      log(`Error clearing storage: ${error.message}`, 'error');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔍 Auth Debug Panel</Text>
      
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.button} onPress={testStoredToken}>
          <Text style={styles.buttonText}>Test Stored Token</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testContextAuth}>
          <Text style={styles.buttonText}>Test Context</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testAPI}>
          <Text style={styles.buttonText}>Test /auth/me</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testGoalsAPI}>
          <Text style={styles.buttonText}>Test /goals</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={clearStorage}>
          <Text style={styles.buttonText}>Clear Storage</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={() => setLogs([])}>
          <Text style={styles.buttonText}>Clear Logs</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.logs}>
        {logs.map((log, index) => (
          <Text key={index} style={styles.logText}>{log}</Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttons: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  logs: {
    flex: 1,
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 8,
  },
  logText: {
    color: '#0f0',
    fontFamily: 'monospace',
    fontSize: 12,
    marginBottom: 5,
  },
});
