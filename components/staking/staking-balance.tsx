"use client";

import { formatSTXAmount } from "@/lib/staking-utils";

interface StakingBalanceProps {
  stakedBalance: number;
  totalStaked: number;
  isLoading: boolean;
}

export function StakingBalance({ stakedBalance, totalStaked, isLoading }: StakingBalanceProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg bg-gray-800 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/3 mb-2"></div>
          <div className="h-8 bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-gray-800 p-6">
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-400">Your Staked Balance</p>
          <p className="text-2xl font-bold text-white">
            {formatSTXAmount(stakedBalance * 1_000_000)} STX
          </p>
        </div>
        
        <div>
          <p className="text-sm text-gray-400">Total Staked in Contract</p>
          <p className="text-lg text-gray-300">
            {formatSTXAmount(totalStaked * 1_000_000)} STX
          </p>
        </div>
        
        {stakedBalance > 0 && (
          <div className="pt-2 border-t border-gray-700">
            <p className="text-xs text-gray-500">
              Your stake represents {((stakedBalance / totalStaked) * 100).toFixed(2)}% of total staked
            </p>
          </div>
        )}
      </div>
    </div>
  );
}