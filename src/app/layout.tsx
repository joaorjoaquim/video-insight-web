import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthDialog } from '../components/AuthDialog';
import { GlobalProvider } from "@/core/providers/GlobalProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VideoInsight - Transform Your Videos Into Insights",
  description: "Upload your videos and get instant AI-powered analysis, summaries, and actionable insights to enhance your content strategy.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <GlobalProvider>
          {children}
          <AuthDialog />
        </GlobalProvider>
      </body>
    </html>
  );
}
