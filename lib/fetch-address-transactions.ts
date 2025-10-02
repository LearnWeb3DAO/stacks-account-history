const STACKS_NETWORK = (process.env.NEXT_PUBLIC_STACKS_NETWORK ?? "testnet").toLowerCase();

const DEFAULT_HIRO_API_BY_NETWORK: Record<string, string> = {
  mainnet: "https://api.hiro.so",
  testnet: "https://api.testnet.hiro.so",
  devnet: "http://localhost:3999",
  mocknet: "http://localhost:3999",
};

const HIRO_API_BASE_URL =
  process.env.NEXT_PUBLIC_HIRO_API_BASE_URL ??
  DEFAULT_HIRO_API_BY_NETWORK[STACKS_NETWORK] ??
  DEFAULT_HIRO_API_BY_NETWORK.mainnet;

interface FetchAddressTransactionsArgs {
  address: string;
  offset?: number;
}

export interface FetchAddressTransactionsResponse {
  limit: number;
  offset: number;
  total: number;
  results: Array<{
    tx: Transaction;
    stx_sent: string;
    stx_received: string;
    events: {
      stx: TransactionEvent;
      ft: TransactionEvent;
      nft: TransactionEvent;
    };
  }>;
}

interface BaseTransaction {
  tx_id: string;
  nonce: number;
  sender_address: string;
  block_hash: string;
  parent_block_hash: string;
  block_height: number;
  block_time: number;
  tx_status: string;
  tx_type:
    | "coinbase"
    | "token_transfer"
    | "smart_contract"
    | "contract_call"
    | "poison_microblock";
}

interface CoinbaseTransaction extends BaseTransaction {
  tx_type: "coinbase";
}

interface TokenTransferTransaction extends BaseTransaction {
  tx_type: "token_transfer";
  token_transfer: {
    recipient_address: string;
    amount: string;
  };
}

interface SmartContractTransaction extends BaseTransaction {
  tx_type: "smart_contract";
  smart_contract: {
    clarity_version: number;
    contract_id: string;
  };
}

interface ContractCallTransaction extends BaseTransaction {
  tx_type: "contract_call";
  contract_call: {
    contract_id: string;
    function_name: string;
  };
}

interface PoisonMicroblockTransaction extends BaseTransaction {
  tx_type: "poison_microblock";
}

export type Transaction =
  | CoinbaseTransaction
  | TokenTransferTransaction
  | SmartContractTransaction
  | ContractCallTransaction
  | PoisonMicroblockTransaction;

interface TransactionEvent {
  transfer: number;
  mint: number;
  burn: number;
}

export async function fetchAddressTransactions({
  address,
  offset = 0,
}: FetchAddressTransactionsArgs): Promise<FetchAddressTransactionsResponse> {
  const url = `${HIRO_API_BASE_URL}/extended/v2/addresses/${address}/transactions?limit=20&offset=${offset}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch address transactions");
  }

  const data = await response.json();
  return data as FetchAddressTransactionsResponse;
}
