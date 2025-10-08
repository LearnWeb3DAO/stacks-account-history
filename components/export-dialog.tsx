"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, Database, Table } from "lucide-react"
import { exportTransactionData, type ExportFormat, type ExportOptions } from "@/lib/export-utils"
import type { FetchAddressTransactionsResponse } from "@/lib/fetch-address-transactions"

interface ExportDialogProps {
  transactions: FetchAddressTransactionsResponse["results"]
  address: string
  filteredCount: number
  totalCount: number
}

export function ExportDialog({ transactions, address, filteredCount, totalCount }: ExportDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [format, setFormat] = useState<ExportFormat>("csv")
  const [includeBalance, setIncludeBalance] = useState(true)
  const [includeEvents, setIncludeEvents] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    try {
      setIsExporting(true)

      const options: ExportOptions = {
        format,
        includeBalance,
        includeEvents,
      }

      exportTransactionData(transactions, address, options)

      // Close dialog after successful export
      setTimeout(() => {
        setIsOpen(false)
      }, 1000)
    } catch (error) {
      console.error("Export failed:", error)
      alert("Export failed. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  const formatDescriptions = {
    csv: "Comma-separated values file, compatible with Excel and Google Sheets",
    json: "JavaScript Object Notation, ideal for developers and data analysis",
    xlsx: "Excel format, ready to open in Microsoft Excel or similar applications",
  }

  const formatIcons = {
    csv: Table,
    json: Database,
    xlsx: FileText,
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 bg-transparent">
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export Data</span>
          <span className="sm:hidden">Export</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Transaction Data
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Export Summary</CardTitle>
              <CardDescription>
                You're about to export transaction data for address {address.slice(0, 8)}...{address.slice(-8)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{filteredCount} transactions</Badge>
                {filteredCount !== totalCount && (
                  <Badge variant="outline">{totalCount - filteredCount} filtered out</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Format Selection */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Export Format</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(["csv", "json", "xlsx"] as ExportFormat[]).map((formatOption) => {
                const Icon = formatIcons[formatOption]
                return (
                  <Card
                    key={formatOption}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      format === formatOption ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setFormat(formatOption)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="font-medium uppercase">{formatOption}</div>
                          <div className="text-xs text-muted-foreground mt-1">{formatDescriptions[formatOption]}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Export Options */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Export Options</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeBalance"
                  checked={includeBalance}
                  onCheckedChange={(checked) => setIncludeBalance(checked as boolean)}
                />
                <Label htmlFor="includeBalance" className="text-sm">
                  Include STX balance changes (sent/received amounts)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeEvents"
                  checked={includeEvents}
                  onCheckedChange={(checked) => setIncludeEvents(checked as boolean)}
                />
                <Label htmlFor="includeEvents" className="text-sm">
                  Include detailed transaction events (transfers, mints, burns)
                </Label>
              </div>
            </div>
          </div>

          {/* Export Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Export Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Format:</span>
                  <span className="font-medium uppercase">{format}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transactions:</span>
                  <span className="font-medium">{filteredCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Include balance:</span>
                  <span className="font-medium">{includeBalance ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Include events:</span>
                  <span className="font-medium">{includeEvents ? "Yes" : "No"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Button */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={isExporting}>
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export {format.toUpperCase()}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
