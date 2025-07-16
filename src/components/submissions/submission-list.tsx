import React, { useState, useMemo } from "react";
import { SubmissionCard, SubmissionCardProps, SubmissionStatus } from "./submission-card";
import { Input } from "../ui/input";
import { useVideos } from "../../lib/api/hooks";
import { formatSubmissionDate } from "../../lib/utils/date-formatter";

// Mock de submissões
const mockSubmissions: SubmissionCardProps[] = [
  {
    id: "1",
    title: "How to Build a SaaS Application",
    status: "completed",
    createdAt: "Submitted on May 15, 2023",
    thumbnail: undefined,
  },
  {
    id: "2",
    title: "AI for Beginners - Complete Course",
    status: "transcribing",
    createdAt: "Submitted on May 14, 2023",
    progress: 65,
    thumbnail: undefined,
  },
  {
    id: "3",
    title: "The Future of Web Development",
    status: "completed",
    createdAt: "Submitted on May 10, 2023",
    thumbnail: undefined,
  },
  {
    id: "4",
    title: "React Advanced Patterns",
    status: "failed",
    createdAt: "Submitted on May 8, 2023",
    thumbnail: undefined,
  },
  {
    id: "5",
    title: "Next.js 13 Full Course",
    status: "completed",
    createdAt: "Submitted on May 5, 2023",
    thumbnail: undefined,
  },
  {
    id: "6",
    title: "TypeScript Crash Course",
    status: "transcribing",
    createdAt: "Submitted on May 2, 2023",
    progress: 30,
    thumbnail: undefined,
  },
  {
    id: "7",
    title: "Building a Design System",
    status: "completed",
    createdAt: "Submitted on Apr 28, 2023",
    thumbnail: undefined,
  },
  {
    id: "8",
    title: "AI in Product Management",
    status: "failed",
    createdAt: "Submitted on Apr 25, 2023",
    thumbnail: undefined,
  },
  {
    id: "9",
    title: "Modern CSS Techniques",
    status: "completed",
    createdAt: "Submitted on Apr 20, 2023",
    thumbnail: undefined,
  },
  {
    id: "10",
    title: "Serverless with AWS",
    status: "transcribing",
    createdAt: "Submitted on Apr 18, 2023",
    progress: 80,
    thumbnail: undefined,
  },
];

const statusOptions: { label: string; value: SubmissionStatus | "all" }[] = [
  { label: "All Statuses", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Downloaded", value: "downloaded" },
  { label: "Transcribing", value: "transcribing" },
  { label: "Completed", value: "completed" },
  { label: "Failed", value: "failed" },
];

export function SubmissionList() {
  const [status, setStatus] = useState<SubmissionStatus | "all">("all");
  const [search, setSearch] = useState("");

  // TanStack Query hook for fetching videos
  const { data: videosData, isLoading, error } = useVideos();

  const filtered = useMemo(() => {
    if (!videosData?.videos) return [];
    
    return videosData.videos.filter((video: any) => {
      const matchesStatus = status === "all" || video.status === status;
      const matchesSearch = video.title.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [videosData, status, search]);

  return (
    <div>
      {/* Loading state */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-zinc-500">Loading submissions...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="text-center py-8">
          <p className="text-red-500 mb-2">Failed to load submissions</p>
          <p className="text-sm text-zinc-500">Please try again later</p>
        </div>
      )}

      {/* Content */}
      {!isLoading && !error && (
        <>
          {/* Filtro e busca */}
          <div className="mb-4 flex flex-col md:flex-row gap-2 md:gap-4 items-stretch md:items-center">
            <select
              className="border rounded-md px-3 py-2 text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
              value={status}
              onChange={e => setStatus(e.target.value as SubmissionStatus | "all")}
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <Input
              placeholder="Search submissions..."
              className="flex-1"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {/* Lista responsiva */}
          {/* Mobile: horizontal scroll, snap-x; Desktop: grid */}
          <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto md:overflow-x-visible snap-x pb-2">
            {filtered.length === 0 ? (
              <div className="col-span-full w-full text-center text-zinc-500 py-12">No submissions found.</div>
            ) : (
              filtered.map((video: any) => (
                <div key={video.id} className="min-w-[320px] max-w-xs md:min-w-0 md:max-w-none snap-start">
                  <SubmissionCard 
                    id={video.id}
                    title={video.title}
                    status={video.status as SubmissionStatus}
                    thumbnail={video.thumbnail}
                    createdAt={formatSubmissionDate(video.createdAt)}
                    progress={video.progress}
                  />
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
} 