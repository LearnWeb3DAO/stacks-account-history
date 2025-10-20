// Staking utility functions

export function formatSTXAmount(microSTX: number): string {
  const stx = microSTX / 1_000_000;
  return stx.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
}

export function parseSTXAmount(stxString: string): number {
  const stx = parseFloat(stxString);
  return Math.floor(stx * 1_000_000); // Convert to microSTX
}

export function validateStakeAmount(amount: string, maxAmount: number): string | null {
  const numAmount = parseFloat(amount);
  
  if (isNaN(numAmount) || numAmount <= 0) {
    return "Please enter a valid amount";
  }
  
  if (numAmount > maxAmount) {
    return `Amount exceeds available balance (${formatSTXAmount(maxAmount * 1_000_000)} STX)`;
  }
  
  if (numAmount < 0.000001) {
    return "Minimum stake amount is 0.000001 STX";
  }
  
  return null;
}

export function validateUnstakeAmount(amount: string, stakedAmount: number): string | null {
  const numAmount = parseFloat(amount);
  
  if (isNaN(numAmount) || numAmount <= 0) {
    return "Please enter a valid amount";
  }
  
  if (numAmount > stakedAmount) {
    return `Amount exceeds staked balance (${formatSTXAmount(stakedAmount * 1_000_000)} STX)`;
  }
  
  return null;
}

export function getStakingErrorMessage(errorCode: number): string {
  switch (errorCode) {
    case 100:
      return "Not authorized to perform this action";
    case 101:
      return "Insufficient balance to stake this amount";
    case 102:
      return "No staked tokens available to unstake";
    case 103:
      return "Invalid amount specified";
    default:
      return "An unknown error occurred";
  }
}

export function isStakingTransaction(txType: string, contractCall?: any): boolean {
  if (txType !== "contract_call") return false;
  
  if (!contractCall) return false;
  
  const isStakingContract = contractCall.contract_id?.includes("staking");
  const isStakingFunction = ["stake", "unstake", "unstake-all"].includes(
    contractCall.function_name
  );
  
  return isStakingContract && isStakingFunction;
}

export function getStakingTransactionType(functionName: string): string {
  switch (functionName) {
    case "stake":
      return "Stake STX";
    case "unstake":
      return "Unstake STX";
    case "unstake-all":
      return "Unstake All STX";
    default:
      return "Staking Transaction";
  }
}