import { callReadOnlyFunction, cvToJSON, bufferCV, principalCV, stringUtf8CV } from "@stacks/transactions";
import { openContractCall } from "@stacks/connect";
import { STACKS_MAINNET, STACKS_TESTNET, StacksNetwork } from "@stacks/network";

export type NetworkKey = "mainnet" | "testnet";

export function getContractForNetwork(network: NetworkKey): { address: string; name: string } | null {
  const id = network === "mainnet"
    ? process.env.NEXT_PUBLIC_TX_CATEGORIES_CONTRACT_MAINNET
    : process.env.NEXT_PUBLIC_TX_CATEGORIES_CONTRACT_TESTNET;
  if (!id) return null;
  const [address, name] = id.split(".");
  if (!address || !name) return null;
  return { address, name };
}

function getStacksNetwork(network: NetworkKey, apiUrl?: string): StacksNetwork {
  if (network === "mainnet") {
    return { ...STACKS_MAINNET, url: apiUrl ?? "https://api.hiro.so" } as StacksNetwork;
  }
  return { ...STACKS_TESTNET, url: apiUrl ?? "https://api.testnet.hiro.so" } as StacksNetwork;
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(clean.substr(i * 2, 2), 16);
  return out;
}

export async function getCategory(params: {
  owner: string;
  txidHex: string;
  network: NetworkKey;
  apiUrl?: string;
}): Promise<string | null> {
  const contract = getContractForNetwork(params.network);
  if (!contract) return null;
  const network = getStacksNetwork(params.network, params.apiUrl);
  const bytes = hexToBytes(params.txidHex);
  const txidCV = bufferCV(bytes);
  const result = await callReadOnlyFunction({
    contractAddress: contract.address,
    contractName: contract.name,
    functionName: "get-category",
    functionArgs: [principalCV(params.owner), txidCV],
    network,
    senderAddress: params.owner,
  });
  const json: any = cvToJSON(result);
  // Handle different cvToJSON optional shapes across versions
  // Possible variants: {type: 'optional', value: {type:'tuple', data:{category:{type:'string-utf8', value:'...'}}}}
  // or {type: 'optionalSome', value:{type:'tuple', value:{category:{type:'string-utf8', value:'...'}}}}
  // or {type: 'some', value:{...}} / {type: 'none'}
  const t = json?.type;
  if (!t) return null;
  const isNone = t === "none" || t === "optionalNone" || (t === "optional" && json.value == null);
  if (isNone) return null;

  const optVal = json.value ?? json; // in case type is 'some' and value sits at json.value
  const tuple = optVal?.value ?? optVal?.data ?? optVal; // cover {value:{}} or {data:{}}
  const categoryNode = tuple?.category ?? tuple?.data?.category;
  const catValue = categoryNode?.value ?? categoryNode; // some versions directly return string
  if (categoryNode && (categoryNode.type === "string-utf8" || typeof catValue === "string")) {
    return (categoryNode.type ? categoryNode.value : catValue) as string;
  }
  return null;
}

export async function setCategory(params: {
  txidHex: string;
  category: string;
  network: NetworkKey;
  apiUrl?: string;
  onFinish?: () => void;
  onCancel?: () => void;
}): Promise<void> {
  const contract = getContractForNetwork(params.network);
  if (!contract) throw new Error("Category contract ID not configured for network");
  const network = getStacksNetwork(params.network, params.apiUrl);
  const bytes = hexToBytes(params.txidHex);
  const txidCV = bufferCV(bytes);
  await openContractCall({
    contractAddress: contract.address,
    contractName: contract.name,
    functionName: "set-category",
    functionArgs: [txidCV, stringUtf8CV(params.category)],
    network,
    onFinish: () => params.onFinish?.(),
    onCancel: () => params.onCancel?.(),
  });
}
