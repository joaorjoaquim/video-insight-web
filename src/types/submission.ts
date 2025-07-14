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
}

export interface Submission {
  id: string;
  title: string;
  status: string;
  thumbnailUrl?: string;
  createdAt: string;
  duration: string;
  platform: string;
  steps: SubmissionStep[];
  summary: Summary;
  transcript: TranscriptBlock[];
  insights: Insights;
} 