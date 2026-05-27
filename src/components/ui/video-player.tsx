'use client';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
    Vimeo: any;
  }
}

// Module-level singletons — script loaded once per page session
let ytApiPromise: Promise<void> | null = null;
let vimeoApiPromise: Promise<void> | null = null;

function ensureYouTubeAPI(): Promise<void> {
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise<void>((resolve) => {
    if (window.YT?.Player) { resolve(); return; }
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { prev?.(); resolve(); };
    if (!document.getElementById('yt-iframe-api')) {
      const s = document.createElement('script');
      s.id = 'yt-iframe-api';
      s.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(s);
    }
  });
  return ytApiPromise;
}

function ensureVimeoAPI(): Promise<void> {
  if (vimeoApiPromise) return vimeoApiPromise;
  vimeoApiPromise = new Promise<void>((resolve) => {
    if (window.Vimeo?.Player) { resolve(); return; }
    const s = document.createElement('script');
    s.src = 'https://player.vimeo.com/api/player.js';
    s.onload = () => resolve();
    document.head.appendChild(s);
  });
  return vimeoApiPromise;
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function extractVimeoId(url: string): string | null {
  return url.match(/vimeo\.com\/(\d+)/)?.[1] ?? null;
}

export interface VideoPlayerHandle {
  seekTo: (seconds: number) => void;
}

interface VideoPlayerProps {
  url: string;
}

export const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  function VideoPlayer({ url }, ref) {
    const ytPlayer = useRef<any>(null);
    const vimeoPlayer = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const vimeoIframeRef = useRef<HTMLIFrameElement>(null);

    const ytId = extractYouTubeId(url);
    const vimeoId = extractVimeoId(url);
    const platform = ytId ? 'youtube' : vimeoId ? 'vimeo' : 'other';

    useImperativeHandle(ref, () => ({
      seekTo(seconds: number) {
        if (platform === 'youtube' && ytPlayer.current) {
          ytPlayer.current.seekTo(seconds, true);
          ytPlayer.current.playVideo();
        } else if (platform === 'vimeo' && vimeoPlayer.current) {
          vimeoPlayer.current.setCurrentTime(seconds).then(() => {
            vimeoPlayer.current?.play();
          }).catch(() => {});
        }
      },
    }), [platform]);

    useEffect(() => {
      if (platform === 'youtube' && containerRef.current && ytId) {
        ensureYouTubeAPI().then(() => {
          if (ytPlayer.current || !containerRef.current) return;
          ytPlayer.current = new window.YT.Player(containerRef.current, {
            videoId: ytId,
            width: '100%',
            height: '100%',
            playerVars: { rel: 0, modestbranding: 1 },
          });
        });
      } else if (platform === 'vimeo' && vimeoIframeRef.current) {
        ensureVimeoAPI().then(() => {
          if (vimeoPlayer.current || !vimeoIframeRef.current) return;
          vimeoPlayer.current = new window.Vimeo.Player(vimeoIframeRef.current);
        });
      }
      return () => {
        ytPlayer.current?.destroy?.();
        ytPlayer.current = null;
        vimeoPlayer.current?.destroy?.();
        vimeoPlayer.current = null;
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [platform, ytId, vimeoId]);

    const wrapperCls = 'aspect-video w-full rounded-[8px] overflow-hidden bg-zinc-900';

    if (platform === 'youtube') {
      return (
        <div className={wrapperCls}>
          <div ref={containerRef} className="w-full h-full" />
        </div>
      );
    }

    if (platform === 'vimeo') {
      return (
        <div className={wrapperCls}>
          <iframe
            ref={vimeoIframeRef}
            src={`https://player.vimeo.com/video/${vimeoId}?api=1`}
            className="w-full h-full border-0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title="Video player"
          />
        </div>
      );
    }

    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="aspect-video w-full rounded-[8px] flex items-center justify-center border border-[var(--rule)] text-sm text-[var(--ink-2)] hover:text-[var(--ink-1)] transition-colors"
      >
        Open video →
      </a>
    );
  }
);
