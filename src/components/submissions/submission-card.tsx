import React from "react";
import Link from "next/link";
import { useVideoStatus } from "../../lib/api/hooks";
import { useT } from "../../lib/i18n";

export type SubmissionStatus =
  | "pending"
  | "downloaded"
  | "transcribing"
  | "completed"
  | "failed";

export interface SubmissionCardProps {
  id: string;
  title: string;
  status: SubmissionStatus;
  thumbnail?: string;
  createdAt: string;
  progress?: number;
}

export function SubmissionCard({ id, title, status, thumbnail, createdAt, progress }: SubmissionCardProps) {
  const t = useT();
  const shouldPoll = status === "pending" || status === "downloaded" || status === "transcribing";
  const { data: statusData, isLoading: isPolling } = useVideoStatus(id, shouldPoll);

  const currentStatus = (statusData?.status || status) as SubmissionStatus;
  const currentProgress = statusData?.progress ?? progress;

  const isCompleted = currentStatus === "completed";
  const isFailed = currentStatus === "failed";
  const inFlight = !isCompleted && !isFailed;

  return (
    <div className="card-wrap h-full">
      <div className={`card-tab ${currentStatus}`} />
      <div
        className="bg-white dark:bg-zinc-900 border border-[var(--rule)] rounded-[10px] p-5 pl-6 flex flex-col h-full"
        style={{ fontFamily: "var(--font-sans-br, system-ui, sans-serif)" }}
      >
        {/* Top meta row */}
        <div className="flex items-center justify-between mb-3">
          <div className="br-eyebrow">{createdAt}</div>
          {isPolling && shouldPoll && (
            <div className="bars-loader scale-[0.7] origin-right"><i/><i/><i/><i/></div>
          )}
        </div>

        {/* Thumbnail */}
        {thumbnail && (
          <div className="aspect-video bg-zinc-100 dark:bg-zinc-800 rounded-[6px] mb-3 overflow-hidden">
            <img src={thumbnail} alt={title} className="object-cover w-full h-full" />
          </div>
        )}

        {/* Title */}
        <div
          style={{ fontFamily: "var(--font-display-br, Georgia, serif)", fontSize: "1.15rem", lineHeight: 1.2, letterSpacing: "-0.01em" }}
          className="text-[var(--ink-1)] mb-3 flex-1"
        >
          {title}
        </div>

        {/* Progress bar for in-flight */}
        {inFlight && typeof currentProgress === "number" && (
          <div className="mb-3">
            <div className="progress-rule">
              <i style={{ width: `${currentProgress}%` }} />
            </div>
            <div className="br-eyebrow mt-1.5">{currentProgress}%</div>
          </div>
        )}

        {/* Footer row */}
        <div className="mt-auto pt-3 border-t border-[var(--rule)]">
          <div className="flex items-center justify-between">
            <span className={`led ${currentStatus}`}>{currentStatus}</span>
            {isCompleted && (
              <Link href={`/submissions/${id}`}>
                <button className="br-eyebrow border border-[var(--ink-1)] dark:border-zinc-600 px-3 py-1.5 rounded-[4px] hover:bg-[var(--ink-1)] hover:text-[var(--briefing-bg)] transition-colors">
                  {t("card.view")}
                </button>
              </Link>
            )}
          </div>
          {isFailed && (
            <p className="br-eyebrow text-[var(--led-failed)] mt-1.5">{t("card.creditsRefunded")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
