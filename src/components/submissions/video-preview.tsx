"use client";
import React from "react";
import { VideoMetadata } from "../../lib/utils/video-metadata";

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  youtube: (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-label="YouTube">
      <path fill="#FF0000" d="M21.8 8a2.75 2.75 0 0 0-1.94-1.946C18.1 5.5 12 5.5 12 5.5s-6.1 0-7.86.554A2.75 2.75 0 0 0 2.2 8 28.6 28.6 0 0 0 1.5 12a28.6 28.6 0 0 0 .7 4 2.75 2.75 0 0 0 1.94 1.946C5.9 18.5 12 18.5 12 18.5s6.1 0 7.86-.554A2.75 2.75 0 0 0 21.8 16a28.6 28.6 0 0 0 .7-4 28.6 28.6 0 0 0-.7-4zM10 15.5v-7l6 3.5-6 3.5z"/>
    </svg>
  ),
  vimeo: (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-label="Vimeo">
      <path fill="#1AB7EA" d="M22.23 7.82c-.09 2-1.48 4.74-4.18 8.13-2.79 3.53-5.14 5.3-7.06 5.3-1.19 0-2.2-1.1-3.02-3.29-.55-2.01-1.1-4.02-1.65-6.03-.61-2.21-1.26-3.32-1.95-3.32-.15 0-.67.31-1.56.93l-.94-1.21c.98-.86 1.94-1.72 2.91-2.58 1.31-1.13 2.29-1.73 2.95-1.8 1.55-.16 2.5.91 2.85 3.21.39 2.56.66 4.15.8 4.77.45 2.04.95 3.06 1.5 3.06.42 0 1.05-.67 1.89-2.01.84-1.34 1.29-2.36 1.36-3.07.12-1.16-.34-1.74-1.36-1.74-.48 0-.98.11-1.5.33 1-3.29 2.91-4.88 5.74-4.77 2.09.07 3.07 1.42 2.94 4.05z"/>
    </svg>
  ),
  twitter: (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-label="Twitter/X">
      <path fill="#1DA1F2" d="M22.46 6c-.77.35-1.6.59-2.47.7a4.3 4.3 0 0 0 1.88-2.37 8.59 8.59 0 0 1-2.72 1.04A4.28 4.28 0 0 0 16.11 4c-2.37 0-4.29 1.92-4.29 4.29 0 .34.04.67.11.99C7.69 9.13 4.07 7.38 1.64 4.7c-.37.64-.58 1.39-.58 2.19 0 1.51.77 2.84 1.95 3.62-.72-.02-1.4-.22-1.99-.55v.06c0 2.11 1.5 3.87 3.5 4.27-.36.1-.74.16-1.13.16-.28 0-.54-.03-.8-.08.54 1.68 2.11 2.9 3.97 2.93A8.6 8.6 0 0 1 2 19.54c-.32 0-.63-.02-.94-.06A12.13 12.13 0 0 0 8.29 21.5c7.55 0 11.68-6.26 11.68-11.68l-.02-.54A8.18 8.18 0 0 0 22.46 6z"/>
    </svg>
  ),
};

interface VideoPreviewProps {
  metadata: VideoMetadata;
  onRemove: () => void;
  onProcess: () => void;
  isProcessing?: boolean;
  error?: string | null;
}

export default function VideoPreview({
  metadata,
  onRemove,
  onProcess,
  isProcessing = false,
  error,
}: VideoPreviewProps) {
  return (
    <div
      className="border border-[var(--rule)] rounded-[8px] p-4 bg-[var(--briefing-bg)] dark:bg-zinc-900"
      style={{ fontFamily: "var(--font-sans-br, system-ui, sans-serif)" }}
    >
      <div className="flex gap-4">
        {/* Thumbnail */}
        <div className="flex-shrink-0 w-28 h-[72px] bg-[var(--rule-soft)] rounded-[6px] overflow-hidden">
          {metadata.thumbnail ? (
            <img
              src={metadata.thumbnail}
              alt={metadata.title}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = "/summary_videos_logo.png"; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="logo-bars"><i/><i/><i/></span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p
            className="text-[var(--ink-1)] text-sm font-medium leading-snug line-clamp-2 mb-1.5"
            style={{ fontFamily: "var(--font-display-br, Georgia, serif)" }}
          >
            {metadata.title}
          </p>
          <div className="flex items-center gap-2 text-[var(--ink-3)]">
            {PLATFORM_ICONS[metadata.platform] ?? null}
            {(metadata.channel || metadata.author) && (
              <span className="br-eyebrow truncate">{metadata.channel || metadata.author}</span>
            )}
          </div>
          {error && (
            <p className="br-eyebrow text-[var(--play-700)] mt-2">{error}</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-[var(--rule)]">
        <button
          type="button"
          onClick={onProcess}
          disabled={isProcessing}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-[var(--play)] hover:bg-[var(--play-700)] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-[6px] transition-colors"
        >
          {isProcessing ? (
            <span className="bars-loader scale-75 origin-center"><i/><i/><i/><i/></span>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <circle cx="7" cy="7" r="6.25" stroke="currentColor" strokeWidth="1.25"/>
                <path d="M5.5 4.5l4 2.5-4 2.5V4.5z" fill="currentColor"/>
              </svg>
              Process Video
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="px-4 py-2.5 text-sm text-[var(--ink-2)] border border-[var(--rule)] hover:border-[var(--ink-2)] hover:text-[var(--ink-1)] rounded-[6px] transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
