import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import {
  videoInsightApi,
  queryKeys,
  SubmitVideoRequest,
} from "./videoInsightApi";
import { getCredits } from "./authApi";

type SubmitVideoVariables = SubmitVideoRequest & {
  thumbnail?: string;
  title?: string;
};

// Hook for submitting a new video
export const useSubmitVideo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubmitVideoVariables) =>
      videoInsightApi.submitVideo({ videoUrl: data.videoUrl }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.videos });

      queryClient.setQueryData(queryKeys.videos, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          videos: [
            {
              id: data.id,
              title: variables.title || "Processing...",
              status: data.status,
              thumbnail: variables.thumbnail,
              videoUrl: variables.videoUrl,
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
    refetchInterval: (query) => {
      // Stop polling if status is completed or failed
      const data = query.state.data;
      if (data?.status === "completed" || data?.status === "failed") {
        return false;
      }
      // Poll every 10 seconds for pending, downloaded, and transcribing videos
      return 10000;
    },
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
export const useCredits = (limit = 20) => {
  return useInfiniteQuery({
    queryKey: ["credits", limit],
    queryFn: ({ pageParam }: { pageParam?: string }) => getCredits(limit, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.pagination.nextCursor ?? undefined,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });
};

import {
  redeemPromoCode,
  claimGithubCredits,
  getReferralInfo,
} from "./authApi";

export const useRedeemPromoCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => redeemPromoCode(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credits"] });
    },
  });
};

export const useClaimGithubCredits = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ action, repo }: { action: "star" | "fork"; repo: "web" | "api" }) =>
      claimGithubCredits(action, repo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credits"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};

export const useReferralInfo = () => {
  return useQuery({
    queryKey: ["referral"],
    queryFn: () => getReferralInfo(),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
};
