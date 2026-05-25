"use client";
import {
  Cancel01Icon,
  Github01Icon,
  Logout01Icon,
  Menu01Icon,
  Moon01Icon,
  Sun01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../core/hooks";
import { logoutUser } from "../../core/slices/authSlice";
import { cn } from "../../lib/utils";
import { useI18n, useT } from "../../lib/i18n";

export default function PrivateHeader() {
  const [theme, setTheme] = useState("light");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { locale, setLocale } = useI18n();
  const t = useT();

  const { user, isAuthenticated } = useAppSelector((state: any) => state.auth);

  // Read persisted theme on mount
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    if (saved === "dark") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    if (next === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    router.push("/");
  };

  const getAvatarUrl = () => {
    if (user?.avatarUrl) return user.avatarUrl;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || user?.email || "User")}&background=7E1DFD&color=fff&size=128`;
  };

  const navLinkClass = (path: string) =>
    cn(
      "font-[var(--font-mono-br,monospace)] text-[11px] font-medium tracking-[0.12em] uppercase transition-colors",
      pathname === path
        ? "text-[var(--play)] border-b-2 border-[var(--play)] pb-[2px]"
        : "text-[var(--ink-2)] hover:text-[var(--ink-1)] dark:text-zinc-400 dark:hover:text-zinc-100"
    );

  return (
    <header className="sticky top-0 z-30 w-full bg-[var(--briefing-bg)] dark:bg-zinc-950 border-b border-[var(--rule)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 h-14">
        {/* Brand */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <img src="/summary_videos_logo.png" alt="SummaryVideos" className="h-7 w-auto" />
          <span
            style={{ fontFamily: "var(--font-display-br, Georgia, serif)" }}
            className="text-[var(--ink-1)] dark:text-zinc-100 text-lg"
          >
            SummaryVideos
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7">
          <Link href="/dashboard" className={navLinkClass("/dashboard")}>
            {t("nav.dashboard")}
          </Link>
          <Link href="/wallet" className={navLinkClass("/wallet")}>
            {t("nav.wallet")}
            <span className="ml-1 text-[var(--ink-3)]">/ {user?.credits ?? 0}</span>
          </Link>
          <a
            href="https://github.com/joaorjoaquim/video-insight-web"
            target="_blank"
            rel="noopener noreferrer"
            className="font-[var(--font-mono-br,monospace)] text-[11px] font-medium tracking-[0.12em] uppercase text-[var(--ink-2)] hover:text-[var(--ink-1)] dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors flex items-center gap-1"
          >
            <HugeiconsIcon icon={Github01Icon} className="text-base" />
            {t("nav.github")}
          </a>

          {/* Language toggle */}
          <button
            onClick={() => setLocale(locale === "en" ? "pt-br" : "en")}
            className="font-[var(--font-mono-br,monospace)] text-[11px] font-medium tracking-[0.12em] uppercase text-[var(--ink-2)] hover:text-[var(--play)] dark:text-zinc-400 dark:hover:text-[var(--play)] transition-colors border border-[var(--rule)] rounded px-1.5 py-0.5"
            aria-label={t("lang.current")}
          >
            {t("lang.current")}
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label={t("nav.toggleTheme")}
            className="text-[var(--ink-2)] hover:text-[var(--ink-1)] dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
          >
            <HugeiconsIcon icon={theme === "light" ? Moon01Icon : Sun01Icon} className="text-base" />
          </button>

          {/* Profile dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <img
                src={getAvatarUrl()}
                alt={user?.name || user?.email || "User"}
                className="w-7 h-7 rounded-full border border-[var(--bars)]"
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-[var(--briefing-bg)] dark:bg-zinc-900 rounded-[10px] border border-[var(--rule)] shadow-lg py-1 z-50">
                <div className="px-4 py-3 border-b border-[var(--rule)]">
                  <div className="text-[var(--ink-1)] dark:text-zinc-100 text-sm font-medium truncate">
                    {user?.name || "User"}
                  </div>
                  <div className="br-eyebrow mt-0.5 truncate">{user?.email}</div>
                </div>
                <div className="py-1">
                  <Link
                    href="/wallet"
                    className="w-full text-left px-4 py-2 text-sm text-[var(--ink-2)] dark:text-zinc-300 hover:text-[var(--ink-1)] dark:hover:text-zinc-100 hover:bg-[var(--rule-soft)] flex items-center gap-2 transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    {t("nav.wallet")}
                  </Link>
                  <div className="border-t border-[var(--rule)] my-1" />
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-[var(--led-failed)] hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                    onClick={handleLogout}
                  >
                    <HugeiconsIcon icon={Logout01Icon} className="text-base flex-shrink-0" />
                    {t("nav.logout")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-[var(--ink-2)] dark:text-zinc-300"
          onClick={() => setDrawerOpen(true)}
          aria-label={t("nav.openMenu")}
        >
          <HugeiconsIcon icon={Menu01Icon} className="text-xl" />
        </button>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDrawerOpen(false)} />
          <div className="absolute top-0 right-0 w-80 max-w-[90vw] h-[100dvh] bg-[var(--briefing-bg)] dark:bg-zinc-950 border-l border-[var(--rule)] flex flex-col p-6 gap-5 z-50 animate-slide-in-right">
            <div className="flex items-center justify-between mb-2">
              <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setDrawerOpen(false)}>
                <img src="/summary_videos_logo.png" alt="SummaryVideos" className="h-6 w-auto" />
                <span style={{ fontFamily: "var(--font-display-br, Georgia, serif)" }} className="text-[var(--ink-1)] dark:text-zinc-100 text-base">
                  SummaryVideos
                </span>
              </Link>
              <button onClick={() => setDrawerOpen(false)} aria-label={t("nav.closeMenu")} className="text-[var(--ink-2)] dark:text-zinc-400">
                <HugeiconsIcon icon={Cancel01Icon} className="text-xl" />
              </button>
            </div>

            <Link href="/dashboard" className={navLinkClass("/dashboard")} onClick={() => setDrawerOpen(false)}>
              {t("nav.dashboard")}
            </Link>
            <Link href="/wallet" className={navLinkClass("/wallet")} onClick={() => setDrawerOpen(false)}>
              {t("nav.wallet")} / {user?.credits ?? 0}
            </Link>
            <a
              href="https://github.com/joaorjoaquim/video-insight-web"
              target="_blank"
              rel="noopener noreferrer"
              className="font-[var(--font-mono-br,monospace)] text-[11px] font-medium tracking-[0.12em] uppercase text-[var(--ink-2)] hover:text-[var(--ink-1)] dark:text-zinc-400 flex items-center gap-1"
            >
              <HugeiconsIcon icon={Github01Icon} className="text-base" />
              {t("nav.github")}
            </a>

            <div className="flex items-center gap-3 mt-auto pt-4 border-t border-[var(--rule)]">
              <img src={getAvatarUrl()} alt={user?.name || "User"} className="w-8 h-8 rounded-full border border-[var(--bars)]" />
              <div className="min-w-0 flex-1">
                <div className="text-[var(--ink-1)] dark:text-zinc-100 text-sm font-medium truncate">{user?.name || "User"}</div>
                <div className="br-eyebrow truncate">{user?.email}</div>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <button
                onClick={() => setLocale(locale === "en" ? "pt-br" : "en")}
                className="font-[var(--font-mono-br,monospace)] text-[11px] font-medium tracking-[0.12em] uppercase text-[var(--ink-2)] hover:text-[var(--play)] border border-[var(--rule)] rounded px-1.5 py-0.5 transition-colors"
              >
                {t("lang.toggle")}
              </button>
              <button
                onClick={toggleTheme}
                className="text-[var(--ink-2)] dark:text-zinc-400 hover:text-[var(--ink-1)] transition-colors"
                aria-label={t("nav.toggleTheme")}
              >
                <HugeiconsIcon icon={theme === "light" ? Moon01Icon : Sun01Icon} className="text-lg" />
              </button>
              <button
                className="flex items-center gap-2 text-[var(--led-failed)] text-sm font-medium"
                onClick={handleLogout}
              >
                <HugeiconsIcon icon={Logout01Icon} className="text-base" />
                {t("nav.logout")}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
