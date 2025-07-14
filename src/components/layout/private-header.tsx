"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Menu01Icon, Moon01Icon, Sun01Icon, CreditCardIcon, Github01Icon, Logout01Icon, Settings01Icon, User02Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { cn } from "../../lib/utils";

// Mock user data (substitua pelo contexto real)
const user = {
  email: "user@example.com",
  avatarUrl: "https://i.pravatar.cc/150?img=3",
  credits: 27,
};

export default function PrivateHeader() {
  const [theme, setTheme] = useState("light");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    // TODO: Implementar logout real
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur bg-white/80 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2 md:py-0 h-16">
        {/* Logo + App Name */}
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-bold text-xl text-indigo-700 dark:text-indigo-300">
            <div className="flex items-center space-x-3">
            <img 
              src="/summary_videos_logo.png" 
              alt="SummaryVideos Logo" 
              className="h-8 w-auto"
            />
            <div className="text-black text-2xl font-bold">SummaryVideos</div>
          </div>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-4">
          <Link href="/dashboard" className="text-zinc-700 dark:text-zinc-200 hover:text-indigo-600 font-medium transition-colors">Dashboard</Link>
          <Link
            href="/wallet"
            className="flex items-center gap-1 text-zinc-700 dark:text-zinc-200 hover:text-indigo-600 font-medium transition-colors">
            <HugeiconsIcon icon={CreditCardIcon} className="text-lg mr-1" />
            <span>{user.credits} Credits</span>
          </Link>
          <a href="https://github.com/joaorjoaquim/video-insight-web" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-zinc-700 dark:text-zinc-200 hover:text-indigo-600 font-medium transition-colors">
            <HugeiconsIcon icon={Github01Icon} className="text-lg mr-1" />
            GitHub
          </a>
          {/* Theme Toggle */}
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            aria-label="Toggle theme">
            {theme === "light" ? (
              <HugeiconsIcon icon={Moon01Icon} className="text-xl" />
            ) : (
              <HugeiconsIcon icon={Sun01Icon} className="text-xl" />
            )}
          </Button>
          {/* Profile Dropdown */}
          <Dialog>
            <DialogTrigger asChild>
              <button className="ml-2 flex items-center gap-2">
                <img src={user.avatarUrl} alt={user.email} className="w-8 h-8 rounded-full border-2 border-indigo-400" />
              </button>
            </DialogTrigger>
            <DialogContent className="w-64 p-0 overflow-hidden">
              <div className="p-4 border-b">
                <div className="flex items-center gap-3">
                  <img src={user.avatarUrl} alt={user.email} className="w-10 h-10 rounded-full" />
                  <div>
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100">{user.email}</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col">
                <Button variant="ghost" className="justify-start gap-2 w-full">
                  <HugeiconsIcon icon={User02Icon} className="text-lg" /> View Profile
                </Button>
                <Button variant="ghost" className="justify-start gap-2 w-full">
                  <HugeiconsIcon icon={Settings01Icon} className="text-lg" /> Settings
                </Button>
                <Button variant="ghost" className="justify-start gap-2 w-full text-red-600" onClick={handleLogout}>
                  <HugeiconsIcon icon={Logout01Icon} className="text-lg" /> Logout
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </nav>

        {/* Mobile Hamburger */}
        <button className="md:hidden flex items-center" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
          <HugeiconsIcon icon={Menu01Icon} className="text-2xl text-zinc-700 dark:text-zinc-200" />
        </button>
      </div>
      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50">
          {/* Overlay */}
          <div className="absolute inset-0 h-[100dvh] bg-black/60" onClick={() => setDrawerOpen(false)} />
          {/* Drawer */}
          <div className="absolute top-0 right-0 w-85 max-w-[90vw] h-[100dvh] bg-white dark:bg-zinc-950 shadow-lg flex flex-col p-6 gap-4 z-50 animate-slide-in-left">
            <div className="flex flex-row gap-4 items-center justify-between mb-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 font-bold text-xl text-indigo-700 dark:text-indigo-300"
              onClick={() => setDrawerOpen(false)}>
              <div className="flex items-center space-x-3">
            <img 
              src="/summary_videos_logo.png" 
              alt="SummaryVideos Logo" 
              className="h-8 w-auto"
            />
            <div className="text-black text-2xl font-bold">SummaryVideos</div>
          </div>
            </Link>
            <button className="" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
              <HugeiconsIcon icon={Cancel01Icon} className="text-2xl text-zinc-700 dark:text-zinc-200 rotate-90" />
            </button>
            </div>

            <Link href="/dashboard" className="text-zinc-700 dark:text-zinc-200 hover:text-indigo-600 font-medium transition-colors" onClick={() => setDrawerOpen(false)}>Dashboard</Link>
            <Link
              href="/wallet"
              className="flex items-center gap-1 text-zinc-700 dark:text-zinc-200 hover:text-indigo-600 font-medium transition-colors"
              onClick={() => setDrawerOpen(false)}>
              <HugeiconsIcon icon={CreditCardIcon} className="text-lg mr-1" />
              <span>{user.credits} Credits</span>
            </Link>
            <a href="https://github.com/joaorjoaquim/video-insight-web" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-zinc-700 dark:text-zinc-200 hover:text-indigo-600 font-medium transition-colors">
              <HugeiconsIcon icon={Github01Icon} className="text-lg mr-1" />
              GitHub
            </a>
            <div className="flex items-center gap-2 mt-4">
              <span className="text-xs text-zinc-500">Theme</span>
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                aria-label="Toggle theme">
                {theme === "light" ? (
                  <HugeiconsIcon icon={Moon01Icon} className="text-xl" />
                ) : (
                  <HugeiconsIcon icon={Sun01Icon} className="text-xl" />
                )}
              </Button>
            </div>
            <div className="flex items-center gap-3 mt-6 border-t pt-4">
              <img src={user.avatarUrl} alt={user.email} className="w-8 h-8 rounded-full border-2 border-indigo-400" />
              <div>
                <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">{user.email}</div>
                <Button variant="ghost" className="justify-start gap-2 w-full mt-2 text-red-600" onClick={handleLogout}>
                  <HugeiconsIcon icon={Logout01Icon} className="text-lg" /> Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

// Tailwind animation (adicione ao seu globals.css se quiser animar o drawer)
// .animate-slide-in-left { animation: slide-in-left 0.2s cubic-bezier(0.4,0,0.2,1) both; }
// @keyframes slide-in-left { from { transform: translateX(-100%); } to { transform: translateX(0); } } 