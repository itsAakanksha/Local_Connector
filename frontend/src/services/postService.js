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

// Post service functions
export const postService = {
  // Get posts with filtering and pagination
  async getPosts(filters = {}, page = 1, limit = 10) {
    const params = {
      page,
      limit,
    };

    // Add filters to params
    if (filters.postType && filters.postType !== 'all') {
      params.postType = filters.postType;
    }
    if (filters.location) {
      params.location = filters.location;
    }
    if (filters.sortBy) {
      params.sortBy = filters.sortBy;
    }

    const response = await api.get('/posts', { params });
    return response.data;
  },

  // Get single post
  async getPost(postId) {
    const response = await api.get(`/posts/${postId}`);
    return response.data;
  },

  // Create new post
  async createPost(postData) {
    const formData = new FormData();
    
    // Add text fields
    formData.append('textContent', postData.textContent);
    formData.append('postType', postData.postType);
    if (postData.locationText) {
      formData.append('locationText', postData.locationText);
    }
    
    // Add image if provided
    if (postData.image) {
      formData.append('image', postData.image);
    }

    const response = await api.post('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Like a post
  async likePost(postId) {
    const response = await api.post(`/posts/${postId}/like`);
    return response.data;
  },

  // Dislike a post
  async dislikePost(postId) {
    const response = await api.post(`/posts/${postId}/dislike`);
    return response.data;
  },

  // Get replies for a post
  async getReplies(postId, page = 1, limit = 10) {
    const response = await api.get(`/posts/${postId}/replies`, {
      params: { page, limit },
    });
    return response.data;
  },

  // Create reply
  async createReply(postId, textContent) {
    const response = await api.post(`/posts/${postId}/replies`, {
      textContent,
    });
    return response.data;
  },
};

export default postService;
