import { fetchAddressTransactions } from "@/lib/fetch-address-transactions";
import { AddressBalance } from "../../components/address-balance";
import { TransactionsList } from "@/components/txns-list";
import { ExternalLinkIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export default async function Activity({
  params,
  searchParams,
}: {
  params: { address: string };
  searchParams: { network?: "mainnet" | "testnet" };
}) {
  const { address } = params;
  const { network = "mainnet" } = searchParams;

  let initialTransactions;
  let error = null;

  try {
    initialTransactions = await fetchAddressTransactions({ address, network });
  } catch (err) {
    console.error("Failed to fetch transactions:", err);
    error = "Unable to load transaction history. Please try again.";
  }

  const explorerUrl =
    network === "testnet"
      ? `https://explorer.hiro.so/address/${address}?chain=testnet`
      : `https://explorer.hiro.so/address/${address}`;

  // Ensure we always pass a safe structure to TransactionsList so the "Open by TxID" input is available
  const transactionsForList =
    initialTransactions ?? { results: [], limit: 0, offset: 0, total: 0 } as any;
  const isEmpty = !transactionsForList || transactionsForList.results.length === 0;

  return (
    <main className="flex h-[calc(100vh-4rem)] flex-col p-4 md:p-8 gap-6 md:gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold break-all">{address}</h1>
        <Link
          href={explorerUrl}
          target="_blank"
          className="rounded-lg flex gap-1 bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-fit"
        >
          <ExternalLinkIcon className="h-4 w-4" />
          <span className="hidden sm:inline">View on Hiro</span>
          <span className="sm:hidden">Hiro</span>
        </Link>
      </div>

      <section>
        <h2 className="text-lg md:text-xl font-semibold mb-4">Balance Overview</h2>
        <Suspense fallback={<div>Loading balance...</div>}>
          <AddressBalance address={address} />
        </Suspense>
      </section>

      <section>
        <h2 className="text-lg md:text-xl font-semibold mb-4">Transaction History</h2>
        {error ? (
          <div className="text-red-500 bg-white p-4 rounded-md">Error: {error}</div>
        ) : (
          <>
            {isEmpty && (
              <div className="text-gray-500 bg-white p-4 rounded-md mb-3">
                No transactions found for this address on {network}. You can open a transaction directly by TxID below.
              </div>
            )}
            <Suspense fallback={<div className="bg-white p-4 rounded-md">Loading transactions...</div>}>
              <TransactionsList address={address} transactions={transactionsForList} network={network} />
            </Suspense>
          </>
        )}
      </section>
    </main>
  );
}
      