"use client";
import React from "react";
import { Button } from "./button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Download01Icon, Copy01Icon, Share01Icon } from "@hugeicons/core-free-icons";

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
  downloadLabel = "Download",
  copyLabel = "Copy",
  shareLabel = "Share",
  onDownload,
  onCopy,
  onShare,
}: ActionButtonsProps) {
  return (
    <div className="flex gap-2">
      {showDownload && (
        <Button variant="outline" size="sm" onClick={onDownload}>
          <HugeiconsIcon icon={Download01Icon} className="text-base mr-1" /> {downloadLabel}
        </Button>
      )}
      {showCopy && (
        <Button variant="outline" size="sm" onClick={onCopy}>
          <HugeiconsIcon icon={Copy01Icon} className="text-base mr-1" /> {copyLabel}
        </Button>
      )}
      {showShare && (
        <Button variant="outline" size="sm" onClick={onShare}>
          <HugeiconsIcon icon={Share01Icon} className="text-base mr-1" /> {shareLabel}
        </Button>
      )}
    </div>
  );
} 