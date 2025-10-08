"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Filter, SortAsc, SortDesc, ChevronDown, ChevronUp } from "lucide-react";
import { ExportDialog } from "./export-dialog";
import type { Transaction, FetchAddressTransactionsResponse } from "@/lib/fetch-address-transactions";

export interface TransactionFilters {
  txType: Transaction["tx_type"] | "all";
  status: "success" | "failed" | "all";
  dateFrom: string;
  dateTo: string;
  minAmount: string;
  maxAmount: string;
  sortBy: "block_height" | "block_time" | "amount";
  sortOrder: "asc" | "desc";
}

interface TransactionFiltersProps {
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
  onReset: () => void;
  totalTransactions: number;
  filteredCount: number;
  allTransactions: FetchAddressTransactionsResponse["results"];
  filteredTransactions: FetchAddressTransactionsResponse["results"];
  address: string;
}

export function TransactionFiltersComponent({
  filters,
  onFiltersChange,
  onReset,
  totalTransactions,
  filteredCount,
  allTransactions,
  filteredTransactions,
  address,
}: TransactionFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof TransactionFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const hasActiveFilters =
    filters.txType !== "all" ||
    filters.status !== "all" ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.minAmount ||
    filters.maxAmount;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base md:text-lg flex items-center gap-2">
            <Filter className="h-4 w-4 md:h-5 md:w-5" />
            <span className="hidden sm:inline">Filters & Sorting</span>
            <span className="sm:hidden">Filters</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              <span className="hidden sm:inline">
                {filteredCount} of {totalTransactions} transactions
              </span>
              <span className="sm:hidden">
                {filteredCount}/{totalTransactions}
              </span>
            </Badge>
            <ExportDialog
              transactions={filteredTransactions}
              address={address}
              filteredCount={filteredCount}
              totalCount={totalTransactions}
            />
            <Button variant="outline" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 md:hidden" />
                  <span className="hidden md:inline">Hide Filters</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 md:hidden" />
                  <span className="hidden md:inline">Show Filters</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Transaction Type Filter */}
            <div className="space-y-2">
              <Label htmlFor="txType" className="text-sm">
                Transaction Type
              </Label>
              <Select value={filters.txType} onValueChange={(value) => updateFilter("txType", value)}>
                <SelectTrigger className=" text-white focus:bg-white focus:text-black data-[state=open]:bg-white data-[state=open]:text-black">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent className="bg-black text-gray-200">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="token_transfer">Token Transfer</SelectItem>
                  <SelectItem value="contract_call">Contract Call</SelectItem>
                  <SelectItem value="smart_contract">Smart Contract</SelectItem>
                  <SelectItem value="coinbase">Coinbase</SelectItem>
                  <SelectItem value="poison_microblock">Poison Microblock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Status Filter */}
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm">
                Status
              </Label>
              <Select value={filters.status} onValueChange={(value) => updateFilter("status", value)}>
                <SelectTrigger className=" text-white focus:bg-white focus:text-black data-[state=open]:bg-white data-[state=open]:text-black">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent className="bg-black text-gray-200">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Sort By */}
            <div className="space-y-2">
              <Label htmlFor="sortBy" className="text-sm">
                Sort By
              </Label>
              <Select value={filters.sortBy} onValueChange={(value) => updateFilter("sortBy", value)}>
                <SelectTrigger className=" text-white focus:bg-white focus:text-black data-[state=open]:bg-white data-[state=open]:text-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black text-gray-200">
                  <SelectItem value="block_height">Block Height</SelectItem>
                  <SelectItem value="block_time">Date</SelectItem>
                  <SelectItem value="amount">Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Sort Order */}
            <div className="space-y-2">
              <Label htmlFor="sortOrder" className="text-sm">
                Sort Order
              </Label>
              <Select value={filters.sortOrder} onValueChange={(value) => updateFilter("sortOrder", value)}>
                <SelectTrigger className=" text-white focus:bg-white focus:text-black data-[state=open]:bg-white data-[state=open]:text-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black text-gray-200">
                  <SelectItem value="desc">
                    <div className="flex items-center gap-2">
                      <SortDesc className="h-4 w-4" />
                      Descending
                    </div>
                  </SelectItem>
                  <SelectItem value="asc">
                    <div className="flex items-center gap-2">
                      <SortAsc className="h-4 w-4" />
                      Ascending
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date From */}
            <div className="space-y-2">
              <Label htmlFor="dateFrom" className="text-sm">
                From Date
              </Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => updateFilter("dateFrom", e.target.value)}
              />
            </div>
            {/* Date To */}
            <div className="space-y-2">
              <Label htmlFor="dateTo" className="text-sm">
                To Date
              </Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => updateFilter("dateTo", e.target.value)}
              />
            </div>
            {/* Min Amount */}
            <div className="space-y-2">
              <Label htmlFor="minAmount" className="text-sm">
                Min Amount (STX)
              </Label>
              <Input
                id="minAmount"
                type="number"
                step="0.000001"
                placeholder="0.000000"
                value={filters.minAmount}
                onChange={(e) => updateFilter("minAmount", e.target.value)}
              />
            </div>
            {/* Max Amount */}
            <div className="space-y-2">
              <Label htmlFor="maxAmount" className="text-sm">
                Max Amount (STX)
              </Label>
              <Input
                id="maxAmount"
                type="number"
                step="0.000001"
                placeholder="1000000.000000"
                value={filters.maxAmount}
                onChange={(e) => updateFilter("maxAmount", e.target.value)}
              />
            </div>
          </div>
          {hasActiveFilters && (
            <div className="flex justify-end">
              <Button variant="outline" onClick={onReset} className="flex items-center gap-2 bg-transparent">
                <X className="h-4 w-4" />
                Reset Filters
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

