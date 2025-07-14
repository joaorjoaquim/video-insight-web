"use client";
import React, { useState } from "react";
import PrivateHeader from "../../../components/layout/private-header";
import { Button } from "../../../components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "../../../components/ui/dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import { CreditCardIcon, CheckmarkCircle01Icon, Wallet01Icon } from "@hugeicons/core-free-icons";

const creditPackages = [
  { amount: 10, price: 39, per: 3.9 },
  { amount: 25, price: 90, per: 3.6, recommended: true },
  { amount: 50, price: 170, per: 3.4 },
  { amount: 100, price: 300, per: 3.0 },
];

const mockHistory = [
  { date: "May 18, 2023", activity: "Submitted video", credits: -1, id: "VID-8721", status: "Completed" },
  { date: "May 15, 2023", activity: "Purchased credits", credits: 25, id: "TRX-5432", status: "Successful" },
];

export default function WalletPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const credits = 25; // mock

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f6fc] to-white dark:from-zinc-950 dark:to-zinc-900">
      <PrivateHeader />
      <main className="max-w-4xl mx-auto px-4 pt-8 pb-16">
        <section className="mb-10">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 flex flex-col md:flex-row items-center gap-6">
            <div className="flex items-center gap-4 flex-1">
              <div className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-full">
                <HugeiconsIcon icon={Wallet01Icon} className="text-3xl text-indigo-600 dark:text-indigo-300" />
              </div>
              <div>
                <div className="text-zinc-500 text-sm">Current Balance</div>
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{credits} Credits</div>
                <div className="text-xs text-zinc-400">Last purchase: May 15, 2023</div>
              </div>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg shadow">+ Buy Credits</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md w-full">
                <h3 className="text-lg font-bold mb-4">Buy Credits</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {creditPackages.map(pkg => (
                    <button
                      key={pkg.amount}
                      className={`border rounded-lg p-4 flex flex-col items-center gap-2 transition-all ${selected === pkg.amount ? "border-indigo-500 ring-2 ring-indigo-200" : "border-zinc-200 dark:border-zinc-800"} ${pkg.recommended ? "bg-indigo-50 dark:bg-indigo-900" : ""}`}
                      onClick={() => setSelected(pkg.amount)}
                    >
                      <div className="flex items-center gap-1 text-xl font-bold">
                        <HugeiconsIcon icon={CreditCardIcon} className="text-indigo-500" />
                        {pkg.amount} Credits
                      </div>
                      <div className="text-zinc-500 text-sm">${pkg.price} <span className="text-xs">(${pkg.per.toFixed(2)} per credit)</span></div>
                      {pkg.recommended && <span className="text-xs text-indigo-600 font-semibold mt-1">RECOMMENDED</span>}
                    </button>
                  ))}
                </div>
                <Button className="w-full" disabled={selected === null} onClick={() => setDialogOpen(false)}>
                  Confirm Purchase
                </Button>
              </DialogContent>
            </Dialog>
          </div>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Activity History</h2>
          <div className="overflow-x-auto rounded-lg shadow">
            <table className="min-w-full bg-white dark:bg-zinc-900 text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  <th className="px-4 py-2 text-left">DATE</th>
                  <th className="px-4 py-2 text-left">ACTIVITY</th>
                  <th className="px-4 py-2 text-left">CREDITS</th>
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {mockHistory.map((row, i) => (
                  <tr key={i} className="border-b border-zinc-100 dark:border-zinc-800">
                    <td className="px-4 py-2 whitespace-nowrap">{row.date}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{row.activity}</td>
                    <td className={`px-4 py-2 whitespace-nowrap font-bold ${row.credits > 0 ? "text-green-600" : "text-red-600"}`}>{row.credits > 0 ? "+" : ""}{row.credits}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{row.id}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {row.status === "Completed" || row.status === "Successful" ? (
                        <span className="inline-flex items-center gap-1 text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-200 px-2 py-0.5 rounded text-xs font-medium">
                          <HugeiconsIcon icon={CheckmarkCircle01Icon} className="text-base" />
                          {row.status}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-zinc-600 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-xs font-medium">{row.status}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
} 