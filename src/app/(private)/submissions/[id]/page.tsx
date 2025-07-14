"use client";
import React, { useState } from "react";
import Link from "next/link";
import PrivateHeader from "../../../../components/layout/private-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../../components/ui/tabs";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlayCircle02Icon, CheckmarkCircle01Icon, Download01Icon, Copy01Icon, Share01Icon } from "@hugeicons/core-free-icons";
import InsightsList from "../../../../components/insights/insights-list";
import MindMap from "../../../../components/insights/mind-map";
import SubmissionHeader from "../../../../components/submissions/submission-header";
import SummaryMetrics from "../../../../components/submissions/summary-metrics";
import TranscriptView from "../../../../components/submissions/transcript-view";
import ActionButtons from "../../../../components/ui/action-buttons";
import ViewToggle from "../../../../components/ui/view-toggle";
import Breadcrumb from "../../../../components/ui/breadcrumb";
import { Submission } from "../../../../types/submission";

const mockSubmission: Submission = {
  id: "1",
  title: "How to Build a SaaS Application",
  status: "completed",
  thumbnailUrl: undefined,
  createdAt: "Processed on May 15, 2023",
  duration: "12:45",
  platform: "YouTube",
  steps: [
    { label: "Downloaded", done: true },
    { label: "Transcribed", done: true },
    { label: "Processed", done: true },
    { label: "Complete", done: true },
  ],
  summary: {
    text: `This video provides a comprehensive guide to building a SaaS (Software as a Service) application from scratch. The presenter covers everything from initial planning and architecture to deployment and scaling.\n\nKey areas covered include choosing the right tech stack for different types of SaaS applications, implementing authentication and authorization systems, setting up payment processing with Stripe, and designing database schemas that can scale with your business.\n\nThe presenter emphasizes the importance of starting with a minimum viable product (MVP) and iterating based on user feedback. They demonstrate how to set up a continuous integration and deployment pipeline to streamline the development process.`,
    metrics: [
      { label: "Duration", value: "12:45" },
      { label: "Main Topics", value: "5" },
      { label: "Key Insights", value: "12" },
      { label: "Complexity", value: "Intermediate" },
    ],
  },
  transcript: [
    { time: "00:00", text: "Welcome to the SaaS Application course." },
    { time: "01:15", text: "Let's start with planning and architecture." },
    { time: "03:30", text: "Choosing the right tech stack is crucial." },
    { time: "05:00", text: "Implementing authentication and authorization." },
    { time: "08:20", text: "Setting up payment processing with Stripe." },
    { time: "10:00", text: "Designing scalable database schemas." },
    { time: "12:00", text: "Continuous integration and deployment." },
  ],
  insights: {
    chips: [
      { label: "15 insights extracted", variant: "secondary" as const },
      { label: "5 main topics", variant: "secondary" as const },
      { label: "3 key takeaways", variant: "destructive" as const },
      { label: "87% confidence", variant: "secondary" as const },
    ],
    sections: [
      {
        title: "Tech Stack Selection",
        icon: <span className="text-purple-400">{String.fromCodePoint(0x1F4BB)}</span>,
        items: [
          { text: "Frontend frameworks like React, Vue, or Angular are ideal for SaaS UIs", confidence: 95, key: false, quote: false },
          { text: "Node.js and Express are recommended for backend API development", confidence: 92, key: false, quote: false },
          { text: "Choose your tech stack based on team expertise rather than trends", key: true, confidence: undefined, quote: false },
        ],
      },
      {
        title: "Authentication & Authorization",
        icon: <span className="text-purple-400">{String.fromCodePoint(0x1F512)}</span>,
        items: [
          { text: "OAuth 2.0 is recommended for secure third-party authentication", confidence: 88, key: false, quote: false },
          { text: "JWT tokens provide stateless authentication for scalable applications", confidence: 90, key: false, quote: false },
          { text: '"Always implement role-based access control from day one"', quote: true, key: false, confidence: undefined },
        ],
      },
      {
        title: "Payment Processing",
        icon: <span className="text-purple-400">{String.fromCodePoint(0x1F4B3)}</span>,
        items: [
          { text: "Stripe is recommended for subscription management and payment processing", confidence: 94, key: false, quote: false },
          { text: "Implement usage-based billing for better customer value alignment", key: true, confidence: undefined, quote: false },
        ],
      },
      {
        title: "Database Design",
        icon: <span className="text-purple-400">{String.fromCodePoint(0x1F4C8)}</span>,
        items: [
          { text: "Multi-tenant architecture with database isolation improves security", confidence: 89, key: false, quote: false },
          { text: "Consider NoSQL for flexibility or SQL for complex relationships", confidence: 85, key: false, quote: false },
        ],
      },
      {
        title: "Deployment & Scaling",
        icon: <span className="text-purple-400">{String.fromCodePoint(0x1F680)}</span>,
        items: [
          { text: "CI/CD pipelines are essential for reliable deployments", confidence: 91, key: false, quote: false },
          { text: "Containerization with Docker simplifies environment consistency", confidence: 87, key: false, quote: false },
          { text: "Start with an MVP and iterate based on user feedback", key: true, confidence: undefined, quote: false },
        ],
      },
    ],
  },
};

const mindMapImg = "/mindmap-example.png"; // Use a local asset ou placeholder

export default function SubmissionDetailPage() {
  const [tab, setTab] = useState("summary");
  const [insightView, setInsightView] = useState<"list" | "mindmap">("list");
  const s = mockSubmission;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f6fc] to-white dark:from-zinc-950 dark:to-zinc-900">
      <PrivateHeader />
      <main className="max-w-4xl mx-auto px-4 pt-8 pb-16">
        <Breadcrumb
          items={[
            { label: "Back to Dashboard", href: "/dashboard" },
            { label: s.title },
          ]}
        />
        
        {/* Header Section */}
        <SubmissionHeader
          title={s.title}
          status={s.status}
          duration={s.duration}
          createdAt={s.createdAt}
          platform={s.platform}
          steps={s.steps}
        />

        {/* Tabs Section */}
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-3">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="transcript">Transcript</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Summary</CardTitle>
                  <ActionButtons downloadLabel="Download PDF" />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-zinc-700 dark:text-zinc-200 whitespace-pre-line leading-relaxed">
                  {s.summary.text}
                </div>
                <SummaryMetrics metrics={s.summary.metrics} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="transcript">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Transcript</CardTitle>
                  <ActionButtons />
                </div>
              </CardHeader>
              <CardContent>
                <TranscriptView transcript={s.transcript} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="insights">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap gap-2 items-center justify-between">
                  <ViewToggle
                    currentView={insightView}
                    views={[
                      { value: "list", label: "List View" },
                      { value: "mindmap", label: "Mind Map" },
                    ]}
                    onViewChange={(view) => setInsightView(view as "list" | "mindmap")}
                  />
                  <ActionButtons showShare={true} />
                </div>
              </CardHeader>
              <CardContent>
                {insightView === "list" ? (
                  <InsightsList chips={s.insights.chips} sections={s.insights.sections} />
                ) : (
                  <MindMap data={s.insights} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
} 