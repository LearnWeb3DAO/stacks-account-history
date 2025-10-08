import type { FetchAddressTransactionsResponse } from "./fetch-address-transactions"

export type ExportFormat = "csv" | "json" | "xlsx"

export interface ExportOptions {
  format: ExportFormat
  includeBalance: boolean
  includeEvents: boolean
  dateRange?: {
    from: Date
    to: Date
  }
}

export function exportTransactionData(
  transactions: FetchAddressTransactionsResponse["results"],
  address: string,
  options: ExportOptions,
) {
  const timestamp = new Date().toISOString().split("T")[0]
  const filename = `stacks-transactions-${address.slice(0, 8)}-${timestamp}`

  switch (options.format) {
    case "csv":
      return exportToCSV(transactions, filename, options)
    case "json":
      return exportToJSON(transactions, filename, options)
    case "xlsx":
      return exportToXLSX(transactions, filename, options)
    default:
      throw new Error(`Unsupported export format: ${options.format}`)
  }
}

function exportToCSV(
  transactions: FetchAddressTransactionsResponse["results"],
  filename: string,
  options: ExportOptions,
) {
  const headers = [
    "Transaction ID",
    "Type",
    "Status",
    "Block Height",
    "Block Time",
    "Sender Address",
    "Nonce",
    ...(options.includeBalance ? ["STX Sent", "STX Received"] : []),
    ...(options.includeEvents ? ["Transfer Events", "Mint Events", "Burn Events"] : []),
  ]

  // Add type-specific headers
  const hasTokenTransfers = transactions.some((tx) => tx.tx.tx_type === "token_transfer")
  const hasContractCalls = transactions.some((tx) => tx.tx.tx_type === "contract_call")
  const hasSmartContracts = transactions.some((tx) => tx.tx.tx_type === "smart_contract")

  if (hasTokenTransfers) {
    headers.push("Recipient Address", "Transfer Amount (STX)")
  }
  if (hasContractCalls) {
    headers.push("Contract ID", "Function Name")
  }
  if (hasSmartContracts) {
    headers.push("Contract ID", "Clarity Version")
  }

  const csvContent = [
    headers.join(","),
    ...transactions.map((tx) => {
      const baseRow = [
        `"${tx.tx.tx_id}"`,
        tx.tx.tx_type,
        tx.tx.tx_status,
        tx.tx.block_height,
        new Date(tx.tx.block_time * 1000).toISOString(),
        `"${tx.tx.sender_address}"`,
        tx.tx.nonce,
        ...(options.includeBalance
          ? [
              (Number.parseFloat(tx.stx_sent) / 1_000_000).toFixed(6),
              (Number.parseFloat(tx.stx_received) / 1_000_000).toFixed(6),
            ]
          : []),
        ...(options.includeEvents ? [tx.events.stx.transfer, tx.events.stx.mint, tx.events.stx.burn] : []),
      ]

      // Add type-specific data
      if (hasTokenTransfers) {
        if (tx.tx.tx_type === "token_transfer") {
          baseRow.push(
            `"${tx.tx.token_transfer.recipient_address}"`,
            (Number.parseFloat(tx.tx.token_transfer.amount) / 1_000_000).toFixed(6),
          )
        } else {
          baseRow.push("", "")
        }
      }

      if (hasContractCalls) {
        if (tx.tx.tx_type === "contract_call") {
          baseRow.push(`"${tx.tx.contract_call.contract_id}"`, tx.tx.contract_call.function_name)
        } else {
          baseRow.push("", "")
        }
      }

      if (hasSmartContracts) {
        if (tx.tx.tx_type === "smart_contract") {
          baseRow.push(`"${tx.tx.smart_contract.contract_id}"`, tx.tx.smart_contract.clarity_version.toString())
        } else {
          baseRow.push("", "")
        }
      }

      return baseRow.join(",")
    }),
  ].join("\n")

  downloadFile(csvContent, `${filename}.csv`, "text/csv")
}

function exportToJSON(
  transactions: FetchAddressTransactionsResponse["results"],
  filename: string,
  options: ExportOptions,
) {
  const exportData = {
    exportDate: new Date().toISOString(),
    totalTransactions: transactions.length,
    options,
    transactions: transactions.map((tx) => ({
      tx_id: tx.tx.tx_id,
      tx_type: tx.tx.tx_type,
      tx_status: tx.tx.tx_status,
      block_height: tx.tx.block_height,
      block_time: tx.tx.block_time,
      block_time_iso: new Date(tx.tx.block_time * 1000).toISOString(),
      sender_address: tx.tx.sender_address,
      nonce: tx.tx.nonce,
      block_hash: tx.tx.block_hash,
      parent_block_hash: tx.tx.parent_block_hash,
      ...(options.includeBalance && {
        stx_sent: (Number.parseFloat(tx.stx_sent) / 1_000_000).toFixed(6),
        stx_received: (Number.parseFloat(tx.stx_received) / 1_000_000).toFixed(6),
      }),
      ...(options.includeEvents && {
        events: tx.events,
      }),
      ...(tx.tx.tx_type === "token_transfer" && {
        token_transfer: {
          recipient_address: tx.tx.token_transfer.recipient_address,
          amount_stx: (Number.parseFloat(tx.tx.token_transfer.amount) / 1_000_000).toFixed(6),
          amount_ustx: tx.tx.token_transfer.amount,
        },
      }),
      ...(tx.tx.tx_type === "contract_call" && {
        contract_call: tx.tx.contract_call,
      }),
      ...(tx.tx.tx_type === "smart_contract" && {
        smart_contract: tx.tx.smart_contract,
      }),
    })),
  }

  const jsonContent = JSON.stringify(exportData, null, 2)
  downloadFile(jsonContent, `${filename}.json`, "application/json")
}

function exportToXLSX(
  transactions: FetchAddressTransactionsResponse["results"],
  filename: string,
  options: ExportOptions,
) {
  // For XLSX export, we'll create a simple tab-separated format that can be opened in Excel
  const headers = [
    "Transaction ID",
    "Type",
    "Status",
    "Block Height",
    "Block Time",
    "Sender Address",
    "Nonce",
    ...(options.includeBalance ? ["STX Sent", "STX Received"] : []),
    "Recipient Address",
    "Transfer Amount (STX)",
    "Contract ID",
    "Function Name",
  ]

  const tsvContent = [
    headers.join("\t"),
    ...transactions.map((tx) =>
      [
        tx.tx.tx_id,
        tx.tx.tx_type,
        tx.tx.tx_status,
        tx.tx.block_height,
        new Date(tx.tx.block_time * 1000).toLocaleString(),
        tx.tx.sender_address,
        tx.tx.nonce,
        ...(options.includeBalance
          ? [
              (Number.parseFloat(tx.stx_sent) / 1_000_000).toFixed(6),
              (Number.parseFloat(tx.stx_received) / 1_000_000).toFixed(6),
            ]
          : []),
        tx.tx.tx_type === "token_transfer" ? tx.tx.token_transfer.recipient_address : "",
        tx.tx.tx_type === "token_transfer"
          ? (Number.parseFloat(tx.tx.token_transfer.amount) / 1_000_000).toFixed(6)
          : "",
        tx.tx.tx_type === "contract_call"
          ? tx.tx.contract_call.contract_id
          : tx.tx.tx_type === "smart_contract"
            ? tx.tx.smart_contract.contract_id
            : "",
        tx.tx.tx_type === "contract_call" ? tx.tx.contract_call.function_name : "",
      ].join("\t"),
    ),
  ].join("\n")

  downloadFile(tsvContent, `${filename}.xlsx`, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}
