"use client";
import { useState } from "react";
import PrivateHeader from "../../../components/layout/private-header";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "../../../components/ui/dialog";
import { useAppSelector } from "../../../core/hooks";
import { useCredits, useRedeemPromoCode, useClaimGithubCredits, useReferralInfo } from "../../../lib/api/hooks";
import { useT } from "../../../lib/i18n";
import { Reveal } from "../../../components/ui/reveal";
import { CustomSelect } from "../../../components/ui/custom-select";

const creditPackages = [
  { id: "starter",    name: "STARTER",    amount: 10,  price: 9.90,  per: 0.99 },
  { id: "popular",    name: "POPULAR",    amount: 25,  price: 19.75, per: 0.79, recommended: true },
  { id: "pro",        name: "PRO",        amount: 50,  price: 34.50, per: 0.69 },
  { id: "enterprise", name: "ENTERPRISE", amount: 100, price: 59.00, per: 0.59 },
];

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export default function WalletPage() {
  const t = useT();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>("popular");
  const [filterType, setFilterType] = useState("all");
  const [filterPeriod, setFilterPeriod] = useState("30days");

  // Earn credits state
  const [promoCode, setPromoCode] = useState("");
  const [promoResult, setPromoResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [githubUsername, setGithubUsername] = useState("");
  const [githubError, setGithubError] = useState<string | null>(null);
  const [referralCopied, setReferralCopied] = useState(false);

  const { user } = useAppSelector((state: any) => state.auth);
  const { data: creditsData, isLoading, error } = useCredits();
  const redeemMutation = useRedeemPromoCode();
  const claimGithubMutation = useClaimGithubCredits();
  const { data: referralData, isLoading: referralLoading } = useReferralInfo();

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

  const handleClaimGithub = async (action: "star" | "fork") => {
    if (!githubUsername.trim()) return;
    setGithubError(null);
    try {
      await claimGithubMutation.mutateAsync({ githubUsername: githubUsername.trim(), action });
    } catch {
      setGithubError(t("wallet.earn.github.error"));
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
              <button
                onClick={() => setDialogOpen(true)}
                className="flex items-center gap-2 px-5 py-3 text-sm font-semibold bg-[var(--play)] hover:bg-[var(--play-700)] text-white rounded-[6px] transition-colors"
              >
                {t("wallet.balance.buyBtn")}
                <span className="inline-block w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-white" />
              </button>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 mt-10 pt-8 border-t border-[var(--rule)]">
                {[
                  { label: t("wallet.stats.purchased"), value: totalPurchased, accent: false },
                  { label: t("wallet.stats.used"),      value: totalUsed,      accent: false },
                  { label: t("wallet.stats.balance"),   value: credits,        accent: true },
                ].map((stat, i) => (
                  <div key={i}>
                    <div className="br-eyebrow mb-2">{stat.label}</div>
                    <div
                      style={{ fontFamily: "var(--font-display-br, Georgia, serif)", fontSize: "2.5rem", lineHeight: 1, letterSpacing: "-0.02em", fontStyle: stat.accent ? "italic" : "normal", color: stat.accent ? "var(--play)" : "var(--ink-1)" }}
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
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--rule)]">
                      {[t("wallet.ledger.col.type"), t("wallet.ledger.col.description"), t("wallet.ledger.col.amount"), t("wallet.ledger.col.status")].map((h, i) => (
                        <th key={i} className={`br-eyebrow py-2 text-left font-normal ${i >= 2 ? "text-right" : ""}`}>{h}</th>
                      ))}
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
                        <td className={`py-3 pr-4 text-right font-medium tabular-nums ${typeColor(tx.amount)}`} style={{ fontFamily: "var(--font-mono-br, monospace)", fontSize: 13 }}>
                          {tx.amount >= 0 ? "+" : "–"}{Math.abs(tx.amount)} cr
                        </td>
                        <td className="py-3 text-right">
                          <span className="led completed">completed</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {filteredTransactions.length > 0 && (
                <div className="br-eyebrow mt-4">
                  {t("wallet.ledger.showing")} {filteredTransactions.length} {t("wallet.ledger.of")} {transactions.length} {t("wallet.ledger.transactions")}
                </div>
              )}
            </div>
          </section>
        </Reveal>

        <hr className="border-[var(--rule)] mb-14 mt-14" />

        {/* § 03 Earn Credits */}
        <Reveal delay={2}>
          <section className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8 pb-24">
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

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
                  <input
                    value={githubUsername}
                    onChange={(e) => { setGithubUsername(e.target.value); setGithubError(null); }}
                    placeholder={t("wallet.earn.github.placeholder")}
                    className="border border-[var(--rule)] rounded-[6px] px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-[var(--ink-1)] placeholder:text-[var(--ink-3)] focus:outline-none focus:border-[var(--bars)] transition-colors"
                  />
                  {githubError && <p className="text-xs text-[var(--led-failed)]">{githubError}</p>}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleClaimGithub("star")}
                      disabled={!githubUsername.trim() || claimGithubMutation.isPending}
                      className="flex-1 px-3 py-1.5 text-[11px] font-medium border border-[var(--rule)] rounded-[4px] hover:border-[var(--bars)] hover:text-[var(--bars)] disabled:opacity-40 transition-colors"
                      style={{ fontFamily: "var(--font-mono-br, monospace)" }}
                    >
                      {t("wallet.earn.github.star")}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleClaimGithub("fork")}
                      disabled={!githubUsername.trim() || claimGithubMutation.isPending}
                      className="flex-1 px-3 py-1.5 text-[11px] font-medium border border-[var(--rule)] rounded-[4px] hover:border-[var(--bars)] hover:text-[var(--bars)] disabled:opacity-40 transition-colors"
                      style={{ fontFamily: "var(--font-mono-br, monospace)" }}
                    >
                      {t("wallet.earn.github.fork")}
                    </button>
                  </div>
                  <a
                    href="https://github.com/joaorjoaquim/video-insight-web"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="br-eyebrow hover:text-[var(--bars)] transition-colors mt-auto"
                  >
                    {t("wallet.earn.github.link")}
                  </a>
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

      {/* Buy credits dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl bg-[var(--briefing-bg)] border border-[var(--rule)] rounded-[14px] p-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="logo-bars"><i/><i/><i/></span>
            <span className="br-eyebrow">§ {t("wallet.modal.section")}</span>
          </div>
          <DialogTitle
            style={{ fontFamily: "var(--font-display-br, Georgia, serif)", fontSize: "1.75rem", letterSpacing: "-0.012em" }}
            className="text-[var(--ink-1)] mb-1"
          >
            {t("wallet.modal.headline")} <span className="ital-bar">{t("wallet.modal.headlineAccent")}</span>.
          </DialogTitle>
          <p className="br-eyebrow mb-7">{t("wallet.modal.sub")}</p>

          <div className="stagger-list grid grid-cols-2 md:grid-cols-4 gap-3 mb-7">
            {creditPackages.map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => setSelected(pkg.id)}
                className={`relative border rounded-[10px] p-4 flex flex-col gap-1.5 text-left transition-colors ${
                  selected === pkg.id
                    ? "border-[var(--bars)] bg-white dark:bg-zinc-900"
                    : "border-[var(--rule)] bg-white dark:bg-zinc-900 hover:border-[var(--ink-2)]"
                }`}
              >
                {pkg.recommended && (
                  <div className="absolute -top-2.5 left-3 bg-[var(--play)] text-white text-[9px] font-medium tracking-[0.1em] px-2 py-0.5 rounded-[3px]" style={{ fontFamily: "var(--font-mono-br, monospace)" }}>
                    {t("wallet.modal.recommended")}
                  </div>
                )}
                <div className="br-eyebrow">{pkg.name}</div>
                <div style={{ fontFamily: "var(--font-display-br, Georgia, serif)", fontSize: "1.6rem", lineHeight: 1 }} className="text-[var(--ink-1)]">
                  {pkg.amount}
                  <small className="text-xs ml-1" style={{ fontFamily: "var(--font-sans-br)" }}>cr</small>
                </div>
                <div className="br-eyebrow">{usd.format(pkg.per)}{t("wallet.modal.perCredit")}</div>
                <div className="mt-auto pt-2 border-t border-[var(--rule)]">
                  <div style={{ fontFamily: "var(--font-display-br, Georgia, serif)", fontSize: "1.2rem" }} className="text-[var(--ink-1)]">{usd.format(pkg.price)}</div>
                </div>
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={!selected}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold bg-[var(--play)] hover:bg-[var(--play-700)] disabled:opacity-40 text-white rounded-[6px] transition-colors"
            onClick={() => setDialogOpen(false)}
          >
            {t("wallet.modal.buyNow")}
            <span className="inline-block w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-white" />
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
