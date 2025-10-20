"use client";

import { useStaking } from "@/hooks/use-staking";
import { StakingBalance } from "./staking-balance";
import { StakeForm } from "./stake-form";
import { UnstakeForm } from "./unstake-form";

export function StakingTab() {
  const {
    stakedBalance,
    totalStaked,
    isLoading,
    error,
    isStaking,
    isUnstaking,
    stake,
    unstake,
    unstakeAll,
    clearError,
    isConnected,
  } = useStaking();

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">
            Connect your Stacks wallet to start staking STX tokens.
          </p>
          <div className="rounded-lg bg-gray-800 p-6">
            <p className="text-sm text-gray-500">
              Use the "Connect Wallet&quot; button in the navigation bar to get started.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="rounded-lg bg-red-900/20 border border-red-500/20 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-400">{error}</p>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-300 text-sm"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Staking Balance Overview */}
      <StakingBalance
        stakedBalance={stakedBalance}
        totalStaked={totalStaked}
        isLoading={isLoading}
      />

      {/* Staking Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StakeForm
          onStake={stake}
          isStaking={isStaking}
          maxAmount={100} // Temporary higher limit for testing - will be replaced with real wallet balance
        />
        
        <UnstakeForm
          onUnstake={unstake}
          onUnstakeAll={unstakeAll}
          isUnstaking={isUnstaking}
          stakedAmount={stakedBalance}
        />
      </div>

      {/* Info Section */}
      <div className="rounded-lg bg-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-3">How Staking Works</h3>
        <div className="space-y-2 text-sm text-gray-300">
          <p>• Stake your STX tokens to participate in the staking contract</p>
          <p>• Your tokens are locked in the smart contract while staked</p>
          <p>• You can unstake partial or all amounts at any time</p>
          <p>• Only you can unstake your own staked tokens</p>
        </div>
      </div>
    </div>
  );
}