import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Update this to your backend URL
const API_URL = 'http://10.215.236.11:3000/api';

// For development, use your local IP address instead of localhost
// Example: const API_URL = 'http://192.168.1.100:3000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear auth data
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      // You might want to emit an event here to trigger logout in your app
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  register: async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

// Goals API
export const goalAPI = {
  // Get all goals
  getAllGoals: async () => {
    const response = await api.get('/goals');
    return response.data;
  },

  // Get single goal
  getGoal: async (id) => {
    const response = await api.get(`/goals/${id}`);
    return response.data;
  },

  // Create goal
  createGoal: async (goalData) => {
    const response = await api.post('/goals', goalData);
    return response.data;
  },

  // Update goal
  updateGoal: async (id, goalData) => {
    const response = await api.put(`/goals/${id}`, goalData);
    return response.data;
  },

  // Delete goal
  deleteGoal: async (id) => {
    const response = await api.delete(`/goals/${id}`);
    return response.data;
  },

  // Reorder goals
  reorderGoals: async (orderedIds) => {
    const response = await api.post('/goals/reorder', { orderedIds });
    return response.data;
  },

  // Update sub-item
  updateSubItem: async (goalId, subItemId, subItemData) => {
    const response = await api.put(`/goals/${goalId}/subitems/${subItemId}`, subItemData);
    return response.data;
  },

  // Register push token
  registerPushToken: async (token) => {
    const response = await api.post('/push-token', { token });
    return response.data;
  },

  // Test notification
  testNotification: async () => {
    const response = await api.post('/test-notification');
    return response.data;
  }
};

export default api;
