"use client";
import { useState, useEffect } from "react";
import PrivateHeader from "../../../components/layout/private-header";
import { useAppSelector, useAppDispatch } from "../../../core/hooks";
import { fetchProfile } from "../../../core/slices/authSlice";
import { useCredits, useRedeemPromoCode, useClaimGithubCredits, useReferralInfo } from "../../../lib/api/hooks";
import { getGithubLinkUrl } from "../../../lib/api/authApi";
import { useT, useI18n } from "../../../lib/i18n";
import { Reveal } from "../../../components/ui/reveal";
import { CustomSelect } from "../../../components/ui/custom-select";

function getNextSundayLabel(locale: string): string {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday
  const daysUntilSunday = day === 0 ? 7 : 7 - day;
  const next = new Date(now);
  next.setDate(now.getDate() + daysUntilSunday);
  const localeStr = locale === "pt-br" ? "pt-BR" : "en-US";
  return next.toLocaleDateString(localeStr, { weekday: "long", month: "short", day: "numeric" });
}

export default function WalletPage() {
  const t = useT();
  const { locale } = useI18n();
  const dispatch = useAppDispatch();
  const [filterType, setFilterType] = useState("all");
  const [filterPeriod, setFilterPeriod] = useState("30days");
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // Earn credits state
  const [promoCode, setPromoCode] = useState("");
  const [promoResult, setPromoResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [githubError, setGithubError] = useState<string | null>(null);
  const [referralCopied, setReferralCopied] = useState(false);
  const [githubLinking, setGithubLinking] = useState(false);
  const [githubSuccess, setGithubSuccess] = useState(false);

  const { user } = useAppSelector((state: any) => state.auth);
  const effectiveLimit = filterPeriod !== "all" ? 200 : ITEMS_PER_PAGE;
  const effectivePage = filterPeriod !== "all" ? 1 : page;
  const { data: creditsData, isLoading, error } = useCredits(effectivePage, effectiveLimit);
  const redeemMutation = useRedeemPromoCode();
  const claimGithubMutation = useClaimGithubCredits();
  const { data: referralData, isLoading: referralLoading } = useReferralInfo();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const linked = params.get("github_linked");
    const error = params.get("error");
    if (!linked && !error) return;

    window.history.replaceState({}, "", "/wallet");

    // If we're in a popup opened by the main window, communicate back and close
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage(
        { type: "github_linked", success: linked === "1", error: error || null },
        window.location.origin
      );
      window.close();
      return;
    }

    // Direct navigation (popup was blocked, user came here normally)
    if (linked === "1") {
      dispatch(fetchProfile());
      setGithubSuccess(true);
      setTimeout(() => setGithubSuccess(false), 5000);
    }
    if (error) {
      setGithubError(
        error === "github_already_linked" ? t("wallet.earn.github.error.alreadyLinked")
        : error === "github_already_owned" ? t("wallet.earn.github.error.alreadyOwned")
        : t("wallet.earn.github.error.generic")
      );
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === "github_linked") {
        setGithubLinking(false);
        if (e.data.success) {
          dispatch(fetchProfile());
          setGithubSuccess(true);
          setTimeout(() => setGithubSuccess(false), 5000);
        } else {
          setGithubError(e.data.error === "github_already_linked"
            ? t("wallet.earn.github.error.alreadyLinked")
            : e.data.error === "github_already_owned"
            ? t("wallet.earn.github.error.alreadyOwned")
            : t("wallet.earn.github.error.generic"));
        }
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [dispatch, t]);

  useEffect(() => {
    setPage(1);
  }, [filterPeriod, filterType]);

  const credits = creditsData?.credits ?? user?.credits ?? 0;
  const transactions = creditsData?.transactions || [];

  const totalPurchased = transactions
    .filter((tx: any) => tx.type === "purchase")
    .reduce((sum: number, tx: any) => sum + Math.abs(tx.amount), 0);

  const totalUsed = transactions
    .filter((tx: any) => tx.type === "spend")
    .reduce((sum: number, tx: any) => sum + Math.abs(tx.amount), 0);

  const estimatedVideos = Math.round(credits / 6);

  const lastTransaction = transactions.length > 0 ? transactions[0] : null;
  const lastTransactionDate = lastTransaction
    ? new Date(lastTransaction.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

  const filteredTransactions = transactions.filter((tx: any) => {
    if (filterType !== "all" && tx.type !== filterType) return false;
    if (filterPeriod === "30days") {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      return new Date(tx.createdAt) >= cutoff;
    }
    return true;
  });

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch { return ""; }
  };

  const handleRedeemPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoResult(null);
    try {
      const res = await redeemMutation.mutateAsync(promoCode);
      setPromoResult({ ok: true, msg: `+${res.coinsAdded} ${t("wallet.earn.promo.success")}` });
      setPromoCode("");
    } catch {
      setPromoResult({ ok: false, msg: t("wallet.earn.promo.error") });
    }
  };

  const handleClaimGithub = async (action: "star" | "fork", repo: "web" | "api") => {
    setGithubError(null);
    try {
      await claimGithubMutation.mutateAsync({ action, repo });
      dispatch(fetchProfile());
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 404) setGithubError(t("wallet.earn.github.error.notFound"));
      else if (status === 409) setGithubError(t("wallet.earn.github.error.claimed"));
      else if (status === 429) setGithubError(t("wallet.earn.github.error.rateLimit"));
      else setGithubError(t("wallet.earn.github.error.generic"));
    }
  };

  const handleConnectGithub = async () => {
    setGithubLinking(true);
    try {
      const url = await getGithubLinkUrl();
      const popup = window.open(url, "github-oauth", "width=600,height=700,scrollbars=yes,resizable=yes");
      if (!popup) {
        // popup blocked — fall back to redirect
        window.location.href = url;
      }
    } catch {
      setGithubLinking(false);
    }
  };

  const handleCopyReferral = () => {
    const url = referralData?.referralUrl ?? `https://summaryvideos.com/?ref=${user?.id}`;
    navigator.clipboard?.writeText(url);
    setReferralCopied(true);
    setTimeout(() => setReferralCopied(false), 2000);
  };

  const typeColor = (amount: number) =>
    amount >= 0 ? "text-[var(--led-completed)]" : "text-[var(--play-700)]";

  return (
    <div className="min-h-screen bg-[var(--briefing-bg)]">
      <PrivateHeader />
      <main className="max-w-5xl mx-auto px-4 pt-14 pb-24" style={{ fontFamily: "var(--font-sans-br, system-ui, sans-serif)" }}>
        {/* Balance section */}
        <Reveal>
          <section className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8 mb-14">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="logo-bars"><i/><i/><i/></span>
                <span className="br-eyebrow">§ 01</span>
              </div>
              <div className="br-eyebrow">{t("wallet.balance.section")}</div>
            </div>
            <div>
              <div className="br-eyebrow mb-4">{t("wallet.balance.current")}</div>
              <div
                style={{ fontFamily: "var(--font-display-br, Georgia, serif)", fontSize: "clamp(4rem, 10vw, 6rem)", lineHeight: 1, letterSpacing: "-0.03em", fontStyle: "italic", color: "var(--play)" }}
                className="mb-3"
              >
                {credits}
                <span className="text-xl ml-2 not-italic text-[var(--ink-3)]" style={{ fontFamily: "var(--font-sans-br, system-ui)" }}>{t("wallet.stats.credits")}</span>
              </div>
              <div className="br-eyebrow mb-6">
                {lastTransactionDate && `${t("wallet.balance.lastTx")} · ${lastTransactionDate} · `}~{estimatedVideos} {t("wallet.balance.videosLeft")}
              </div>
              <a
                href="#earn-credits"
                className="flex items-center gap-2 px-5 py-3 text-sm font-semibold bg-[var(--play)] hover:bg-[var(--play-700)] text-white rounded-[6px] transition-colors"
              >
                {t("wallet.balance.buyBtn")}
                <span className="inline-block w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-white" />
              </a>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 sm:gap-8 mt-10 pt-8 border-t border-[var(--rule)]">
                {[
                  { label: t("wallet.stats.purchased"), value: totalPurchased, accent: false },
                  { label: t("wallet.stats.used"),      value: totalUsed,      accent: false },
                  { label: t("wallet.stats.balance"),   value: credits,        accent: true },
                ].map((stat, i) => (
                  <div key={i}>
                    <div className="br-eyebrow mb-2">{stat.label}</div>
                    <div
                      style={{ fontFamily: "var(--font-display-br, Georgia, serif)", fontSize: "clamp(1.5rem, 4vw, 2.5rem)", lineHeight: 1, letterSpacing: "-0.02em", fontStyle: stat.accent ? "italic" : "normal", color: stat.accent ? "var(--play)" : "var(--ink-1)" }}
                    >
                      {stat.value}
                    </div>
                    <div className="br-eyebrow mt-1">{t("wallet.stats.credits")}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        <hr className="border-[var(--rule)] mb-14" />

        {/* Transactions */}
        <Reveal delay={1}>
          <section className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="logo-bars"><i/><i/><i/></span>
                <span className="br-eyebrow">§ 02</span>
              </div>
              <div className="br-eyebrow">{t("wallet.ledger.section")}</div>
            </div>
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2
                  style={{ fontFamily: "var(--font-display-br, Georgia, serif)", fontSize: "1.4rem", letterSpacing: "-0.01em" }}
                  className="text-[var(--ink-1)]"
                >
                  {t("wallet.ledger.headline")}
                </h2>
                <div className="flex gap-2">
                  <CustomSelect
                    value={filterType}
                    onChange={setFilterType}
                    options={[
                      { value: "all",      label: t("wallet.ledger.allTypes") },
                      { value: "spend",    label: t("wallet.ledger.spent") },
                      { value: "purchase", label: t("wallet.ledger.purchased") },
                      { value: "refund",   label: t("wallet.ledger.refunded") },
                    ]}
                  />
                  <CustomSelect
                    value={filterPeriod}
                    onChange={setFilterPeriod}
                    options={[
                      { value: "all",    label: t("wallet.ledger.allTime") },
                      { value: "30days", label: t("wallet.ledger.last30") },
                    ]}
                  />
                </div>
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center gap-3 py-12">
                  <div className="bars-loader"><i/><i/><i/><i/></div>
                  <span className="br-eyebrow">{t("wallet.ledger.loading")}</span>
                </div>
              ) : error ? (
                <p className="text-[var(--led-failed)] text-sm py-8">{t("wallet.ledger.error")}</p>
              ) : filteredTransactions.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-[var(--rule)] rounded-[10px]">
                  <div className="br-eyebrow mb-2">{t("wallet.ledger.empty.title")}</div>
                  <p className="text-[var(--ink-2)] text-sm">{t("wallet.ledger.empty.sub")}</p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-1 px-1">
                <table className="w-full text-sm border-collapse min-w-[480px]">
                  <thead>
                    <tr className="border-b border-[var(--rule)]">
                      <th className="br-eyebrow py-2 pr-4 text-left font-normal w-24">{t("wallet.ledger.col.type")}</th>
                      <th className="br-eyebrow py-2 text-left font-normal">{t("wallet.ledger.col.description")}</th>
                      <th className="br-eyebrow py-2 pl-4 text-right font-normal w-28">{t("wallet.ledger.col.amount")}</th>
                      <th className="br-eyebrow py-2 pl-4 text-right font-normal w-28">{t("wallet.ledger.col.status")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((tx: any) => (
                      <tr key={tx.id} className="border-b border-[var(--rule-soft)] hover:bg-[var(--rule-soft)] transition-colors">
                        <td className="py-3 pr-4">
                          <span className={`br-eyebrow ${typeColor(tx.amount)}`}>{tx.type?.toUpperCase()}</span>
                        </td>
                        <td className="py-3 pr-4">
                          <div className="text-[var(--ink-1)] text-sm">{tx.description || (tx.type === "spend" ? "Video submission" : tx.type === "purchase" ? "Credit purchase" : "Credit refund")}</div>
                          <div className="br-eyebrow mt-0.5">{formatDate(tx.createdAt)}</div>
                        </td>
                        <td className={`py-3 pl-4 text-right font-medium tabular-nums ${typeColor(tx.amount)}`} style={{ fontFamily: "var(--font-mono-br, monospace)", fontSize: 13 }}>
                          {tx.amount >= 0 ? "+" : "–"}{Math.abs(tx.amount)} cr
                        </td>
                        <td className="py-3 pl-4 text-right">
                          <span className="led completed">completed</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              )}

              {creditsData?.pagination && filterPeriod === "all" && (
                <div className="flex flex-wrap items-center justify-between gap-2 mt-4">
                  <div className="br-eyebrow">
                    {t("wallet.ledger.showing")} {Math.min(page * ITEMS_PER_PAGE, creditsData.pagination.total)} {t("wallet.ledger.of")} {creditsData.pagination.total} {t("wallet.ledger.transactions")}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1.5 text-xs border border-[var(--rule)] rounded-[4px] disabled:opacity-40 hover:border-[var(--ink-2)] transition-colors br-eyebrow"
                    >
                      ← {t("wallet.ledger.prev")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page * ITEMS_PER_PAGE >= creditsData.pagination.total}
                      className="px-3 py-1.5 text-xs border border-[var(--rule)] rounded-[4px] disabled:opacity-40 hover:border-[var(--ink-2)] transition-colors br-eyebrow"
                    >
                      {t("wallet.ledger.next")} →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </Reveal>

        <hr className="border-[var(--rule)] mb-14 mt-14" />

        {/* § 03 Earn Credits */}
        <Reveal delay={2}>
          <section id="earn-credits" className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8 pb-24">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="logo-bars"><i/><i/><i/></span>
                <span className="br-eyebrow">§ 03</span>
              </div>
              <div className="br-eyebrow">{t("wallet.earn.section")}</div>
            </div>
            <div>
              <h2
                style={{ fontFamily: "var(--font-display-br, Georgia, serif)", fontSize: "1.4rem", letterSpacing: "-0.01em" }}
                className="text-[var(--ink-1)] mb-6"
              >
                {t("wallet.earn.headline")} <span className="ital-bar">{t("wallet.earn.headlineAccent")}</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Weekly Restore */}
                <div className="border border-[var(--rule)] rounded-[10px] p-5 bg-white dark:bg-zinc-900 flex flex-col gap-3">
                  <div>
                    <div className="br-eyebrow mb-1">{t("wallet.earn.weekly.title")}</div>
                    <p className="text-[var(--ink-2)] text-xs leading-relaxed">{t("wallet.earn.weekly.sub")}</p>
                  </div>
                  <div className="mt-auto">
                    <div style={{ fontFamily: "var(--font-display-br, Georgia, serif)", fontSize: "2rem", lineHeight: 1, letterSpacing: "-0.02em" }} className="text-[var(--play)]">100</div>
                    <div className="br-eyebrow mt-1">{t("wallet.earn.weekly.amount")}</div>
                  </div>
                  <div className="pt-3 border-t border-[var(--rule)]">
                    <div className="br-eyebrow">{t("wallet.earn.weekly.next")}: {getNextSundayLabel(locale)}</div>
                  </div>
                </div>

                {/* Promo Code */}
                <div className="border border-[var(--rule)] rounded-[10px] p-5 bg-white dark:bg-zinc-900 flex flex-col gap-3">
                  <div>
                    <div className="br-eyebrow mb-1">{t("wallet.earn.promo.title")}</div>
                    <p className="text-[var(--ink-2)] text-xs leading-relaxed">{t("wallet.earn.promo.sub")}</p>
                  </div>
                  <input
                    value={promoCode}
                    onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoResult(null); }}
                    onKeyDown={(e) => e.key === "Enter" && handleRedeemPromo()}
                    placeholder={t("wallet.earn.promo.placeholder")}
                    className="border border-[var(--rule)] rounded-[6px] px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-[var(--ink-1)] placeholder:text-[var(--ink-3)] focus:outline-none focus:border-[var(--bars)] transition-colors"
                    style={{ fontFamily: "var(--font-mono-br, monospace)" }}
                  />
                  {promoResult && (
                    <p className={`text-xs ${promoResult.ok ? "text-[var(--led-completed)]" : "text-[var(--led-failed)]"}`}>
                      {promoResult.msg}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={handleRedeemPromo}
                    disabled={!promoCode.trim() || redeemMutation.isPending}
                    className="mt-auto px-4 py-2 text-sm font-semibold bg-[var(--play)] hover:bg-[var(--play-700)] disabled:opacity-40 text-white rounded-[6px] transition-colors"
                  >
                    {redeemMutation.isPending ? t("wallet.earn.promo.redeeming") : t("wallet.earn.promo.button")}
                  </button>
                </div>

                {/* GitHub */}
                <div className="border border-[var(--rule)] rounded-[10px] p-5 bg-white dark:bg-zinc-900 flex flex-col gap-3">
                  <div>
                    <div className="br-eyebrow mb-1">{t("wallet.earn.github.title")}</div>
                    <p className="text-[var(--ink-2)] text-xs leading-relaxed">{t("wallet.earn.github.sub")}</p>
                  </div>

                  {!user?.githubUsername ? (
                    <>
                      <p className="text-[var(--ink-3)] text-xs">{t("wallet.earn.github.notLinked")}</p>
                      {githubError && <p className="text-xs text-[var(--led-failed)]">{githubError}</p>}
                      {githubSuccess && (
                        <p className="text-xs text-[var(--led-completed)]">{t("wallet.earn.github.connected")}</p>
                      )}
                      <button
                        type="button"
                        onClick={handleConnectGithub}
                        disabled={githubLinking}
                        className="mt-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold bg-[var(--ink-1)] hover:opacity-80 disabled:opacity-50 text-[var(--briefing-bg)] rounded-[6px] transition-opacity"
                      >
                        {githubLinking ? (
                          <span className="bars-loader scale-75 origin-center" style={{ filter: "brightness(10)" }}><i/><i/><i/><i/></span>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
                            <path fill="currentColor" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
                          </svg>
                        )}
                        {githubLinking ? t("wallet.earn.github.connecting") : t("wallet.earn.github.connect")}
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="br-eyebrow text-[var(--led-completed)]">@{user.githubUsername}</p>
                      {githubError && <p className="text-xs text-[var(--led-failed)]">{githubError}</p>}
                      {[
                        { action: "star" as const, repo: "web" as const, label: t("wallet.earn.github.star"), claimed: user.githubStarClaimedWeb },
                        { action: "fork" as const, repo: "web" as const, label: t("wallet.earn.github.fork"), claimed: user.githubForkClaimedWeb },
                        { action: "star" as const, repo: "api" as const, label: t("wallet.earn.github.starApi"), claimed: user.githubStarClaimedApi },
                        { action: "fork" as const, repo: "api" as const, label: t("wallet.earn.github.forkApi"), claimed: user.githubForkClaimedApi },
                      ].map(({ action, repo, label, claimed }) => (
                        <div key={`${action}-${repo}`} className="flex items-center justify-between gap-2">
                          <span className="text-xs text-[var(--ink-2)]">{label}</span>
                          {claimed ? (
                            <span className="br-eyebrow text-[var(--led-completed)]">{t("wallet.earn.github.claimed")}</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleClaimGithub(action, repo)}
                              disabled={claimGithubMutation.isPending}
                              className="px-3 py-1 text-[10px] font-medium border border-[var(--rule)] rounded-[4px] hover:border-[var(--bars)] hover:text-[var(--bars)] disabled:opacity-40 transition-colors"
                              style={{ fontFamily: "var(--font-mono-br, monospace)" }}
                            >
                              {t("wallet.earn.github.claim")}
                            </button>
                          )}
                        </div>
                      ))}
                    </>
                  )}
                </div>

                {/* Referral */}
                <div className="border border-[var(--rule)] rounded-[10px] p-5 bg-white dark:bg-zinc-900 flex flex-col gap-3">
                  <div>
                    <div className="br-eyebrow mb-1">{t("wallet.earn.referral.title")}</div>
                    <p className="text-[var(--ink-2)] text-xs leading-relaxed">{t("wallet.earn.referral.sub")}</p>
                  </div>
                  {referralLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="bars-loader scale-75 origin-left"><i/><i/><i/><i/></div>
                      <span className="br-eyebrow">{t("wallet.earn.referral.loading")}</span>
                    </div>
                  ) : (
                    <>
                      <div className="border border-[var(--rule)] rounded-[6px] px-3 py-2 text-xs text-[var(--ink-3)] truncate bg-[var(--rule-soft)]" style={{ fontFamily: "var(--font-mono-br, monospace)" }}>
                        {referralData?.referralUrl ?? `summaryvideos.com/?ref=${user?.id ?? "…"}`}
                      </div>
                      {referralData && (
                        <div className="br-eyebrow">
                          {referralData.referralsCount} {t("wallet.earn.referral.stats").split("·")[0].trim()} · {referralData.creditsEarned} {t("wallet.earn.referral.stats").split("·")[1]?.trim()}
                        </div>
                      )}
                    </>
                  )}
                  <button
                    type="button"
                    onClick={handleCopyReferral}
                    className={`mt-auto px-4 py-2 text-sm font-semibold rounded-[6px] transition-colors border ${
                      referralCopied
                        ? "border-[var(--bars)] text-[var(--bars)]"
                        : "border-[var(--rule)] text-[var(--ink-2)] hover:border-[var(--ink-2)] hover:text-[var(--ink-1)]"
                    }`}
                  >
                    {referralCopied ? t("wallet.earn.referral.copied") : t("wallet.earn.referral.copy")}
                  </button>
                </div>

              </div>
            </div>
          </section>
        </Reveal>
      </main>

    </div>
  );
}
