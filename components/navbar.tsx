"use client"

import { useStacks } from "@/hooks/use-stacks"
import { abbreviateAddress } from "@/lib/stx-utils"
import { createAddress } from "@stacks/transactions"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { NetworkToggle } from "@/components/network-toggle"
import { useNetwork } from "@/contexts/network-context"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Search } from "lucide-react"

export function Navbar() {
  // next.js router to handle redirecting to different pages
  const router = useRouter()

  // state variable for storing the address input in the search bar
  const [searchAddress, setSearchAddress] = useState("")
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  // our useStacks hook
  const { userData, connectWallet, disconnectWallet } = useStacks()

  const { network } = useNetwork()

  // function that validates the user inputted address
  // If it is valid, we will redirect the user to the txn history page
  function handleSearch() {
    const expectedPrefix = network === "testnet" ? "ST" : "SP"
    if (!searchAddress.startsWith(expectedPrefix)) {
      return alert(`Please enter a ${network} Stacks address (starting with ${expectedPrefix})`)
    }

    try {
      // createAddress comes from @stacks/transactions
      // and throws an error if the given user input is not a valid Stacks address
      createAddress(searchAddress)
    } catch (error) {
      return alert(`Invalid Stacks address entered ${error}`)
    }

    // redirect to /SP... which will show the txn history for this address
    router.push(`/${searchAddress}`)
    setIsSheetOpen(false)
  }

  return (
    <nav className="flex w-full items-center justify-between gap-2 p-4 h-16 border-b border-border">
      <Link href="/" className="text-xl md:text-2xl font-bold truncate">
        <span className="hidden sm:inline">Stacks Account History</span>
        <span className="sm:hidden">Stacks</span>
      </Link>

      <div className="hidden md:flex flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <input
            type="text"
            placeholder={network === "testnet" ? "ST..." : "SP..."}
            className="w-full rounded-lg bg-muted px-4 py-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-ring"
            onChange={(e) => setSearchAddress(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch()
              }
            }}
          />
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div className="hidden md:flex items-center gap-2">
        <NetworkToggle />
        <ThemeToggle />

        {userData ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push(`/${userData.profile.stxAddress.mainnet}`)}
              className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              View {abbreviateAddress(userData.profile.stxAddress.mainnet)}
            </button>
            <button
              type="button"
              onClick={disconnectWallet}
              className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={connectWallet}
            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Connect Wallet
          </button>
        )}
      </div>

      <div className="md:hidden flex items-center gap-2">
        <ThemeToggle />
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <div className="flex flex-col gap-6 pt-6">
              {/* Mobile search */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Search Address</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={network === "testnet" ? "ST..." : "SP..."}
                    className="w-full rounded-lg bg-muted px-4 py-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                    onChange={(e) => setSearchAddress(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearch()
                      }
                    }}
                  />
                  <Button size="sm" onClick={handleSearch} className="absolute right-1 top-1 h-6 px-2">
                    <Search className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Network toggle */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Network</label>
                <NetworkToggle />
              </div>

              {/* Wallet controls */}
              <div className="space-y-3">
                {userData ? (
                  <>
                    <Button
                      onClick={() => {
                        router.push(`/${userData.profile.stxAddress.mainnet}`)
                        setIsSheetOpen(false)
                      }}
                      className="w-full bg-blue-500 hover:bg-blue-600"
                    >
                      View {abbreviateAddress(userData.profile.stxAddress.mainnet)}
                    </Button>
                    <Button
                      onClick={() => {
                        disconnectWallet()
                        setIsSheetOpen(false)
                      }}
                      variant="destructive"
                      className="w-full"
                    >
                      Disconnect Wallet
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => {
                      connectWallet()
                      setIsSheetOpen(false)
                    }}
                    className="w-full bg-blue-500 hover:bg-blue-600"
                  >
                    Connect Wallet
                  </Button>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}
