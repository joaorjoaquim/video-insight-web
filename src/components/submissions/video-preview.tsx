"use client";
import React from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlayCircle02Icon, Xls01Icon } from "@hugeicons/core-free-icons";
import { VideoMetadata } from "../../lib/utils/video-metadata";

const platformIcons: Record<string, React.ReactNode> = {
  youtube: <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24"><path fill="currentColor" d="M21.8 8.001a2.75 2.75 0 0 0-1.94-1.946C18.1 5.5 12 5.5 12 5.5s-6.1 0-7.86.555A2.75 2.75 0 0 0 2.2 8.001 28.6 28.6 0 0 0 1.5 12a28.6 28.6 0 0 0 .7 3.999 2.75 2.75 0 0 0 1.94 1.946C5.9 18.5 12 18.5 12 18.5s6.1 0 7.86-.555a2.75 2.75 0 0 0 1.94-1.946A28.6 28.6 0 0 0 22.5 12a28.6 28.6 0 0 0-.7-3.999zM10 15.5v-7l6 3.5-6 3.5z"/></svg>,
  vimeo: <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24"><path fill="currentColor" d="M22.23 7.82c-.09 2-1.48 4.74-4.18 8.13-2.79 3.53-5.14 5.3-7.06 5.3-1.19 0-2.2-1.1-3.02-3.29-.55-2.01-1.1-4.02-1.65-6.03-.61-2.21-1.26-3.32-1.95-3.32-.15 0-.67.31-1.56.93l-.94-1.21c.98-.86 1.94-1.72 2.91-2.58 1.31-1.13 2.29-1.73 2.95-1.8 1.55-.16 2.5.91 2.85 3.21.39 2.56.66 4.15.8 4.77.45 2.04.95 3.06 1.5 3.06.42 0 1.05-.67 1.89-2.01.84-1.34 1.29-2.36 1.36-3.07.12-1.16-.34-1.74-1.36-1.74-.48 0-.98.11-1.5.33 1-3.29 2.91-4.88 5.74-4.77 2.09.07 3.07 1.42 2.94 4.05z"/></svg>,
  twitter: <svg className="w-5 h-5 text-sky-500" viewBox="0 0 24 24"><path fill="currentColor" d="M22.46 6c-.77.35-1.6.59-2.47.7a4.3 4.3 0 0 0 1.88-2.37 8.59 8.59 0 0 1-2.72 1.04A4.28 4.28 0 0 0 16.11 4c-2.37 0-4.29 1.92-4.29 4.29 0 .34.04.67.11.99C7.69 9.13 4.07 7.38 1.64 4.7c-.37.64-.58 1.39-.58 2.19 0 1.51.77 2.84 1.95 3.62-.72-.02-1.4-.22-1.99-.55v.06c0 2.11 1.5 3.87 3.5 4.27-.36.1-.74.16-1.13.16-.28 0-.54-.03-.8-.08.54 1.68 2.11 2.9 3.97 2.93A8.6 8.6 0 0 1 2 19.54c-.32 0-.63-.02-.94-.06A12.13 12.13 0 0 0 8.29 21.5c7.55 0 11.68-6.26 11.68-11.68 0-.18-.01-.36-.02-.54A8.18 8.18 0 0 0 22.46 6z"/></svg>,
  instagram: <svg className="w-5 h-5 text-pink-500" viewBox="0 0 24 24"><path fill="currentColor" d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5zm4.25 2.25a6.25 6.25 0 1 1-6.25 6.25 6.25 6.25 0 0 1 6.25-6.25zm0 1.5a4.75 4.75 0 1 0 4.75 4.75A4.75 4.75 0 0 0 12 5.25zm6.25 1.25a1.25 1.25 0 1 1-1.25 1.25A1.25 1.25 0 0 1 18.25 6.5z"/></svg>,
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
  error
}: VideoPreviewProps) {
  return (
    <Card className="mt-1 py-0 border-none shadow-none">
      <CardContent className="p-0 border-none">
        <div className="flex gap-4">
          {/* Thumbnail */}
          <div className="flex-shrink-0">
            <div className="w-32 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden flex items-center justify-center">
              {metadata.thumbnail ? (
                <img 
                  src={metadata.thumbnail} 
                  alt={metadata.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/summary_videos_logo.png';
                  }}
                />
              ) : (
                <HugeiconsIcon icon={PlayCircle02Icon} className="text-4xl text-indigo-400" />
              )}
              {metadata.duration && (
                <span className="absolute top-2 right-2 bg-black/80 text-white text-xs px-2 py-0.5 rounded">
                  {metadata.duration}
                </span>
              )}
            </div>
          </div>
          
          {/* Metadata */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-zinc-900 dark:text-zinc-100 text-sm text-start line-clamp-2">
                  {metadata.title}
                </h3>
            </div>
            
            <div className="flex items-center justify-start gap-2 text-xs text-zinc-500 text-start space-y-1">
            {platformIcons[metadata.platform]}
              {metadata.channel && <div>{metadata.channel}</div>}
              {metadata.author && <div>{metadata.author}</div>}
            </div>
            {error && (
              <div className="max-w-full truncate mt-2 text-xs text-orange-600 bg-orange-50 rounded p-2 border border-orange-200">
                {error}
              </div>
            )}
          </div>
        </div>
            <div className="mt-3 flex flex-col md:flex-row items-center justify-between gap-2">
              <Button 
                onClick={onProcess}
                disabled={isProcessing}
                className="w-full md:max-w-[49%] bg-orange-400 hover:bg-orange-500"
              >
                <HugeiconsIcon icon={PlayCircle02Icon} className="text-base mr-2" />
                {isProcessing ? 'Processing...' : 'Process Video'}
              </Button>
              <Button 
                onClick={onRemove}
                variant="outline"
                className="w-full md:max-w-[49%]"
              >
                Cancel
              </Button>
            </div>
      </CardContent>
    </Card>
  );
} 