export interface SubmissionStep {
  label: string;
  done: boolean;
}

export interface SummaryMetric {
  label: string;
  value: string;
}

export interface Summary {
  text: string;
  metrics: SummaryMetric[];
  topics?: string[];
  warnings?: string[];
}

export interface TranscriptBlock {
  time: string;
  text: string;
}

export interface InsightItem {
  text: string;
  confidence?: number;
  key?: boolean;
  quote?: boolean;
}

export interface InsightSection {
  title: string;
  icon: React.ReactNode;
  items: InsightItem[];
}

export interface Insights {
  chips: Array<{ label: string; variant: "secondary" | "destructive" }>;
  sections: InsightSection[];
  topics?: string[];
  summary?: string;
  warnings?: string[];
  extractedAt?: string;
  processedChunks?: number;
  originalTokenCount?: number;
}

export interface Submission {
  id: string | number;
  videoUrl?: string;
  title: string;
  status: string;
  thumbnail?: string;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt?: string;
  videoId?: string;
  duration: number | string;
  platform?: string;
  downloadUrl?: string;
  transcriptionId?: string;
  transcription?: string;
  summary: Summary;
  transcript?: TranscriptBlock[];
  insights: Insights;
  errorMessage?: string;
} 