import api from './axios';

// Example: Fetch videos
export const fetchVideos = async () => {
  const response = await api.get('/videos');
  return response.data;
};

// Add more API functions as needed 