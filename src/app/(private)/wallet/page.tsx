"use client";
import { useState } from "react";
import PrivateHeader from "../../../components/layout/private-header";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "../../../components/ui/dialog";
import { useAppSelector } from "../../../core/hooks";
import { useCredits } from "../../../lib/api/hooks";
import { useT } from "../../../lib/i18n";
import { Reveal } from "../../../components/ui/reveal";

const creditPackages = [
  { id: "starter",    name: "STARTER",    amount: 10,  price: 9.90,  per: 0.99 },
  { id: "popular",    name: "POPULAR",    amount: 25,  price: 19.75, per: 0.79, recommended: true },
  { id: "pro",        name: "PRO",        amount: 50,  price: 34.50, per: 0.69 },
  { id: "enterprise", name: "ENTERPRISE", amount: 100, price: 59.00, per: 0.59 },
];

export default function WalletPage() {
  const t = useT();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>("popular");
  const [filterType, setFilterType] = useState("all");
  const [filterPeriod, setFilterPeriod] = useState("30days");

  const { user } = useAppSelector((state: any) => state.auth);
  const { data: creditsData, isLoading, error } = useCredits();

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
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="border border-[var(--rule)] rounded-[6px] px-3 py-1.5 text-[11px] tracking-[0.1em] bg-white dark:bg-zinc-900 text-[var(--ink-2)] focus:outline-none"
                    style={{ fontFamily: "var(--font-mono-br, monospace)" }}
                  >
                    <option value="all">{t("wallet.ledger.allTypes")}</option>
                    <option value="spend">{t("wallet.ledger.spent")}</option>
                    <option value="purchase">{t("wallet.ledger.purchased")}</option>
                    <option value="refund">{t("wallet.ledger.refunded")}</option>
                  </select>
                  <select
                    value={filterPeriod}
                    onChange={(e) => setFilterPeriod(e.target.value)}
                    className="border border-[var(--rule)] rounded-[6px] px-3 py-1.5 text-[11px] tracking-[0.1em] bg-white dark:bg-zinc-900 text-[var(--ink-2)] focus:outline-none"
                    style={{ fontFamily: "var(--font-mono-br, monospace)" }}
                  >
                    <option value="all">{t("wallet.ledger.allTime")}</option>
                    <option value="30days">{t("wallet.ledger.last30")}</option>
                  </select>
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
                <div className="br-eyebrow">${pkg.per.toFixed(2)}{t("wallet.modal.perCredit")}</div>
                <div className="mt-auto pt-2 border-t border-[var(--rule)]">
                  <div style={{ fontFamily: "var(--font-display-br, Georgia, serif)", fontSize: "1.2rem" }} className="text-[var(--ink-1)]">${pkg.price.toFixed(2)}</div>
                </div>
              </button>
            ))}
          </div>

          <button
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
