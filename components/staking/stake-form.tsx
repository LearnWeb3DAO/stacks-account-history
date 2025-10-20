"use client";

import { useState } from "react";
import { validateStakeAmount } from "@/lib/staking-utils";

interface StakeFormProps {
  onStake: (amount: number) => Promise<void>;
  isStaking: boolean;
  maxAmount: number; // Available STX balance
}

export function StakeForm({ onStake, isStaking, maxAmount }: StakeFormProps) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateStakeAmount(amount, maxAmount);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setError(null);
      await onStake(parseFloat(amount));
      setAmount(""); // Clear form on success
    } catch (error: any) {
      setError(error.message || "Failed to stake STX");
    }
  };

  const handleMaxClick = () => {
    setAmount(maxAmount.toString());
    setError(null);
  };

  return (
    <div className="rounded-lg bg-gray-800 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Stake STX</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="stake-amount" className="block text-sm font-medium text-gray-300 mb-2">
            Amount to Stake
          </label>
          <div className="relative">
            <input
              id="stake-amount"
              type="number"
              step="0.000001"
              min="0"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError(null);
              }}
              placeholder="0.000000"
              className="w-full rounded-lg bg-gray-700 px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isStaking}
            />
            <button
              type="button"
              onClick={handleMaxClick}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-blue-400 hover:text-blue-300"
              disabled={isStaking}
            >
              MAX
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Available: {maxAmount.toFixed(6)} STX
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-900/20 border border-red-500/20 p-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isStaking || !amount || parseFloat(amount) <= 0}
          className="w-full rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isStaking ? "Staking..." : "Stake STX"}
        </button>
      </form>
    </div>
  );
}