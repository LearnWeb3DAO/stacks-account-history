"use client";

import {
  AnchorMode,
  PostConditionMode,
  bufferCV,
  ClarityType,
  standardPrincipalCV,
  stringUtf8CV,
  fetchCallReadOnlyFunction,
  type UIntCV,
  type TupleCV,
  type StringUtf8CV,
} from "@stacks/transactions";
import type { UserSession } from "@stacks/connect";
import { networkFromName, type StacksNetwork, type StacksNetworkName } from "@stacks/network";

type OpenContractCallOptions = Parameters<(typeof import("@stacks/connect"))["openContractCall"]>[0];

const DEFAULT_CONTRACT_ADDRESS =
  "ST1NA1KECSN6QSZQM652X5AEDKBR6RMEJ0JGCX99Q";

const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_ANNOTATIONS_CONTRACT_ADDRESS ?? DEFAULT_CONTRACT_ADDRESS;
const CONTRACT_NAME = process.env.NEXT_PUBLIC_ANNOTATIONS_CONTRACT_NAME ?? "transaction-annotations";
const NETWORK_ID = (process.env.NEXT_PUBLIC_STACKS_NETWORK ?? "testnet").toLowerCase();

const NETWORK_NAME: StacksNetworkName =
  NETWORK_ID === "testnet"
    ? "testnet"
    : NETWORK_ID === "devnet"
      ? "devnet"
      : NETWORK_ID === "mocknet"
        ? "mocknet"
        : "mainnet";

let cachedNetwork: StacksNetwork | null = null;
let maxNoteLengthCache: number | null = null;

function ensureContractConfigured() {
  if (!CONTRACT_ADDRESS) {
    throw new Error("Annotation contract address is not configured.");
  }
}

function getNetwork(): StacksNetwork {
  if (!cachedNetwork) {
    cachedNetwork = networkFromName(NETWORK_NAME);
  }

  return cachedNetwork;
}

function txIdToBufferCV(txId: string) {
  const normalized = txId.startsWith("0x") ? txId.slice(2) : txId;

  if (normalized.length !== 64) {
    throw new Error("Transaction ID must be a 32-byte hex string.");
  }

  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i += 1) {
    bytes[i] = Number.parseInt(normalized.slice(i * 2, i * 2 + 2), 16);
  }

  return bufferCV(bytes);
}

export async function fetchAnnotationNote(args: { ownerAddress: string; txId: string }): Promise<string | null> {
  ensureContractConfigured();

  const result = await fetchCallReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "get-note",
    functionArgs: [standardPrincipalCV(args.ownerAddress), txIdToBufferCV(args.txId)],
    senderAddress: args.ownerAddress,
    network: getNetwork(),
  });

  if (result.type === ClarityType.OptionalNone) {
    return null;
  }

  if (result.type !== ClarityType.OptionalSome) {
    throw new Error("Unexpected response from annotation contract.");
  }

  const tuple = result.value as TupleCV;
  const noteField = tuple.value.note;

  if (noteField.type !== ClarityType.StringUTF8) {
    throw new Error("Annotation note is not encoded as UTF-8 string.");
  }

  return (noteField as StringUtf8CV).value;
}

export async function fetchMaxNoteLength(): Promise<number> {
  if (maxNoteLengthCache !== null) {
    return maxNoteLengthCache;
  }

  ensureContractConfigured();

  const result = await fetchCallReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "get-max-note-length",
    functionArgs: [],
    senderAddress: CONTRACT_ADDRESS,
    network: getNetwork(),
  });

  if (result.type !== ClarityType.UInt) {
    throw new Error("Failed to read max note length from contract.");
  }

  const lengthCv = result as UIntCV;
  const length = Number(lengthCv.value.toString());
  maxNoteLengthCache = length;
  return length;
}

async function invokeContract(options: OpenContractCallOptions) {
  if (typeof window === "undefined") {
    throw new Error("Contract calls can only be initiated in the browser environment.");
  }

  const { openContractCall } = await import("@stacks/connect");

  return new Promise<void>((resolve, reject) => {
    openContractCall({
      ...options,
      onFinish: () => resolve(),
      onCancel: () => reject(new Error("User cancelled the transaction.")),
    }).catch((error) => {
      reject(error instanceof Error ? error : new Error("Failed to open contract call."));
    });
  });
}

export async function saveAnnotationNote(args: {
  txId: string;
  note: string;
  userSession: UserSession;
}): Promise<void> {
  ensureContractConfigured();

  if (!args.userSession) {
    throw new Error("Wallet session is not available.");
  }

  await invokeContract({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "set-note",
    functionArgs: [txIdToBufferCV(args.txId), stringUtf8CV(args.note)],
    userSession: args.userSession,
    network: getNetwork(),
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
  });
}

export async function clearAnnotationNote(args: {
  txId: string;
  userSession: UserSession;
}): Promise<void> {
  ensureContractConfigured();

  if (!args.userSession) {
    throw new Error("Wallet session is not available.");
  }

  await invokeContract({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "clear-note",
    functionArgs: [txIdToBufferCV(args.txId)],
    userSession: args.userSession,
    network: getNetwork(),
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
  });
}

export const ANNOTATIONS_CONTRACT = {
  address: CONTRACT_ADDRESS,
  name: CONTRACT_NAME,
};
