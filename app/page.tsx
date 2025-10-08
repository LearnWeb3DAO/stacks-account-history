"use client";

import { useStacks } from "@/hooks/use-stacks";
import { redirect } from "next/navigation";

export default function Home() {
  const { userData, network } = useStacks();

  if (!userData) {
    return (
      <main className="flex min-h-screen flex-col items-center gap-8 p-24">
        <span>Connect your wallet or search for an address</span>
      </main>
    );
  }

  // Redirect to the appropriate address based on the current network
  const address =
    network === "mainnet"
      ? userData.profile.stxAddress.mainnet
      : userData.profile.stxAddress.testnet;

  const query = network === "testnet" ? "?network=testnet" : "";
  redirect(`/${address}${query}`);
}