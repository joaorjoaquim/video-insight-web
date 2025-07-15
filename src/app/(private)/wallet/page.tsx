"use client";
import React, { useState } from "react";
import PrivateHeader from "../../../components/layout/private-header";
import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "../../../components/ui/dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CreditCardIcon,
  CheckmarkCircle01Icon,
  Wallet01Icon,
  ArrowDownIcon,
  VideoIcon,
  RocketIcon,
  StarIcon,
  DiamondIcon,
  BuildingIcon,
  BarChartIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@hugeicons/core-free-icons";
import { useAppSelector } from "../../../core/hooks";
import { useCredits } from "../../../lib/api/hooks";
import { formatSubmissionDate } from "../../../lib/utils/date-formatter";

const creditPackages = [
  {
    id: "starter",
    name: "Starter Package",
    amount: 10,
    price: 9.9,
    per: 0.99,
    icon: RocketIcon,
    color: "bg-blue-500",
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
  },
  {
    id: "popular",
    name: "Popular Package",
    amount: 25,
    price: 19.75,
    per: 0.79,
    icon: StarIcon,
    color: "bg-purple-500",
    bgColor: "bg-purple-50",
    textColor: "text-purple-600",
    recommended: true,
  },
  {
    id: "pro",
    name: "Pro Package",
    amount: 50,
    price: 34.5,
    per: 0.69,
    icon: DiamondIcon,
    color: "bg-indigo-500",
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-600",
  },
  {
    id: "enterprise",
    name: "Enterprise Package",
    amount: 100,
    price: 59.0,
    per: 0.59,
    icon: BuildingIcon,
    color: "bg-green-500",
    bgColor: "bg-green-50",
    textColor: "text-green-600",
  },
];

