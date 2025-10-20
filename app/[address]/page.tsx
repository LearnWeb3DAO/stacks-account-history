"use client";

import { useState, useEffect } from "react";
import { TransactionsList } from "@/components/txns-list";
import { StakingTab } from "@/components/staking/staking-tab";
import { fetchAddressTransactions } from "@/lib/fetch-address-transactions";
import { ExternalLinkIcon } from "lucide-react";
import Link from "next/link";

type TabType = "transactions" | "staking";

export default function Activity({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const [resolvedParams, setResolvedParams] = useState<{ address: string } | null>(null);

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  const address = resolvedParams?.address;
  const [activeTab, setActiveTab] = useState<TabType>("transactions");
  const [initialTransactions, setInitialTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial transactions
  useEffect(() => {
    if (!address) return;

    const loadTransactions = async () => {
      try {
        const transactions = await fetchAddressTransactions({ address });
        setInitialTransactions(transactions);
      } catch (error) {
        console.error("Failed to load transactions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();
  }, [address]);

  if (!address) {
    return (
      <main className="flex h-[100vh-4rem] flex-col p-8 gap-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-[100vh-4rem] flex-col p-8 gap-8">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold">{address}</h1>
        <Link
          href={`https://explorer.hiro.so/address/${address}`}
          target="_blank"
          className="rounded-lg flex gap-1 bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <ExternalLinkIcon className="h-4 w-4" />
          View on Hiro
        </Link>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("transactions")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "transactions"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
              }`}
          >
            Transactions
          </button>
          <button
            onClick={() => setActiveTab("staking")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "staking"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
              }`}
          >
            Staking
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {activeTab === "transactions" && (
          <>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <TransactionsList address={address} transactions={initialTransactions} />
            )}
          </>
        )}

        {activeTab === "staking" && <StakingTab />}
      </div>
    </main>
  );
}
