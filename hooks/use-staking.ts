import { useState, useEffect, useCallback } from "react";
import { useStacks } from "./use-stacks";
import {
  getStakedBalance,
  getTotalStaked,
  stakeSTX,
  unstakeSTX,
  unstakeAllSTX,
} from "@/lib/staking-contract";
import { getStakingErrorMessage } from "@/lib/staking-utils";

export interface StakingState {
  stakedBalance: number;
  totalStaked: number;
  isLoading: boolean;
  error: string | null;
  isStaking: boolean;
  isUnstaking: boolean;
}

export function useStaking() {
  const { userData } = useStacks();
  const [stakingState, setStakingState] = useState<StakingState>({
    stakedBalance: 0,
    totalStaked: 0,
    isLoading: false,
    error: null,
    isStaking: false,
    isUnstaking: false,
  });

  const userAddress = userData?.profile?.stxAddress?.testnet;

  // Fetch staking data
  const fetchStakingData = useCallback(async () => {
    if (!userAddress) return;

    setStakingState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const [stakedBalance, totalStaked] = await Promise.all([
        getStakedBalance(userAddress),
        getTotalStaked(),
      ]);

      setStakingState((prev) => ({
        ...prev,
        stakedBalance,
        totalStaked,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error fetching staking data:", error);
      setStakingState((prev) => ({
        ...prev,
        error: "Failed to fetch staking data",
        isLoading: false,
      }));
    }
  }, [userAddress]);

  // Stake STX
  const stake = useCallback(
    async (amount: number) => {
      if (!userData || !userAddress) {
        throw new Error("Wallet not connected");
      }

      setStakingState((prev) => ({ ...prev, isStaking: true, error: null }));

      try {
        // Import @stacks/connect for wallet transactions
        const { openContractCall } = await import("@stacks/connect");
        const { uintCV, PostConditionMode, AnchorMode } = await import(
          "@stacks/transactions"
        );
        const { STACKS_TESTNET } = await import("@stacks/network");

        const amountMicroSTX = Math.floor(amount * 1_000_000);

        const txOptions = {
          network: STACKS_TESTNET,
          contractAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
          contractName: "staking",
          functionName: "stake",
          functionArgs: [uintCV(amountMicroSTX)],
          postConditionMode: PostConditionMode.Allow,
          anchorMode: AnchorMode.Any,
          onFinish: async (data: any) => {
            console.log("Staking transaction completed:", data.txId);
            // Refresh staking data after successful stake
            await fetchStakingData();
            setStakingState((prev) => ({ ...prev, isStaking: false }));
          },
          onCancel: () => {
            console.log("Staking transaction cancelled");
            setStakingState((prev) => ({ ...prev, isStaking: false }));
          },
        };

        await openContractCall(txOptions);

        return { txid: "pending", error: false, reason: null };
      } catch (error: any) {
        const errorMessage =
          getStakingErrorMessage(error) || "Failed to stake STX";
        setStakingState((prev) => ({
          ...prev,
          error: errorMessage,
          isStaking: false,
        }));
        throw error;
      }
    },
    [userData, userAddress, fetchStakingData]
  );

  // Unstake STX
  const unstake = useCallback(
    async (amount: number) => {
      if (!userData || !userAddress) {
        throw new Error("Wallet not connected");
      }

      setStakingState((prev) => ({ ...prev, isUnstaking: true, error: null }));

      try {
        const { openContractCall } = await import("@stacks/connect");
        const { uintCV, PostConditionMode, AnchorMode } = await import(
          "@stacks/transactions"
        );
        const { STACKS_TESTNET } = await import("@stacks/network");

        const amountMicroSTX = Math.floor(amount * 1_000_000);

        const txOptions = {
          network: STACKS_TESTNET,
          contractAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
          contractName: "staking",
          functionName: "unstake",
          functionArgs: [uintCV(amountMicroSTX)],
          postConditionMode: PostConditionMode.Allow,
          anchorMode: AnchorMode.Any,
          onFinish: async (data: any) => {
            console.log("Unstaking transaction completed:", data.txId);
            await fetchStakingData();
            setStakingState((prev) => ({ ...prev, isUnstaking: false }));
          },
          onCancel: () => {
            console.log("Unstaking transaction cancelled");
            setStakingState((prev) => ({ ...prev, isUnstaking: false }));
          },
        };

        await openContractCall(txOptions);

        return { txid: "pending", error: false, reason: null };
      } catch (error: any) {
        const errorMessage =
          getStakingErrorMessage(error) || "Failed to unstake STX";
        setStakingState((prev) => ({
          ...prev,
          error: errorMessage,
          isUnstaking: false,
        }));
        throw error;
      }
    },
    [userData, userAddress, fetchStakingData]
  );

  // Unstake all STX
  const unstakeAll = useCallback(async () => {
    if (!userData || !userAddress) {
      throw new Error("Wallet not connected");
    }

    setStakingState((prev) => ({ ...prev, isUnstaking: true, error: null }));

    try {
      const { openContractCall } = await import("@stacks/connect");
      const { PostConditionMode, AnchorMode } = await import(
        "@stacks/transactions"
      );
      const { STACKS_TESTNET } = await import("@stacks/network");

      const txOptions = {
        network: STACKS_TESTNET,
        contractAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
        contractName: "staking",
        functionName: "unstake-all",
        functionArgs: [],
        postConditionMode: PostConditionMode.Allow,
        anchorMode: AnchorMode.Any,
        onFinish: async (data: unknown) => {
          console.log("Unstake all transaction completed:", data.txId);
          await fetchStakingData();
          setStakingState((prev) => ({ ...prev, isUnstaking: false }));
        },
        onCancel: () => {
          console.log("Unstake all transaction cancelled");
          setStakingState((prev) => ({ ...prev, isUnstaking: false }));
        },
      };

      await openContractCall(txOptions);

      return { txid: "pending", error: false, reason: null };
    } catch (error: unknown) {
      const errorMessage =
        getStakingErrorMessage(error) || "Failed to unstake all STX";
      setStakingState((prev) => ({
        ...prev,
        error: errorMessage,
        isUnstaking: false,
      }));
      throw error;
    }
  }, [userData, userAddress, fetchStakingData]);

  // Clear error
  const clearError = useCallback(() => {
    setStakingState((prev) => ({ ...prev, error: null }));
  }, []);

  // Fetch data when user address changes
  useEffect(() => {
    if (userAddress) {
      fetchStakingData();
    } else {
      // Reset state when user disconnects
      setStakingState({
        stakedBalance: 0,
        totalStaked: 0,
        isLoading: false,
        error: null,
        isStaking: false,
        isUnstaking: false,
      });
    }
  }, [userAddress, fetchStakingData]);

  return {
    ...stakingState,
    stake,
    unstake,
    unstakeAll,
    clearError,
    refreshData: fetchStakingData,
    isConnected: !!userData,
    userAddress,
  };
}
