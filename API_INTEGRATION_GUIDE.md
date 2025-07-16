# API Integration Guide - Video Insight Project

## Overview

This project uses **TanStack Query (React Query)** for API integration, providing a robust, type-safe, and performant solution for managing server state with **individual polling** for real-time video processing updates.

**Repository**: [https://github.com/joaorjoaquim/video-insight-web](https://github.com/joaorjoaquim/video-insight-web)  
**API Repository**: [https://github.com/joaorjoaquim/video-insight-api](https://github.com/joaorjoaquim/video-insight-api)  
**Live Demo**: [https://summaryvideos.com/](https://summaryvideos.com/)  
**API Endpoint**: [https://api.summaryvideos.com/](https://api.summaryvideos.com/)

## Why TanStack Query?

### ✅ **Perfect for Your Use Case:**

1. **Individual Polling**: Each submission polls its own status independently
2. **Real-time Updates**: Live status updates for video processing
3. **Smart Caching**: Automatic cache invalidation and background updates
4. **Optimistic Updates**: Immediate UI feedback for video submissions
5. **Error Handling**: Sophisticated retry logic and error states
6. **Loading States**: Built-in loading, error, and success states
7. **TypeScript Support**: Excellent type safety throughout
8. **Developer Experience**: Great dev tools and debugging

### 🚀 **Senior-Level Benefits:**

- **Performance**: Automatic background refetching and cache management
- **UX**: Optimistic updates and seamless loading states
- **Maintainability**: Centralized API logic with reusable hooks
- **Scalability**: Easy to add new endpoints and features
- **Testing**: Excellent testing capabilities with query client mocking

## Architecture

### 1. **API Layer** (`src/lib/api/`)

```typescript
// videoInsightApi.ts - Centralized API functions
export const videoInsightApi = {
  submitVideo: async (data: SubmitVideoRequest) => Promise<SubmitVideoResponse>,
  getVideos: async () => Promise<VideosResponse>,
  getVideo: async (id: string) => Promise<VideoResponse>,
  getVideoStatus: async (id: string) => Promise<{ status: string; progress?: number }>,
};
```

### 2. **Query Hooks** (`src/lib/api/hooks.ts`)

```typescript
// Custom hooks for each API operation
export const useSubmitVideo = () => useMutation({ ... });
export const useVideos = () => useQuery({ ... });
export const useVideo = (id: string) => useQuery({ ... });
export const useVideoStatus = (id: string, enabled = true) => useQuery({ ... });
```

### 3. **Provider Setup** (`src/core/providers/QueryProvider.tsx`)

```typescript
// Global query client configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});
```

## Key Features Implemented

### 1. **Individual Polling for Video Status**

```typescript
// In SubmissionCard component
const shouldPoll = status === "pending" || status === "downloaded" || status === "transcribing";
const { data: statusData, isLoading: isPolling } = useVideoStatus(id, shouldPoll);

// Smart polling with auto-stop
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
```

**Benefits:**
- Each submission polls independently
- Only polls when needed (not completed/failed)
- Visual feedback with spinning indicators
- Automatic cache updates

### 2. **Video Submission with Optimistic Updates**

```typescript
const submitVideoMutation = useSubmitVideo();

const handleProcessVideo = async () => {
  await submitVideoMutation.mutateAsync({
    url: videoMetadata.url,
    title: videoMetadata.title,
    platform: videoMetadata.platform
  });
};
```

**Benefits:**
- Immediate UI feedback
- Automatic cache invalidation
- Error handling with retry logic

### 3. **Submissions List with Real-time Updates**

```typescript
const { data: videosData, isLoading, error } = useVideos();

// Automatic refetching and cache management
// Real-time updates when new submissions are added
```

**Benefits:**
- Automatic background refetching
- Loading and error states
- Real-time updates

## API Endpoints Structure

### Core Endpoints

| Endpoint | Method | Description | Authentication |
|----------|--------|-------------|----------------|
| `/video` | GET | Get all videos | Required |
| `/video` | POST | Submit new video | Required |
| `/video/:id` | GET | Get specific video | Required |
| `/video/:id/status` | GET | Get video status (for polling) | Required |
| `/auth/signup` | POST | User registration | None |
| `/auth/login` | POST | User login | None |
| `/auth/oauth/:provider` | GET | OAuth redirect | None |
| `/user/profile` | GET | Get user profile | Required |
| `/credits` | GET | Get user credits | Required |

### Video Status Types

```typescript
type VideoStatus = "pending" | "downloaded" | "transcribing" | "completed" | "failed";
```

### Response Types

```typescript
interface SubmitVideoResponse {
  id: string;
  status: VideoStatus;
  message?: string;
}

interface VideoStatusResponse {
  status: VideoStatus;
  progress?: number; // 0-100 for processing videos
}

interface VideosResponse {
  videos: Video[];
}

interface VideoResponse {
  id: string;
  title: string;
  status: VideoStatus;
  progress?: number;
  createdAt: string;
  // ... other video properties
}
```

## Usage Examples

### Dashboard Component

```typescript
// src/app/(private)/dashboard/page.tsx
import { useSubmitVideo } from "../../../lib/api/hooks";

export default function DashboardPage() {
  const submitVideoMutation = useSubmitVideo();
  
  const handleProcessVideo = async () => {
    try {
      await submitVideoMutation.mutateAsync({
        url: videoMetadata.url,
        title: videoMetadata.title,
        platform: videoMetadata.platform
      });
      
      // Form automatically resets after successful submission
      setVideoMetadata(null);
      setValue("url", "");
    } catch (error) {
      console.error('Error processing video:', error);
    }
  };
}
```

### Submission Card with Individual Polling

```typescript
// src/components/submissions/submission-card.tsx
export function SubmissionCard({ id, title, status, ... }) {
  // Individual polling only for pending, downloaded, and transcribing submissions
  const shouldPoll = status === "pending" || status === "downloaded" || status === "transcribing";
  const { data: statusData, isLoading: isPolling } = useVideoStatus(id, shouldPoll);
  
  // Use the latest status from polling if available, otherwise use the prop
  const currentStatus = statusData?.status || status;
  const currentProgress = statusData?.progress || progress;

  return (
    <div className="...">
      {/* Visual feedback during polling */}
      {isPolling && shouldPoll && (
        <div className="w-3 h-3 border border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      )}
      <span className={`... ${statusColors[currentStatus]}`}>
        {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
      </span>
      {/* Progress bar for processing videos */}
      {(currentStatus === "transcribing" || currentStatus === "downloaded") && 
       typeof currentProgress === "number" && (
        <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded mb-2 overflow-hidden">
          <div className="h-full bg-indigo-500 transition-all duration-300" 
               style={{ width: `${currentProgress}%` }} />
        </div>
      )}
    </div>
  );
}
```

### Submissions List Component

```typescript
// src/components/submissions/submission-list.tsx
import { useVideos } from "../../lib/api/hooks";

export function SubmissionList() {
  const { data: videosData, isLoading, error } = useVideos();
  
  // Automatic loading states, error handling, and real-time updates
  // Each submission card handles its own polling
}
```

## Best Practices Implemented

### 1. **Type Safety**
- Full TypeScript support
- Proper type definitions for all API responses
- Type-safe query keys

### 2. **Error Handling**
- Sophisticated retry logic
- User-friendly error messages
- Graceful degradation

### 3. **Performance**
- Smart caching strategies
- Background refetching
- Optimistic updates
- Individual polling to reduce server load

### 4. **Developer Experience**
- React Query DevTools for debugging
- Centralized API layer
- Reusable hooks

### 5. **User Experience**
- Real-time status updates
- Visual feedback during polling
- Progress indicators for processing
- Smooth transitions and animations

## Comparison: TanStack Query vs Manual Axios

| Feature | TanStack Query | Manual Axios |
|---------|----------------|---------------|
| **Caching** | ✅ Automatic, smart | ❌ Manual implementation |
| **Loading States** | ✅ Built-in | ❌ Manual state management |
| **Error Handling** | ✅ Sophisticated retry | ❌ Basic try/catch |
| **Individual Polling** | ✅ Built-in with smart intervals | ❌ Manual setInterval per item |
| **Optimistic Updates** | ✅ Easy implementation | ❌ Complex state management |
| **Background Refetching** | ✅ Automatic | ❌ Manual implementation |
| **TypeScript Support** | ✅ Excellent | ⚠️ Basic |
| **Developer Tools** | ✅ React Query DevTools | ❌ None |
| **Testing** | ✅ Easy mocking | ⚠️ Manual mocking |
| **Real-time Updates** | ✅ Individual polling per item | ❌ Complex implementation |

## Individual Polling Benefits

### 1. **Efficient Resource Usage**
- Only polls videos that need updates
- Automatically stops when completed/failed
- Reduces unnecessary API calls

### 2. **Better User Experience**
- Real-time updates for each video
- Visual feedback during polling
- Progress indicators for processing

### 3. **Scalable Architecture**
- Each component manages its own polling
- No global polling that affects all items
- Easy to add/remove polling per item

### 4. **Smart Polling Logic**
```typescript
// Only poll when needed
const shouldPoll = status === "pending" || status === "downloaded" || status === "transcribing";

// Auto-stop when completed
refetchInterval: (query) => {
  const data = query.state.data;
  if (data?.status === "completed" || data?.status === "failed") {
    return false; // Stop polling
  }
  return 10000; // Poll every 10 seconds
}
```

## Next Steps

### 1. **Backend Integration**
- Update API endpoints to match the frontend expectations
- Implement proper error responses
- Add pagination support for large video lists

### 2. **Enhanced Features**
- Add infinite scrolling for submissions
- Implement real-time WebSocket updates
- Add offline support with background sync

### 3. **Testing**
- Add comprehensive unit tests for hooks
- Integration tests for API layer
- E2E tests for critical flows

## Conclusion

This implementation demonstrates **senior-level architecture decisions**:

1. **Separation of Concerns**: API layer, hooks, and components are properly separated
2. **Type Safety**: Full TypeScript implementation with proper types
3. **Performance**: Smart caching and individual polling
4. **User Experience**: Real-time updates and seamless loading states
5. **Maintainability**: Centralized, reusable, and testable code
6. **Scalability**: Easy to extend with new features
7. **Individual Polling**: Efficient resource usage with per-item polling

The choice of **TanStack Query** with **individual polling** provides a production-ready, scalable solution that will impress in a public repository and demonstrate senior-level decision-making.

---

**Author**: João Ricardo Joaquim - [@joaorjoaquim](https://github.com/joaorjoaquim)  
**Repository**: [https://github.com/joaorjoaquim/video-insight-web](https://github.com/joaorjoaquim/video-insight-web)  
**API Repository**: [https://github.com/joaorjoaquim/video-insight-api](https://github.com/joaorjoaquim/video-insight-api)  
**Live Demo**: [https://summaryvideos.com/](https://summaryvideos.com/) 