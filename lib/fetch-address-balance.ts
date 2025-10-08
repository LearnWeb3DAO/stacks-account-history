interface FetchAddressBalanceArgs {
  address: string
  network?: "mainnet" | "testnet"
}

export interface AddressBalanceResponse {
  stx: {
    balance: string
    total_sent: string
    total_received: string
    total_fees_sent: string
    total_miner_rewards_received: string
    lock_tx_id: string
    locked: string
    lock_height: number
    burnchain_lock_height: number
    burnchain_unlock_height: number
  }
  fungible_tokens: Record<
    string,
    {
      balance: string
      total_sent: string
      total_received: string
    }
  >
  non_fungible_tokens: Record<
    string,
    {
      count: string
      total_sent: string
      total_received: string
    }
  >
}

export async function fetchAddressBalance({
  address,
  network = "mainnet",
}: FetchAddressBalanceArgs): Promise<AddressBalanceResponse> {
  const baseUrl = network === "testnet" ? "https://api.testnet.hiro.so" : "https://api.hiro.so"
  const url = `${baseUrl}/extended/v1/address/${address}/balances`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error("Failed to fetch address balance")
  }

  const data = await response.json()
  return data as AddressBalanceResponse
}
