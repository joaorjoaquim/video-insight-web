"use client";
import {
  ArrowDownIcon,
  Cancel01Icon,
  CreditCardIcon,
  Github01Icon,
  Logout01Icon,
  Menu01Icon,
  Moon01Icon,
  Sun01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../core/hooks";
import { fetchProfile, logout } from "../../core/slices/authSlice";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";

export default function PrivateHeader() {
  const [theme, setTheme] = useState("light");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Get user data from Redux
  const { user, isAuthenticated } = useAppSelector((state: any) => state.auth);

  // Auto-refetch profile every 5 minutes
  useEffect(() => {
    if (isAuthenticated) {
      // Initial fetch
      dispatch(fetchProfile());

      // Set up interval for refetching every 5 minutes
      const interval = setInterval(() => {
        dispatch(fetchProfile());
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearInterval(interval);
    }
  }, [dispatch, isAuthenticated]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  // Fallback avatar if no avatarUrl
  const getAvatarUrl = () => {
    if (user?.avatarUrl) {
      return user.avatarUrl;
    }
    // Generate a placeholder avatar based on user's name
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user?.name || user?.email || "User"
    )}&background=6366f1&color=fff&size=128`;
  };

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur bg-white/80 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2 md:py-0 h-16">
        {/* Logo + App Name */}
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-bold text-xl text-indigo-700 dark:text-indigo-300"
          >
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
        <nav className="hidden md:flex items-center gap-5 md:gap-10">
          <Link
            href="/dashboard"
            className="text-zinc-700 dark:text-zinc-200 hover:text-indigo-600 font-medium transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/wallet"
            className="flex items-center gap-1 text-zinc-700 dark:text-zinc-200 hover:text-indigo-600 font-medium transition-colors"
          >
            <HugeiconsIcon icon={CreditCardIcon} className="text-lg mr-1" />
            <span>{user?.credits || 0} Credits</span>
          </Link>
          <a
            href="https://github.com/joaorjoaquim/video-insight-web"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-zinc-700 dark:text-zinc-200 hover:text-indigo-600 font-medium transition-colors"
          >
            <HugeiconsIcon icon={Github01Icon} className="text-lg mr-1" />
            GitHub
          </a>
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <HugeiconsIcon icon={Moon01Icon} className="text-xl" />
            ) : (
              <HugeiconsIcon icon={Sun01Icon} className="text-xl" />
            )}
          </Button>
          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg p-1 transition-colors"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <img
                src={getAvatarUrl()}
                alt={user?.name || user?.email || "User"}
                className="w-8 h-8 rounded-full border-2 border-indigo-400"
              />
              <HugeiconsIcon
                icon={ArrowDownIcon}
                className={cn(
                  "text-sm transition-transform",
                  dropdownOpen && "rotate-180"
                )}
              />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 py-1 z-50">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">
                  <div className="flex items-center gap-3">
                    <img
                      src={getAvatarUrl()}
                      alt={user?.name || user?.email || "User"}
                      className="w-10 h-10 rounded-full flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm truncate">
                        {user?.name || "User"}
                      </div>
                      <div className="text-xs text-zinc-500 truncate">
                        {user?.email}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <Link
                    href="/wallet"
                    className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <HugeiconsIcon
                      icon={CreditCardIcon}
                      className="text-lg flex-shrink-0"
                    />
                    <span className="truncate">Wallet</span>
                  </Link>
                  <div className="border-t border-zinc-200 dark:border-zinc-700 my-1"></div>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                    onClick={handleLogout}
                  >
                    <HugeiconsIcon
                      icon={Logout01Icon}
                      className="text-lg flex-shrink-0"
                    />
                    <span className="truncate">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden flex items-center"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
        >
          <HugeiconsIcon
            icon={Menu01Icon}
            className="text-2xl text-zinc-700 dark:text-zinc-200"
          />
        </button>
      </div>
      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50">
          {/* Overlay */}
          <div
            className="absolute inset-0 h-[100dvh] bg-black/60"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Drawer */}
          <div className="absolute top-0 right-0 w-85 max-w-[90vw] h-[100dvh] rounded-l-lg bg-white dark:bg-zinc-950 shadow-lg flex flex-col p-6 gap-4 z-50 animate-slide-in-left">
            <div className="flex flex-row gap-4 items-center justify-between mb-6">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 font-bold text-xl text-indigo-700 dark:text-indigo-300"
                onClick={() => setDrawerOpen(false)}
              >
                <div className="flex items-center space-x-3">
                  <img
                    src="/summary_videos_logo.png"
                    alt="SummaryVideos Logo"
                    className="h-8 w-auto"
                  />
                  <div className="text-black text-2xl font-bold">
                    SummaryVideos
                  </div>
                </div>
              </Link>
              <button
                className=""
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
              >
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  className="text-2xl text-zinc-700 dark:text-zinc-200 rotate-90"
                />
              </button>
            </div>

            <Link
              href="/dashboard"
              className="text-zinc-700 dark:text-zinc-200 hover:text-indigo-600 font-medium transition-colors"
              onClick={() => setDrawerOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/wallet"
              className="flex items-center gap-1 text-zinc-700 dark:text-zinc-200 hover:text-indigo-600 font-medium transition-colors"
              onClick={() => setDrawerOpen(false)}
            >
              <HugeiconsIcon icon={CreditCardIcon} className="text-lg mr-1" />
              <span>{user?.credits || 0} Credits</span>
            </Link>
            <a
              href="https://github.com/joaorjoaquim/video-insight-web"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-zinc-700 dark:text-zinc-200 hover:text-indigo-600 font-medium transition-colors"
            >
              <HugeiconsIcon icon={Github01Icon} className="text-lg mr-1" />
              GitHub
            </a>
            <div className="flex items-center gap-2 mt-4">
              <span className="text-xs text-zinc-500">Theme</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                aria-label="Toggle theme"
              >
                {theme === "light" ? (
                  <HugeiconsIcon icon={Moon01Icon} className="text-xl" />
                ) : (
                  <HugeiconsIcon icon={Sun01Icon} className="text-xl" />
                )}
              </Button>
            </div>

            {/* User Profile Section - Simplified */}
            <div className="flex items-center gap-3 mt-6 border-t pt-4">
              <img
                src={getAvatarUrl()}
                alt={user?.name || user?.email || "User"}
                className="w-8 h-8 rounded-full border-2 border-indigo-400 flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm truncate">
                  {user?.name || "User"}
                </div>
                <div className="text-xs text-zinc-500 truncate">
                  {user?.email}
                </div>
              </div>
            </div>

            {/* Simplified Menu Options */}
            <div className="mt-4 space-y-2">
              <Link
                href="/wallet"
                className="flex items-center gap-2 text-zinc-700 dark:text-zinc-200 hover:text-indigo-600 font-medium transition-colors"
                onClick={() => setDrawerOpen(false)}
              >
                <HugeiconsIcon
                  icon={CreditCardIcon}
                  className="text-lg flex-shrink-0"
                />
                <span className="truncate">Wallet</span>
              </Link>
              <div className="border-t border-zinc-200 dark:border-zinc-700 my-2"></div>
              <button
                className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium transition-colors w-full text-left"
                onClick={handleLogout}
              >
                <HugeiconsIcon
                  icon={Logout01Icon}
                  className="text-lg flex-shrink-0"
                />
                <span className="truncate">Logout</span>
              </button>
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
