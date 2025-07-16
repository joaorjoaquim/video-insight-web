import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlayCircle02Icon } from "@hugeicons/core-free-icons";
import { Button } from "../ui/button";
import Link from "next/link";
import { useVideoStatus } from "../../lib/api/hooks";

export type SubmissionStatus = "pending" | "downloaded" | "transcribing" | "completed" | "failed";

export interface SubmissionCardProps {
  id: string;
  title: string;
  status: SubmissionStatus;
  thumbnail?: string;
  createdAt: string;
  progress?: number; // 0-100, opcional para status processing
}

const statusColors: Record<SubmissionStatus, string> = {
  pending: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
  downloaded: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200",
  transcribing: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  completed: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
  failed: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200",
};

export function SubmissionCard({
  id,
  title,
  status,
  thumbnail,
  createdAt,
  progress,
}: SubmissionCardProps) {
  // Individual polling only for pending, downloaded, and transcribing submissions
  // Don't poll for completed or failed statuses
  const shouldPoll = status === "pending" || status === "downloaded" || status === "transcribing";
  const { data: statusData, isLoading: isPolling } = useVideoStatus(id, shouldPoll);
  
  // Use the latest status from polling if available, otherwise use the prop
  const currentStatus = statusData?.status || status;
  const currentProgress = statusData?.progress || progress;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4 flex flex-col">
      <div className="aspect-video bg-zinc-100 dark:bg-zinc-800 rounded mb-3 flex items-center justify-center overflow-hidden">
        {thumbnail ? (
          <img src={thumbnail} alt={title} className="object-cover w-full h-full" />
        ) : (
          <HugeiconsIcon icon={PlayCircle02Icon} className="text-4xl text-indigo-400" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate" title={title}>{title}</span>
          <div className="ml-auto flex items-center gap-1">
            {isPolling && shouldPoll && (
              <div className="w-3 h-3 border border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            )}
            <span className={`text-xs px-2 py-0.5 rounded ${statusColors[currentStatus as SubmissionStatus]}`}>
              {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
            </span>
          </div>
        </div>
        <div className="text-xs text-zinc-500 mb-2">{createdAt}</div>
        {(currentStatus === "transcribing" || currentStatus === "downloaded") && typeof currentProgress === "number" && (
          <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded mb-2 overflow-hidden">
            <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${currentProgress}%` }} />
          </div>
        )}
        {currentStatus === "completed" ? (
          <Link href={`/submissions/${id}`}>
            <Button variant="outline" size="sm" className="w-full mt-1">View Details</Button>
          </Link>
        ) : (
          <Button variant="outline" size="sm" className="w-full mt-1" disabled>
            Processing...
          </Button>
        )}
      </div>
    </div>
  );
} 