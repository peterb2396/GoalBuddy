import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


const API_URL = 'https://goalbuddy-95vi.onrender.com/api';//'http://192.168.4.22:3000/api'; // Replace with your server IP

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
let isRefreshing = false;

api.interceptors.request.use(
  async (config) => {
    try {
      // Skip auth for login/register endpoints
      if (config.url?.includes('/auth/login') || config.url?.includes('/auth/register')) {
        console.log('📡 Auth endpoint - skipping token');
        return config;
      }

      console.log('📡 API Request to:', config.url);
      
      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem('authToken');
      
      if (token) {
        console.log('🔑 Token found:', token.substring(0, 30) + '...');
        config.headers.Authorization = `Bearer ${token}`;
        console.log('✅ Authorization header set');
      } else {
        console.log('⚠️ No token in storage');
      }
      
      return config;
    } catch (error) {
      console.error('❌ Error in request interceptor:', error);
      return config;
    }
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Handle auth errors in responses
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.status);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    console.error('❌ API Error:', {
      url: originalRequest?.url,
      status: error.response?.status,
      error: error.response?.data?.error
    });
    
    if (error.response?.status === 401 && !isRefreshing) {
      isRefreshing = true;
      console.log('🚨 401 Unauthorized - clearing auth data');
      
      try {
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('user');
        console.log('🧹 Auth data cleared');
      } catch (clearError) {
        console.error('Error clearing auth data:', clearError);
      }
      
      isRefreshing = false;
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },

  updatePushToken: async (pushToken) => {
    const response = await api.post('/auth/push-token', { pushToken });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

// Goals API
export const goalsAPI = {
  getGoals: async () => {
    const response = await api.get('/goals');
    return response.data;
  },
  
  getGoal: async (id) => {
    const response = await api.get(`/goals/${id}`);
    return response.data;
  },
  
  createGoal: async (goalData) => {
    const response = await api.post('/goals', goalData);
    return response.data;
  },
  
  updateGoal: async (id, goalData) => {
    const response = await api.put(`/goals/${id}`, goalData);
    return response.data;
  },
  
  deleteGoal: async (id) => {
    const response = await api.delete(`/goals/${id}`);
    return response.data;
  },
  
  toggleSubgoal: async (goalId, subgoalId) => {
    const response = await api.patch(`/goals/${goalId}/subgoals/${subgoalId}/toggle`);
    return response.data;
  },

  reorderGoals: async (orderedIds) => {
    const response = await api.post('/goals/reorder', { orderedIds });
    return response.data;
  },

  // Share goal with a friend
  shareGoalWithFriend: async (goalId, friendId) => {
    const response = await api.post(`/goals/${goalId}/share`, { friendId });
    return response.data;
  },

  // Remove friend from shared goal
  removeFromSharedGoal: async (goalId, friendId) => {
    const response = await api.delete(`/goals/${goalId}/share/${friendId}`);
    return response.data;
  }

};

// Friends API
export const friendsAPI = {
  getFriends: async () => {
    const response = await api.get('/friends');
    return response.data;
  },

  getRequests: async () => {
    const response = await api.get('/friends/requests');
    return response.data;
  },

  getSentRequests: async () => {
    const response = await api.get('/friends/requests/sent');
    return response.data;
  },

  sendRequest: async (email) => {
    const response = await api.post('/friends/request', { email });
    return response.data;
  },

  acceptRequest: async (requestId) => {
    const response = await api.post(`/friends/request/${requestId}/accept`);
    return response.data;
  },

  rejectRequest: async (requestId) => {
    const response = await api.post(`/friends/request/${requestId}/reject`);
    return response.data;
  },

  removeFriend: async (friendId) => {
    const response = await api.delete(`/friends/${friendId}`);
    return response.data;
  }
};

export default api;