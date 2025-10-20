"use client";

import { useState } from "react";
import { validateUnstakeAmount, formatSTXAmount } from "@/lib/staking-utils";

interface UnstakeFormProps {
  onUnstake: (amount: number) => Promise<void>;
  onUnstakeAll: () => Promise<void>;
  isUnstaking: boolean;
  stakedAmount: number;
}

export function UnstakeForm({ onUnstake, onUnstakeAll, isUnstaking, stakedAmount }: UnstakeFormProps) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateUnstakeAmount(amount, stakedAmount);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setError(null);
      await onUnstake(parseFloat(amount));
      setAmount(""); // Clear form on success
    } catch (error: any) {
      setError(error.message || "Failed to unstake STX");
    }
  };

  const handleUnstakeAll = async () => {
    try {
      setError(null);
      await onUnstakeAll();
      setAmount("");
    } catch (error: any) {
      setError(error.message || "Failed to unstake all STX");
    }
  };

  const handleMaxClick = () => {
    setAmount(stakedAmount.toString());
    setError(null);
  };

  if (stakedAmount === 0) {
    return (
      <div className="rounded-lg bg-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Unstake STX</h3>
        <p className="text-gray-400 text-center py-8">
          No STX tokens staked. Stake some tokens first to unstake them.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-gray-800 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Unstake STX</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="unstake-amount" className="block text-sm font-medium text-gray-300 mb-2">
            Amount to Unstake
          </label>
          <div className="relative">
            <input
              id="unstake-amount"
              type="number"
              step="0.000001"
              min="0"
              max={stakedAmount}
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError(null);
              }}
              placeholder="0.000000"
              className="w-full rounded-lg bg-gray-700 px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isUnstaking}
            />
            <button
              type="button"
              onClick={handleMaxClick}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-blue-400 hover:text-blue-300"
              disabled={isUnstaking}
            >
              MAX
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Staked: {formatSTXAmount(stakedAmount * 1_000_000)} STX
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-900/20 border border-red-500/20 p-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isUnstaking || !amount || parseFloat(amount) <= 0}
            className="flex-1 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUnstaking ? "Unstaking..." : "Unstake"}
          </button>
          
          <button
            type="button"
            onClick={handleUnstakeAll}
            disabled={isUnstaking}
            className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUnstaking ? "Unstaking..." : "Unstake All"}
          </button>
        </div>
      </form>
    </div>
  );
}