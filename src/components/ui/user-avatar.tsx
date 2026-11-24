"use client";
import { useEffect, useState } from "react";
import { cn } from "../../lib/utils";

interface UserAvatarProps {
  name?: string;
  email?: string;
  src?: string;
  size: 28 | 32;
}

function initialsOf(name?: string, email?: string): string {
  const source = (name || "").trim() || (email || "").split("@")[0].trim();
  const words = source.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  const first = Array.from(words[0])[0];
  const last = words.length > 1 ? Array.from(words[words.length - 1])[0] : "";
  return (first + last).toUpperCase();
}

export function UserAvatar({ name, email, src, size }: UserAvatarProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const box = cn("rounded-full shrink-0", size === 28 ? "w-7 h-7" : "w-8 h-8");

  if (src && !failed) {
    return (
      <img
        src={src}
        alt=""
        referrerPolicy="no-referrer"
        width={size}
        height={size}
        onError={() => setFailed(true)}
        className={cn(box, "object-cover border border-[var(--rule)]")}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        box,
        "inline-flex items-center justify-center bg-[var(--ink-1)] text-[var(--briefing-bg)] dark:bg-[var(--rule-soft)] dark:text-[var(--ink-1)] dark:border dark:border-[var(--rule-strong)] font-[family-name:var(--font-mono-br)] font-medium leading-none",
        size === 28 ? "text-[10px]" : "text-[11px]"
      )}
    >
      {initialsOf(name, email)}
    </span>
  );
}
