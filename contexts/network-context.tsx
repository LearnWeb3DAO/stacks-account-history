"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export type Network = "mainnet" | "testnet"

interface NetworkContextType {
  network: Network
  setNetwork: (network: Network) => void
  getApiUrl: () => string
  getExplorerUrl: () => string
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined)

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [network, setNetwork] = useState<Network>("mainnet")

  const getApiUrl = () => {
    return network === "testnet" ? "https://api.testnet.hiro.so" : "https://api.hiro.so"
  }

  const getExplorerUrl = () => {
    return network === "testnet" ? "https://explorer.hiro.so/?chain=testnet" : "https://explorer.hiro.so"
  }

  return (
    <NetworkContext.Provider value={{ network, setNetwork, getApiUrl, getExplorerUrl }}>
      {children}
    </NetworkContext.Provider>
  )
}

export function useNetwork() {
  const context = useContext(NetworkContext)
  if (context === undefined) {
    throw new Error("useNetwork must be used within a NetworkProvider")
  }
  return context
}
