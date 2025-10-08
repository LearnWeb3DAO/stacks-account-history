"use client";

import { fetchAddressTransactions, type FetchAddressTransactionsResponse } from "@/lib/fetch-address-transactions";
import { TransactionDetail } from "./txn-details";
import { TransactionModal } from "./transaction-modal";
import { TransactionFiltersComponent, type TransactionFilters } from "./transaction-filters";
import { useNetwork } from "@/contexts/network-context";
import { useState, useMemo } from "react";

interface TransactionsListProps {
  address: string;
  transactions: FetchAddressTransactionsResponse;
  network: "mainnet" | "testnet"; // Now required
}

export function TransactionsList({ address, transactions, network: propNetwork }: TransactionsListProps) {
  const { network: contextNetwork, getApiUrl } = useNetwork();
  const network = propNetwork || contextNetwork; // Prefer prop network, fallback to context
  const [allTxns, setAllTxns] = useState(transactions);
  const [selectedTransaction, setSelectedTransaction] = useState<
    FetchAddressTransactionsResponse["results"][number] | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState<TransactionFilters>({
    txType: "all",
    status: "all",
    dateFrom: "",
    dateTo: "",
    minAmount: "",
    maxAmount: "",
    sortBy: "block_time",
    sortOrder: "desc",
  });

  const [txIdInput, setTxIdInput] = useState("");
  const [openByIdLoading, setOpenByIdLoading] = useState(false);
  const [openByIdError, setOpenByIdError] = useState<string | null>(null);

  // Load another 20 transactions
  async function loadMoreTxns() {
    try {
      const newTxns = await fetchAddressTransactions({
        address,
        offset: allTxns.offset + allTxns.limit,
        network,
      });

      setAllTxns({
        ...newTxns,
        results: [...allTxns.results, ...newTxns.results],
      });
    } catch (error) {
      console.error("Failed to load more transactions:", error);
    }
  }

  const openTransactionModal = (transaction: FetchAddressTransactionsResponse["results"][number]) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const closeTransactionModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
  };

  async function openByTxId() {
    if (!txIdInput) return;
    setOpenByIdError(null);
    setOpenByIdLoading(true);
    try {
      const url = `${getApiUrl()}/extended/v1/tx/${txIdInput}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: any = await res.json();
      const wrapped: any = {
        tx: {
          tx_id: data.tx_id,
          tx_status: data.tx_status ?? "pending",
          tx_type: data.tx_type ?? "token_transfer",
          nonce: data.nonce ?? 0,
          block_height: data.block_height ?? 0,
          block_time: data.block_time ?? Math.floor(Date.now() / 1000),
          block_hash: data.block_hash ?? "",
          parent_block_hash: data.parent_block_hash ?? "",
          token_transfer: data.token_transfer ?? { amount: "0", recipient_address: "" },
          contract_call: data.contract_call ?? { contract_id: data.contract_id ?? "", function_name: data.function_name ?? "" },
          smart_contract: data.smart_contract ?? { contract_id: data.contract_id ?? "", clarity_version: data.clarity_version ?? 3 },
          sender_address: data.sender_address ?? address,
        },
        stx_sent: "0",
        stx_received: "0",
      };
      openTransactionModal(wrapped);
    } catch (e: any) {
      setOpenByIdError(e?.message ?? "Failed to fetch tx");
    } finally {
      setOpenByIdLoading(false);
    }
  }

  // Filter and sort transactions
  const filteredAndSortedTxns = useMemo(() => {
    const filtered = allTxns.results.filter((tx) => {
      // Filter by transaction type
      if (filters.txType !== "all" && tx.tx.tx_type !== filters.txType) {
        return false;
      }

      // Filter by status
      if (filters.status !== "all") {
        const isSuccess = tx.tx.tx_status === "success";
        if (filters.status === "success" && !isSuccess) return false;
        if (filters.status === "failed" && isSuccess) return false;
      }

      // Filter by date range
      const txDate = new Date(tx.tx.block_time * 1000);
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        if (txDate < fromDate) return false;
      }
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999); // End of day
        if (txDate > toDate) return false;
      }

      // Filter by amount (only for token transfers)
      if (tx.tx.tx_type === "token_transfer" && (filters.minAmount || filters.maxAmount)) {
        const amount = Number.parseFloat(tx.tx.token_transfer.amount) / 1_000_000;
        if (filters.minAmount && amount < Number.parseFloat(filters.minAmount)) return false;
        if (filters.maxAmount && amount > Number.parseFloat(filters.maxAmount)) return false;
      }

      return true;
    });

    // Sort transactions
    filtered.sort((a, b) => {
      let aValue: number;
      let bValue: number;

      switch (filters.sortBy) {
        case "block_height":
          aValue = a.tx.block_height;
          bValue = b.tx.block_height;
          break;
        case "block_time":
          aValue = a.tx.block_time;
          bValue = b.tx.block_time;
          break;
        case "amount":
          aValue = a.tx.tx_type === "token_transfer" ? Number.parseFloat(a.tx.token_transfer.amount) / 1_000_000 : 0;
          bValue = b.tx.tx_type === "token_transfer" ? Number.parseFloat(b.tx.token_transfer.amount) / 1_000_000 : 0;
          break;
        default:
          aValue = a.tx.block_height;
          bValue = b.tx.block_height;
      }

      return filters.sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [allTxns.results, filters]);

  const resetFilters = () => {
    setFilters({
      txType: "all",
      status: "all",
      dateFrom: "",
      dateTo: "",
      minAmount: "",
      maxAmount: "",
      sortBy: "block_time",
      sortOrder: "desc",
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <input
          value={txIdInput}
          onChange={(e) => setTxIdInput(e.target.value)}
          placeholder="Paste a txid to open"
          className="border px-2 py-1 rounded w-full max-w-xl"
        />
        <button
          type="button"
          className="px-3 py-2 rounded bg-black text-white disabled:opacity-60"
          onClick={openByTxId}
          disabled={!txIdInput || openByIdLoading}
        >
          {openByIdLoading ? "Opening..." : "Open by TxID"}
        </button>
      </div>
      {openByIdError && (
        <div className="text-sm text-red-600">{openByIdError}</div>
      )}

      <TransactionFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        onReset={resetFilters}
        totalTransactions={allTxns.results.length}
        filteredCount={filteredAndSortedTxns.length}
        allTransactions={allTxns.results}
        filteredTransactions={filteredAndSortedTxns}
        address={address}
      />

      <div className="flex flex-col border rounded-md divide-y border-border divide-border">
        {filteredAndSortedTxns.length === 0 ? (
          <div className="p-8 text-center text-gray-500 bg-white">
            No transactions match your current filters on {network}.
          </div>
        ) : (
          filteredAndSortedTxns.map((tx) => (
            <div key={tx.tx.tx_id}>
              <TransactionDetail result={tx} onClick={() => openTransactionModal(tx)} network={network} />
            </div>
          ))
        )}
      </div>

      {filteredAndSortedTxns.length > 0 && allTxns.total > allTxns.results.length && (
        <button
          type="button"
          className="px-4 py-2 rounded-lg w-fit border border-border mx-auto text-center hover:bg-gray-100 bg-white text-black"
          onClick={loadMoreTxns}
        >
          Load More
        </button>
      )}

      <TransactionModal transaction={selectedTransaction} isOpen={isModalOpen} onClose={closeTransactionModal} />
    </div>
  );
}