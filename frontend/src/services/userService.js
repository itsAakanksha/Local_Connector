import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://local-connector-1.onrender.com/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cityscope-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// User service functions
export const userService = {
  // Get current user profile
  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Get user profile by username
  async getUserProfile(username) {
    const response = await api.get(`/users/${username}`);
    return response.data;
  },

  // Get user posts by username
  async getUserPosts(username, page = 1, limit = 10) {
    const response = await api.get(`/users/${username}/posts`, {
      params: { page, limit },
    });
    return response.data;
  },

  // Update user profile
  async updateProfile(profileData) {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  // Search users
  async searchUsers(query) {
    const response = await api.get('/users/search', {
      params: { q: query },
    });
    return response.data;
  },
};

export default userService;
