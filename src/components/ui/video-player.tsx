'use client';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { SyntheticEvent } from 'react';
import { PlayIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useT } from '../../lib/i18n';
import { youtubeThumbnail } from '../../lib/utils/video-metadata';

// The player is a plain youtube-nocookie.com iframe: nothing from YouTube loads until the user asks for the
// video, and the page itself never loads a YouTube script. It is driven with the message protocol YouTube's own
// IFrame API speaks. That protocol is not a documented interface, so "ready" is the player's first answer and
// no answer within FAILURE_TIMEOUT_MS is a failure the user can retry or leave through a link.
const PLAYER_ORIGIN = 'https://www.youtube-nocookie.com';
const FAILURE_TIMEOUT_MS = 12000;
const HANDSHAKE_INTERVAL_MS = 250;

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m && /^[A-Za-z0-9_-]{11}$/.test(m[1])) return m[1];
  }
  return null;
}

export interface VideoPlayerHandle {
  seekTo: (seconds: number) => void;
}

interface VideoPlayerProps {
  url: string;
  title?: string;
}

export const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  function VideoPlayer({ url, title }, ref) {
    const t = useT();
    const id = extractYouTubeId(url);

    const [active, setActive] = useState(false);
    const [start, setStart] = useState(0);
    const [attempt, setAttempt] = useState(0);
    const [ready, setReady] = useState(false);
    const [failed, setFailed] = useState(false);

    const iframeRef = useRef<HTMLIFrameElement>(null);
    const retryRef = useRef<HTMLButtonElement>(null);
    const readyRef = useRef(false);
    const focusIframeRef = useRef(false);
    const focusRetryRef = useRef(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const stopTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
    };
    const stopPolling = () => {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
    };
    const post = (message: object) => {
      iframeRef.current?.contentWindow?.postMessage(JSON.stringify(message), PLAYER_ORIGIN);
    };
    const mount = (seconds: number) => {
      readyRef.current = false;
      setReady(false);
      setFailed(false);
      setStart(seconds);
      setActive(true);
      setAttempt((n) => n + 1);
    };

    useImperativeHandle(ref, () => ({
      seekTo(seconds: number) {
        if (!id || !Number.isFinite(seconds)) return;
        if (readyRef.current && iframeRef.current) {
          post({ event: 'command', func: 'seekTo', args: [seconds, true] });
          post({ event: 'command', func: 'playVideo', args: [] });
          return;
        }
        mount(seconds);
      },
    }), [id]);

    useEffect(() => {
      if (!active) return;
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        stopPolling();
        focusRetryRef.current = document.activeElement === iframeRef.current;
        setFailed(true);
      }, FAILURE_TIMEOUT_MS);
      if (focusIframeRef.current) {
        focusIframeRef.current = false;
        iframeRef.current?.focus();
      }
      return () => {
        stopTimer();
        stopPolling();
      };
    }, [active, attempt]);

    useEffect(() => {
      const onMessage = (event: MessageEvent) => {
        if (typeof event.data !== 'string' || event.origin !== PLAYER_ORIGIN) return;
        if (!iframeRef.current || event.source !== iframeRef.current.contentWindow) return;
        if (!timerRef.current) return;
        try {
          JSON.parse(event.data);
        } catch {
          return;
        }
        readyRef.current = true;
        stopTimer();
        stopPolling();
        setReady(true);
      };
      window.addEventListener('message', onMessage);
      return () => window.removeEventListener('message', onMessage);
    }, []);

    useEffect(() => {
      if (failed && focusRetryRef.current) {
        focusRetryRef.current = false;
        retryRef.current?.focus();
      }
    }, [failed]);

    // `load` also fires for a failed navigation, so it only starts the handshake; the first answer means ready.
    const handleLoad = (event: SyntheticEvent<HTMLIFrameElement>) => {
      if (event.currentTarget !== iframeRef.current || readyRef.current) return;
      stopPolling();
      const listen = () => post({ event: 'listening', id: 1, channel: 'widget' });
      listen();
      pollRef.current = setInterval(listen, HANDSHAKE_INTERVAL_MS);
    };

    if (!id) {
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="aspect-video w-full rounded-[8px] flex items-center justify-center border border-[var(--rule)] text-sm text-[var(--ink-2)] hover:text-[var(--ink-1)] transition-colors"
        >
          {t('player.openVideo')} →
        </a>
      );
    }

    const loading = active && !ready && !failed;
    const actionClass =
      'text-white text-sm underline min-h-11 inline-flex items-center px-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2';

    return (
      <div className="relative aspect-video w-full rounded-[8px] overflow-hidden bg-black">
        <span role="status" className="sr-only">{loading ? t('player.loading') : ''}</span>

        {!active && (
          <button
            type="button"
            onClick={() => {
              focusIframeRef.current = true;
              mount(0);
            }}
            aria-label={title ? `${t('player.play')} ${title}` : t('player.play')}
            className="group absolute inset-0 flex items-center justify-center focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-white focus-visible:outline-offset-[-6px]"
          >
            <img
              src={youtubeThumbnail(id)}
              alt=""
              referrerPolicy="no-referrer"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <span className="absolute inset-0 bg-black/50 transition-colors duration-200 group-hover:bg-black/40" />
            <span className="relative flex h-14 w-14 items-center justify-center rounded-full border border-transparent bg-[var(--play)] text-[var(--on-play)]">
              <HugeiconsIcon icon={PlayIcon} size={24} strokeWidth={2} aria-hidden="true" />
            </span>
          </button>
        )}

        {active && !failed && (
          <>
            <iframe
              key={attempt}
              ref={iframeRef}
              src={`${PLAYER_ORIGIN}/embed/${id}?enablejsapi=1&autoplay=1&playsinline=1&rel=0&start=${Math.floor(start)}&origin=${encodeURIComponent(window.location.origin)}`}
              title={title ?? t('player.play')}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen; clipboard-write; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              onLoad={handleLoad}
              className="absolute inset-0 h-full w-full border-0"
            />
            {!ready && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black">
                <span className="bars-loader [&_i]:bg-white!"><i /><i /><i /><i /></span>
              </div>
            )}
          </>
        )}

        {active && failed && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-4 text-center">
            <p role="alert" className="text-white text-sm">{t('player.error')}</p>
            <div className="flex flex-wrap items-center justify-center">
              <button
                ref={retryRef}
                type="button"
                onClick={() => {
                  focusIframeRef.current = true;
                  mount(start);
                }}
                className={actionClass}
              >
                {t('player.retry')}
              </button>
              <a href={url} target="_blank" rel="noopener noreferrer" className={actionClass}>
                {t('player.openYoutube')}
              </a>
            </div>
          </div>
        )}
      </div>
    );
  }
);
