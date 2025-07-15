import api from './axios';
import { Submission } from '@/types/submission';

// API endpoints
const ENDPOINTS = {
  VIDEOS: '/video',
  VIDEO: (id: string) => `/video/${id}`,
  VIDEO_STATUS: (id: string) => `/video/${id}/status`,
} as const;

// Types for API responses
export interface SubmitVideoRequest {
  videoUrl: string;
}

export interface SubmitVideoResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  message?: string;
}

export interface VideosResponse {
  videos: Submission[];
}

export interface VideoResponse {
  id: number;
  videoUrl: string;
  status: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  videoId: string;
  title: string;
  thumbnail: string;
  duration: number;
  downloadUrl: string;
  transcriptionId: string;
  transcription: string;
  summary: string;
  insights: {
    topics: string[];
    summary: string;
    warnings: string[];
    extractedAt: string;
    processedChunks: number;
    originalTokenCount: number;
  };
  errorMessage: string;
}

// API functions
export const videoInsightApi = {
  // Submit a new video
  submitVideo: async (data: SubmitVideoRequest): Promise<SubmitVideoResponse> => {
    const response = await api.post(ENDPOINTS.VIDEOS, data);
    return response.data;
  },

  // Get all videos
  getVideos: async (): Promise<VideosResponse> => {
    const response = await api.get(ENDPOINTS.VIDEOS);
    return response.data;
  },

  // Get a specific video
  getVideo: async (id: string): Promise<VideoResponse> => {
    const response = await api.get(ENDPOINTS.VIDEO(id));
    return response.data;
  },

  // Get video status (for polling)
  getVideoStatus: async (id: string): Promise<{ status: string; progress?: number }> => {
    const response = await api.get(ENDPOINTS.VIDEO_STATUS(id));
    return response.data;
  },
};

// Query keys for TanStack Query
export const queryKeys = {
  videos: ['videos'] as const,
  video: (id: string) => ['video', id] as const,
  videoStatus: (id: string) => ['video-status', id] as const,
} as const; 