import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  videoInsightApi,
  queryKeys,
  SubmitVideoRequest,
} from "./videoInsightApi";
import { getCredits } from "./authApi";

// Hook for submitting a new video
export const useSubmitVideo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubmitVideoRequest) => videoInsightApi.submitVideo(data),
    onSuccess: (data) => {
      // Invalidate and refetch videos list
      queryClient.invalidateQueries({ queryKey: queryKeys.videos });

      // Optimistically add the new video to the cache
      queryClient.setQueryData(queryKeys.videos, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          videos: [
            {
              id: data.id,
              title: data.message || "Processing...",
              status: data.status,
              createdAt: new Date().toISOString(),
              duration: "",
              platform: "unknown",
              steps: [],
              summary: { text: "", metrics: [] },
              transcript: [],
              insights: { chips: [], sections: [] },
            },
            ...old.videos,
          ],
        };
      });
    },
    onError: (error) => {
      console.error("Error submitting video:", error);
    },
  });
};

// Hook for fetching all videos
export const useVideos = () => {
  return useQuery({
    queryKey: queryKeys.videos,
    queryFn: () => videoInsightApi.getVideos(),
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  });
};

// Hook for fetching a specific video
export const useVideo = (id: string) => {
  return useQuery({
    queryKey: queryKeys.video(id),
    queryFn: () => videoInsightApi.getVideo(id),
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
  });
};

// Hook for polling video status (for processing videos)
export const useVideoStatus = (id: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.videoStatus(id),
    queryFn: () => videoInsightApi.getVideoStatus(id),
    enabled: enabled && !!id,
    refetchInterval: 60000, // Poll every 1 minute for pending, downloaded, and transcribing videos
    refetchIntervalInBackground: true,
    staleTime: 0, // Always consider data stale for status
  });
};

// Hook for optimistic updates when video status changes
export const useVideoStatusUpdate = () => {
  const queryClient = useQueryClient();

  return {
    updateVideoStatus: (id: string, status: string, progress?: number) => {
      // Update the video in the cache
      queryClient.setQueryData(queryKeys.video(id), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          video: {
            ...old.video,
            status,
          },
        };
      });

      // Update the videos list
      queryClient.setQueryData(queryKeys.videos, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          videos: old.videos.map((video: any) =>
            video.id === id ? { ...video, status } : video
          ),
        };
      });
    },
  };
};

// Hook for fetching credits and transactions
export const useCredits = () => {
  return useQuery({
    queryKey: ["credits"],
    queryFn: () => getCredits(),
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  });
};
