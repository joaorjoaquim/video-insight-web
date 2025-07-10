import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GlobalProvider } from "../core/providers/GlobalProvider";
import { AuthDialog } from '../components/AuthDialog';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SummaryVideos - Transform Your Videos Into Insights",
  description: "Upload your videos and get AI-powered insights, summaries, and analytics to enhance your content creation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GlobalProvider>
          {children}
          <AuthDialog />
        </GlobalProvider>
      </body>
    </html>
  );
}
