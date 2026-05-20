"use client";
import React from "react";
import { useIntersection } from "../../hooks/use-intersection";
import { cn } from "../../lib/utils";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: 0 | 1 | 2 | 3 | 4 | 5;
  as?: React.ElementType;
}

export function Reveal({ children, className, delay = 0, as: Tag = "div" }: RevealProps) {
  const { ref, visible } = useIntersection<HTMLDivElement>();
  const delayClass = delay > 0 ? `reveal-d${delay}` : "";
  return (
    <Tag ref={ref} className={cn("reveal", visible && "is-visible", delayClass, className)}>
      {children}
    </Tag>
  );
}
