"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, ExternalLink, Clock, Hash, User, Blocks, Coins } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import type { FetchAddressTransactionsResponse } from "@/lib/fetch-address-transactions"
import { abbreviateTxnId } from "@/lib/stx-utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useStacks } from "@/hooks/use-stacks"
import { useNetwork } from "@/contexts/network-context"
import { getCategory, setCategory } from "@/lib/tx-categories"

interface TransactionModalProps {
  transaction: FetchAddressTransactionsResponse["results"][number] | null
  isOpen: boolean
  onClose: () => void
}

export function TransactionModal({ transaction, isOpen, onClose }: TransactionModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)
  
  const [category, setCategoryLocal] = useState<string>("")
  const [loadingCategory, setLoadingCategory] = useState<boolean>(false)
  const [savingCategory, setSavingCategory] = useState<boolean>(false)
  const [testReading, setTestReading] = useState<boolean>(false)
  const [testReadValue, setTestReadValue] = useState<string | null>(null)
  const [testReadError, setTestReadError] = useState<string | null>(null)
  const { userData, connectWallet, network } = useStacks()
  const { getApiUrl } = useNetwork()

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const handleTestRead = async () => {
    if (!transaction || !ownerAddress) return
    try {
      setTestReadError(null)
      setTestReadValue(null)
      setTestReading(true)
      const val = await getCategory({
        owner: ownerAddress,
        txidHex: transaction.tx.tx_id,
        network,
        apiUrl: getApiUrl(),
      })
      setTestReadValue(val ?? null)
    } catch (e: any) {
      setTestReadError(e?.message ?? 'Failed to read')
    } finally {
      setTestReading(false)
    }
  }


  const handleSaveCategory = async () => {
    if (!transaction || !category) return
    try {
      setSavingCategory(true)
      await setCategory({
        txidHex: transaction.tx.tx_id,
        category,
        network,
        apiUrl: getApiUrl(),
        onFinish: () => setSavingCategory(false),
        onCancel: () => setSavingCategory(false),
      })
    } catch (e) {
      setSavingCategory(false)
    }
  }
  const ownerAddress = useMemo(() => {
    if (!userData) return null
    return network === "mainnet" ? userData.profile.stxAddress.mainnet : userData.profile.stxAddress.testnet
  }, [userData, network])

  

  // Load category
  useEffect(() => {
    let cancelled = false
    async function fetchCategory() {
      if (!isOpen || !transaction || !ownerAddress) {
        setCategoryLocal("")
        return
      }
      try {
        setLoadingCategory(true)
        const existing = await getCategory({
          owner: ownerAddress,
          txidHex: transaction.tx.tx_id,
          network,
          apiUrl: getApiUrl(),
        })
        if (!cancelled) setCategoryLocal(existing ?? "")
      } catch (e) {
        if (!cancelled) setCategoryLocal("")
      } finally {
        if (!cancelled) setLoadingCategory(false)
      }
    }
    fetchCategory()
    return () => {
      cancelled = true
    }
  }, [isOpen, transaction?.tx.tx_id, ownerAddress, network, getApiUrl])

  

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "abort_by_response":
      case "abort_by_post_condition":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "token_transfer":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "contract_call":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "smart_contract":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "coinbase":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  if (!transaction) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Hash className="h-4 w-4 md:h-5 md:w-5" />
            Transaction Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 md:space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Transaction ID</label>
                  <div className="flex items-center gap-2">
                    <code className="text-xs md:text-sm bg-muted px-2 py-1 rounded flex-1 break-all">
                      {transaction.tx.tx_id}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(transaction.tx.tx_id, "tx_id")}
                      className="flex-shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                      <span className="hidden sm:inline ml-1">{copiedField === "tx_id" ? "Copied!" : "Copy"}</span>
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <Badge className={getStatusColor(transaction.tx.tx_status)}>{transaction.tx.tx_status}</Badge>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Type</label>
                  <Badge className={getTypeColor(transaction.tx.tx_type)}>
                    {transaction.tx.tx_type.replace("_", " ")}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Nonce</label>
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span>{transaction.tx.nonce}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        {/* Category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Transaction Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!ownerAddress ? (
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground">Connect your wallet to categorize this transaction.</span>
                <Button onClick={connectWallet} variant="default">Connect Wallet</Button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="min-w-56">
                    <Select value={category} onValueChange={setCategoryLocal}>
                      <SelectTrigger className="w-56">
                        <SelectValue placeholder={loadingCategory ? "Loading..." : "Select a category"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Income">Income</SelectItem>
                        <SelectItem value="Expense">Expense</SelectItem>
                        <SelectItem value="Transfer">Transfer</SelectItem>
                        <SelectItem value="Investment">Investment</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleSaveCategory} disabled={savingCategory || loadingCategory || !category}>
                    {savingCategory ? "Waiting for wallet..." : category ? `Save "${category}"` : "Select category"}
                  </Button>
                  <Button variant="outline" onClick={handleTestRead} disabled={testReading || !ownerAddress}>
                    {testReading ? "Reading..." : "Test read"}
                  </Button>
                </div>
                {(testReadValue !== null || testReadError) && (
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Read result:</span>{" "}
                    {testReadError ? (
                      <span className="text-red-600">{testReadError}</span>
                    ) : (
                      <code>{testReadValue ?? "(none)"}</code>
                    )}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

          {/* Block Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-lg flex items-center gap-2">
                <Blocks className="h-4 w-4 md:h-5 md:w-5" />
                Block Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Block Height</label>
                  <div className="flex items-center gap-2">
                    <Blocks className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono">{transaction.tx.block_height}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Block Time</label>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{formatDate(transaction.tx.block_time)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Block Hash</label>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-muted px-2 py-1 rounded flex-1 break-all">
                      {abbreviateTxnId(transaction.tx.block_hash)}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(transaction.tx.block_hash, "block_hash")}
                      className="flex-shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                      <span className="hidden sm:inline ml-1">{copiedField === "block_hash" ? "Copied!" : "Copy"}</span>
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Parent Block Hash</label>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-muted px-2 py-1 rounded flex-1 break-all">
                      {abbreviateTxnId(transaction.tx.parent_block_hash)}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(transaction.tx.parent_block_hash, "parent_block_hash")}
                      className="flex-shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                      <span className="hidden sm:inline ml-1">
                        {copiedField === "parent_block_hash" ? "Copied!" : "Copy"}
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sender Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-lg flex items-center gap-2">
                <User className="h-4 w-4 md:h-5 md:w-5" />
                Sender Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Sender Address</label>
                <div className="flex items-center gap-2">
                  <code className="text-xs md:text-sm bg-muted px-2 py-1 rounded flex-1 break-all">
                    {transaction.tx.sender_address}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(transaction.tx.sender_address, "sender_address")}
                    className="flex-shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                    <span className="hidden sm:inline ml-1">
                      {copiedField === "sender_address" ? "Copied!" : "Copy"}
                    </span>
                  </Button>
                  <Link href={`/${transaction.tx.sender_address}`}>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaction-specific details */}
          {transaction.tx.tx_type === "token_transfer" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <Coins className="h-4 w-4 md:h-5 md:w-5" />
                  Token Transfer Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Recipient</label>
                    <div className="flex items-center gap-2">
                      <code className="text-xs md:text-sm bg-muted px-2 py-1 rounded flex-1 break-all">
                        {transaction.tx.token_transfer.recipient_address}
                      </code>
                      <Link href={`/${transaction.tx.token_transfer.recipient_address}`}>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Amount</label>
                    <div className="flex items-center gap-2">
                      <Coins className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono text-lg">
                        {(Number.parseFloat(transaction.tx.token_transfer.amount) / 1_000_000).toFixed(6)} STX
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {transaction.tx.tx_type === "contract_call" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">Contract Call Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Contract ID</label>
                    <code className="text-xs md:text-sm bg-muted px-2 py-1 rounded block break-all">
                      {transaction.tx.contract_call.contract_id}
                    </code>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Function Name</label>
                    <code className="text-xs md:text-sm bg-muted px-2 py-1 rounded block">
                      {transaction.tx.contract_call.function_name}
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {transaction.tx.tx_type === "smart_contract" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">Smart Contract Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Contract ID</label>
                    <code className="text-xs md:text-sm bg-muted px-2 py-1 rounded block break-all">
                      {transaction.tx.smart_contract.contract_id}
                    </code>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Clarity Version</label>
                    <span>{transaction.tx.smart_contract.clarity_version}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* STX Events */}
          {(transaction.stx_sent !== "0" || transaction.stx_received !== "0") && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <Coins className="h-4 w-4 md:h-5 md:w-5" />
                  STX Events
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {transaction.stx_sent !== "0" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">STX Sent</label>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-red-600">
                          -{(Number.parseFloat(transaction.stx_sent) / 1_000_000).toFixed(6)} STX
                        </span>
                      </div>
                    </div>
                  )}

                  {transaction.stx_received !== "0" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">STX Received</label>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-green-600">
                          +{(Number.parseFloat(transaction.stx_received) / 1_000_000).toFixed(6)} STX
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

        

        {/* External Links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">External Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Link
                href={`https://explorer.hiro.so/txid/${transaction.tx.tx_id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="flex items-center gap-2 text-sm bg-transparent">
                  <ExternalLink className="h-4 w-4" />
                  <span className="hidden sm:inline">View on Hiro Explorer</span>
                  <span className="sm:hidden">Hiro Explorer</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
