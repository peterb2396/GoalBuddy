import axios from 'axios';

// Update this to your backend URL
const API_URL = 'http://localhost:3000/api';

// For development, use your local IP address instead of localhost
// Example: const API_URL = 'http://192.168.1.100:3000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

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