export default function WalletPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [filterType, setFilterType] = useState("all");
  const [filterPeriod, setFilterPeriod] = useState("30days");

  // Get user data from Redux
  const { user } = useAppSelector((state: any) => state.auth);

  // Fetch credits and transactions
  const { data: creditsData, isLoading, error } = useCredits();

  const credits = creditsData?.credits || user?.credits || 0;
  const transactions = creditsData?.transactions || [];

  // Calculate estimated submissions left (assuming 6 credits per video)
  const estimatedSubmissions = Math.round(credits / 6);

  // Get last transaction date
  const lastTransaction = transactions.length > 0 ? transactions[0] : null;
  const lastTransactionDate = lastTransaction
    ? new Date(lastTransaction.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  // Calculate total credits purchased vs used
  const totalPurchased = transactions
    .filter((t) => t.type === "purchase")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalUsed = transactions
    .filter((t) => t.type === "spend")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const formatAmount = (amount: number) => {
    const sign = amount >= 0 ? "+" : "";
    return `${sign}${amount}`;
  };

  const getActivityIcon = (type: string) => {
    const baseClasses = "w-8 h-8 rounded-full flex items-center justify-center";

    switch (type) {
      case "spend":
        return (
          <div className={`${baseClasses} bg-red-100`}>
            <HugeiconsIcon icon={VideoIcon} className="w-4 h-4 text-red-600" />
          </div>
        );
      case "purchase":
        return (
          <div className={`${baseClasses} bg-green-100`}>
            <HugeiconsIcon
              icon={CreditCardIcon}
              className="w-4 h-4 text-green-600"
            />
          </div>
        );
      case "refund":
        return (
          <div className={`${baseClasses} bg-yellow-100`}>
            <HugeiconsIcon
              icon={Wallet01Icon}
              className="w-4 h-4 text-yellow-600"
            />
          </div>
        );
      default:
        return (
          <div className={`${baseClasses} bg-gray-100`}>
            <HugeiconsIcon
              icon={Wallet01Icon}
              className="w-4 h-4 text-gray-600"
            />
          </div>
        );
    }
  };

  const getActivityDescription = (transaction: any) => {
    switch (transaction.type) {
      case "spend":
        return transaction.description || "Submitted video";
      case "purchase":
        return transaction.description || "Purchased credits";
      case "refund":
        return transaction.description || "Refunded credits";
      default:
        return transaction.description || "Transaction";
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";

    switch (status) {
      case "completed":
      case "successful":
        return (
          <span className={`${baseClasses} bg-green-100 text-green-700`}>
            {status === "completed" ? "Completed" : "Successful"}
          </span>
        );
      case "pending":
        return (
          <span className={`${baseClasses} bg-orange-100 text-orange-700`}>
            Pending
          </span>
        );
      case "failed":
        return (
          <span className={`${baseClasses} bg-red-100 text-red-700`}>
            Failed
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-gray-100 text-gray-700`}>
            {status}
          </span>
        );
    }
  };

  const formatActivityDate = (dateString: string) => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch (error) {
      return "";
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    if (filterType !== "all" && transaction.type !== filterType) return false;

    if (filterPeriod === "30days") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return new Date(transaction.createdAt) >= thirtyDaysAgo;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f6fc] to-white dark:from-zinc-950 dark:to-zinc-900">
      <PrivateHeader />
      <main className="max-w-6xl mx-auto px-4 pt-8 pb-16">
        {/* Current Balance Section */}
        <section className="mb-8">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-100 dark:bg-indigo-900 p-4 rounded-full">
                  <HugeiconsIcon
                    icon={Wallet01Icon}
                    className="text-3xl text-indigo-600 dark:text-indigo-300"
                  />
                </div>
                <div>
                  <div className="text-zinc-500 text-sm font-medium">
                    Current Balance
                  </div>
                  <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                    {credits} credits
                  </div>
                  {lastTransactionDate && (
                    <div className="text-sm text-zinc-400">
                      Last transaction: {lastTransactionDate}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 flex items-center gap-2">
                  <HugeiconsIcon
                    icon={BarChartIcon}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Estimated submissions left ~{estimatedSubmissions} videos
                  </span>
                </div>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg">
                      Buy Credits
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl w-full max-h-[95vh] overflow-y-auto">
                    <h3 className="text-xl font-bold mb-6">Credit Packages</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      {creditPackages.map((pkg) => {
                        const IconComponent = pkg.icon;
                        return (
                          <button
                            key={pkg.id}
                            className={`border rounded-xl p-4 flex flex-col items-center gap-3 transition-all ${
                              selected === pkg.id
                                ? "border-purple-500 ring-2 ring-purple-200 bg-purple-50"
                                : "border-zinc-200 dark:border-zinc-800 hover:border-purple-300"
                            } ${
                              pkg.recommended
                                ? "bg-purple-50 dark:bg-purple-900/20"
                                : ""
                            }`}
                            onClick={() => setSelected(pkg.id)}
                          >
                            {pkg.recommended && (
                              <span className="text-xs text-purple-600 font-semibold bg-purple-100 px-2 py-1 rounded-full">
                                RECOMMENDED
                              </span>
                            )}
                            <div
                              className={`w-12 h-12 ${pkg.bgColor} rounded-full flex items-center justify-center`}
                            >
                              <HugeiconsIcon
                                icon={IconComponent}
                                className={`w-6 h-6 ${pkg.textColor}`}
                              />
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
                                {pkg.name}
                              </div>
                              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                                {pkg.amount} credits
                              </div>
                              <div className="text-zinc-500 text-sm">
                                ${pkg.per.toFixed(2)} per credit
                              </div>
                              <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-2">
                                ${pkg.price.toFixed(2)}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <Button
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      disabled={selected === null}
                      onClick={() => setDialogOpen(false)}
                    >
                      Buy Now
                    </Button>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Credits Summary */}
            <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {totalPurchased}
                  </div>
                  <div className="text-sm text-zinc-500">Total Purchased</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {totalUsed}
                  </div>
                  <div className="text-sm text-zinc-500">Total Used</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">
                    {credits}
                  </div>
                  <div className="text-sm text-zinc-500">Current Balance</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Transaction History */}
        <section>
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg">
            <div className="p-4 sm:p-6 border-b border-zinc-200 dark:border-zinc-700">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                  Transaction History
                </h2>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-800"
                  >
                    <option value="all">All Types</option>
                    <option value="spend">Spent</option>
                    <option value="purchase">Purchased</option>
                    <option value="refund">Refunded</option>
                  </select>
                  <select
                    value={filterPeriod}
                    onChange={(e) => setFilterPeriod(e.target.value)}
                    className="px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-800"
                  >
                    <option value="all">All Time</option>
                    <option value="30days">Last 30 days</option>
                  </select>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-zinc-500">Loading transactions...</p>
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <p className="text-red-500 mb-2">Failed to load transactions</p>
                <p className="text-sm text-zinc-500">Please try again later</p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HugeiconsIcon
                    icon={Wallet01Icon}
                    className="w-8 h-8 text-zinc-400"
                  />
                </div>
                <p className="text-zinc-500 font-medium mb-2">
                  No transactions yet
                </p>
                <p className="text-sm text-zinc-400">
                  Your transaction history will appear here once you start using
                  credits
                </p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {getActivityIcon(transaction.type)}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                          {getActivityDescription(transaction)}
                        </div>
                        <div className="text-sm text-zinc-500">
                          {formatActivityDate(transaction.createdAt)}
                          {transaction.referenceType && (
                            <span className="ml-2 text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
                              {transaction.referenceType}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="text-right">
                        <div
                          className={`font-bold text-lg ${
                            transaction.amount >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatAmount(transaction.amount)} credits
                        </div>
                      </div>
                      <div className="flex justify-end sm:justify-start">
                        {getStatusBadge(transaction.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredTransactions.length > 0 && (
              <div className="p-4 border-t border-zinc-200 dark:border-zinc-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-sm text-zinc-500 text-center sm:text-left">
                  Showing {filteredTransactions.length} of {transactions.length}{" "}
                  transactions
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Button variant="outline" size="sm" disabled>
                    <HugeiconsIcon icon={ArrowLeftIcon} className="w-4 h-4" />
                  </Button>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-8 h-8 p-0 bg-purple-100 text-purple-700 border-purple-200"
                    >
                      1
                    </Button>
                    <Button variant="outline" size="sm" className="w-8 h-8 p-0">
                      2
                    </Button>
                    <Button variant="outline" size="sm" className="w-8 h-8 p-0">
                      3
                    </Button>
                  </div>
                  <Button variant="outline" size="sm">
                    <HugeiconsIcon icon={ArrowRightIcon} className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
