"use client"

import { useEffect, useState } from "react"
import { fetchAddressBalance, type AddressBalanceResponse } from "@/lib/fetch-address-balance"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Coins, TrendingUp, TrendingDown } from "lucide-react"
import { useNetwork } from "@/contexts/network-context"

interface AddressBalanceProps {
  address: string
}

export function AddressBalance({ address }: AddressBalanceProps) {
  const [balance, setBalance] = useState<AddressBalanceResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { network } = useNetwork()

  useEffect(() => {
    async function loadBalance() {
      try {
        setLoading(true)
        const balanceData = await fetchAddressBalance({ address, network })
        setBalance(balanceData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load balance")
      } finally {
        setLoading(false)
      }
    }

    loadBalance()
  }, [address, network])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-20"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-32 mb-2"></div>
              <div className="h-3 bg-muted rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error || !balance) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <p className="text-destructive text-sm">{error || "Failed to load balance information"}</p>
        </CardContent>
      </Card>
    )
  }

  // Convert microSTX to STX (1 STX = 1,000,000 microSTX)
  const stxBalance = (Number.parseInt(balance.stx.balance) / 1_000_000).toFixed(6)
  const totalReceived = (Number.parseInt(balance.stx.total_received) / 1_000_000).toFixed(6)
  const totalSent = (Number.parseInt(balance.stx.total_sent) / 1_000_000).toFixed(6)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">STX Balance</CardTitle>
          <Coins className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stxBalance} STX</div>
          {balance.stx.locked !== "0" && (
            <p className="text-xs text-muted-foreground">
              {(Number.parseInt(balance.stx.locked) / 1_000_000).toFixed(6)} STX locked
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Received</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{totalReceived} STX</div>
          <p className="text-xs text-muted-foreground">All time received</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{totalSent} STX</div>
          <p className="text-xs text-muted-foreground">All time sent</p>
        </CardContent>
      </Card>

      {/* Show fungible tokens if any */}
      {Object.keys(balance.fungible_tokens).length > 0 && (
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Fungible Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(balance.fungible_tokens).map(([token, data]) => (
                <div key={token} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{token.split("::")[1] || token}</span>
                  <span className="text-sm">{data.balance}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Show NFTs if any */}
      {Object.keys(balance.non_fungible_tokens).length > 0 && (
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="text-sm font-medium">NFTs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(balance.non_fungible_tokens).map(([nft, data]) => (
                <div key={nft} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{nft.split("::")[1] || nft}</span>
                  <span className="text-sm">{data.count} items</span>
                </div>
              ))}
            </div>
            <div></div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
