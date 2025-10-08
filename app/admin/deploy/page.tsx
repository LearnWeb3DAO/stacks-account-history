"use client";

import { useStacks } from "@/hooks/use-stacks";
import { useNetwork } from "@/contexts/network-context";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { openContractDeploy } from "@stacks/connect";
import { STACKS_TESTNET } from "@stacks/network";
import { useMemo, useState, useEffect } from "react";

// Clarity contract source to deploy (tx-categories)
const DEFAULT_NAME_PREFIX = "tx-categories";
const CONTRACT_SOURCE = `(define-map categories
  { owner: principal, txid: (buff 32) }
  { category: (string-utf8 32) }
)

(define-read-only (get-category (owner principal) (txid (buff 32)))
  (map-get? categories { owner: owner, txid: txid })
)

(define-public (set-category (txid (buff 32)) (category (string-utf8 32)))
  (begin
    (map-set categories { owner: tx-sender, txid: txid } { category: category })
    (ok true)
  )
)
`;

export default function DeployPage() {
  const { userData, connectWallet, network } = useStacks();
  const { getApiUrl } = useNetwork();
  const [submitting, setSubmitting] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);
  const [contractName, setContractName] = useState<string>("");

  useEffect(() => {
    // Generate a unique default once on mount
    setContractName(`${DEFAULT_NAME_PREFIX}-${Date.now()}`);
  }, []);

  const testnetAddress = useMemo(() => {
    if (!userData) return null;
    return userData.profile.stxAddress.testnet;
  }, [userData]);

  const expectedContractId = useMemo(() => {
    if (!testnetAddress) return null;
    const name = (contractName || DEFAULT_NAME_PREFIX).trim();
    return `${testnetAddress}.${name}`;
  }, [testnetAddress, contractName]);

  const canDeploy = network === "testnet" && !!userData;

  const handleDeploy = async () => {
    if (!canDeploy) return;
    setSubmitting(true);
    try {
      const stacksNetwork = { ...STACKS_TESTNET, url: getApiUrl() } as any;
      await openContractDeploy({
        contractName: (contractName || DEFAULT_NAME_PREFIX).trim(),
        codeBody: CONTRACT_SOURCE,
        network: stacksNetwork,
        onFinish: (data) => {
          try {
            // @ts-ignore
            setTxId(data?.txId ?? null);
          } catch {}
          setSubmitting(false);
        },
        onCancel: () => setSubmitting(false),
      });
    } catch (e) {
      setSubmitting(false);
    }
  };

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Deploy tx-categories to Testnet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!userData ? (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Connect your wallet to deploy the contract.</p>
              <Button onClick={connectWallet}>Connect Wallet</Button>
            </div>
          ) : (
            <>
              {network !== "testnet" && (
                <div className="text-sm text-red-600">Switch network to Testnet using the network toggle before deploying.</div>
              )}
              <div className="text-sm">
                <label className="block mb-2">
                  <span className="mr-2">Contract name:</span>
                  <input
                    value={contractName}
                    onChange={(e) => setContractName(e.target.value)}
                    className="border px-2 py-1 rounded w-full max-w-sm"
                    placeholder={`${DEFAULT_NAME_PREFIX}-unique`}
                  />
                </label>
                <div>
                  Expected Contract ID:&nbsp;
                  <code>{expectedContractId ?? "(connect wallet)"}</code>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Network: <code>{network}</code> • API: <code>{getApiUrl()}</code>
                </div>
                {testnetAddress && (
                  <div className="mt-2 flex items-center gap-2">
                    <span>Need testnet STX?</span>
                    <a
                      href={`https://explorer.hiro.so/faucet?chain=testnet&address=${testnetAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex"
                    >
                      <Button type="button" variant="outline" size="sm">Open Faucet</Button>
                    </a>
                  </div>
                )}
                {txId && (
                  <div className="mt-2">
                    Submitted TxID: <code className="break-all">{txId}</code>
                  </div>
                )}
              </div>
              <div className="flex justify-end">
                <Button onClick={handleDeploy} disabled={!canDeploy || submitting}>
                  {submitting ? "Confirm in Wallet..." : "Deploy to Testnet"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
