"use client";

import type { FetchAddressTransactionsResponse, Transaction } from "@/lib/fetch-address-transactions";
import { abbreviateTxnId, abbreviateAddress } from "@/lib/stx-utils";
import {
  ActivityIcon,
  ArrowLeftRightIcon,
  BlocksIcon,
  CodeSquareIcon,
  FunctionSquareIcon,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

interface TransactionDetailProps {
  result: FetchAddressTransactionsResponse["results"][number];
  onClick?: () => void;
  network: "mainnet" | "testnet";
}

type TransactionInformationByType = {
  primaryTitle: string;
  secondaryTitle: string;
  tags: string[];
};

const TxTypeIcon: Record<Transaction["tx_type"], LucideIcon> = {
  coinbase: BlocksIcon,
  token_transfer: ArrowLeftRightIcon,
  smart_contract: CodeSquareIcon,
  contract_call: FunctionSquareIcon,
  poison_microblock: ActivityIcon,
};

function getTransactionInformationByType(result: TransactionDetailProps["result"]): TransactionInformationByType {
  if (result.tx.tx_type === "coinbase") {
    return {
      primaryTitle: `Block #${result.tx.block_height}`,
      secondaryTitle: "",
      tags: ["Coinbase"],
    };
  }

  if (result.tx.tx_type === "token_transfer") {
    return {
      primaryTitle: `Transfer ${(Number.parseFloat(result.tx.token_transfer.amount) / 1_000_000).toFixed(2)} STX`,
      secondaryTitle: "",
      tags: ["Token Transfer"],
    };
  }

  if (result.tx.tx_type === "smart_contract") {
    return {
      primaryTitle: result.tx.smart_contract.contract_id,
      secondaryTitle: "",
      tags: ["Contract Deployment"],
    };
  }

  if (result.tx.tx_type === "contract_call") {
    return {
      primaryTitle: result.tx.contract_call.function_name,
      secondaryTitle: result.tx.contract_call.contract_id.split(".")[1],
      tags: ["Contract Call"],
    };
  }

  if (result.tx.tx_type === "poison_microblock") {
    return {
      primaryTitle: "Microblock",
      secondaryTitle: "",
      tags: ["Microblock"],
    };
  }

  return {
    primaryTitle: "",
    secondaryTitle: "",
    tags: [],
  };
}

export function TransactionDetail({ result, onClick, network }: TransactionDetailProps) {
  const Icon = TxTypeIcon[result.tx.tx_type];
  const { primaryTitle, secondaryTitle, tags } = getTransactionInformationByType(result);
  const explorerUrl = `https://explorer.hiro.so/txid/${result.tx.tx_id}${network === "testnet" ? "?chain=testnet" : ""}`;

  return (
    <div
      className="flex items-center p-3 md:p-4 border-l-2 border-transparent hover:border-blue-500 transition-all justify-between cursor-pointer bg-white text-black hover:bg-gray-100"
      onClick={onClick}
    >
      <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
        <Icon className="h-8 w-8 md:h-10 md:w-10 rounded-full p-2 border border-gray-300 flex-shrink-0" />

        <div className="flex flex-col gap-1 md:gap-2 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm md:text-base truncate">{primaryTitle}</span>
            {secondaryTitle && (
              <span className="text-gray-600 text-sm hidden sm:inline">({secondaryTitle})</span>
            )}
          </div>
          <div className="flex items-center gap-1 font-bold text-xs text-gray-600">
            {tags.map((tag) => (
              <span key={tag} className="hidden sm:inline">
                {tag}
              </span>
            ))}
            <span className="hidden sm:inline">•</span>
            <span className="font-normal">
              By{" "}
              <Link
                href={`/${result.tx.sender_address}?network=${network}`}
                className="hover:underline transition-all"
                onClick={(e) => e.stopPropagation()}
              >
                {abbreviateAddress(result.tx.sender_address)}
              </Link>
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 md:gap-2 text-xs md:text-sm flex-shrink-0">
        <div className="flex items-center gap-1 md:gap-2">
          <Link
            href={explorerUrl}
            className="hover:underline transition-all hidden sm:inline"
            onClick={(e) => e.stopPropagation()}
          >
            {abbreviateTxnId(result.tx.tx_id)}
          </Link>
          <span className="hidden sm:inline">•</span>
          <span suppressHydrationWarning>
            {new Date(result.tx.block_time * 1000).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}
          </span>
        </div>

        <div className="flex items-center gap-1 font-bold text-xs text-gray-600">
          <span className="hidden md:inline">Block #{result.tx.block_height}</span>
          <span className="md:hidden">#{result.tx.block_height}</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">Nonce {result.tx.nonce}</span>
        </div>
      </div>
    </div>
  );
}