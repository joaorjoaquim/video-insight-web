"use client";
import React, { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Download01Icon,
  Copy01Icon,
  Share01Icon,
  CheckmarkCircle01Icon,
} from "@hugeicons/core-free-icons";

interface ActionButtonsProps {
  showDownload?: boolean;
  showCopy?: boolean;
  showShare?: boolean;
  downloadLabel?: string;
  copyLabel?: string;
  shareLabel?: string;
  onDownload?: () => void;
  onCopy?: () => void;
  onShare?: () => void;
}

export default function ActionButtons({
  showDownload = true,
  showCopy = true,
  showShare = false,
  downloadLabel = "PDF",
  copyLabel = "Copy",
  shareLabel = "Share",
  onDownload,
  onCopy,
  onShare,
}: ActionButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleCopy = async () => {
    onCopy?.();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      onDownload?.();
    } finally {
      setTimeout(() => setDownloading(false), 1200);
    }
  };

  const btnClass =
    "inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium tracking-[0.06em] uppercase border border-[var(--rule)] rounded-[4px] transition-colors";
  const idleClass = "text-[var(--ink-2)] hover:text-[var(--ink-1)] hover:border-[var(--ink-2)]";
  const activeClass = "text-[var(--bars)] border-[var(--bars)]";

  return (
    <div className="flex gap-2">
      {showDownload && (
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className={`${btnClass} ${downloading ? activeClass : idleClass}`}
          style={{ fontFamily: "var(--font-mono-br, monospace)" }}
        >
          <HugeiconsIcon icon={Download01Icon} className="text-sm" />
          {downloading ? "Saving…" : downloadLabel}
        </button>
      )}
      {showCopy && (
        <button
          type="button"
          onClick={handleCopy}
          disabled={copied}
          className={`${btnClass} ${copied ? activeClass : idleClass}`}
          style={{ fontFamily: "var(--font-mono-br, monospace)" }}
        >
          <HugeiconsIcon icon={copied ? CheckmarkCircle01Icon : Copy01Icon} className="text-sm" />
          {copied ? "Copied!" : copyLabel}
        </button>
      )}
      {showShare && (
        <button
          type="button"
          onClick={onShare}
          className={`${btnClass} ${idleClass}`}
          style={{ fontFamily: "var(--font-mono-br, monospace)" }}
        >
          <HugeiconsIcon icon={Share01Icon} className="text-sm" />
          {shareLabel}
        </button>
      )}
    </div>
  );
}
