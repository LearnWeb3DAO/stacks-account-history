This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## On-chain Transaction Notes (New)

This project now includes an optional feature to save a personal note for any transaction on-chain using a simple Clarity contract `tx-notes`.

### Contract

- Location: `contract/contracts/tx-notes.clar`
- Storage: `notes` map keyed by `{ owner: principal, txid: (buff 32) }` with value `{ note: (string-utf8 200) }`.
- Public entrypoints:
  - `set-note (txid (buff 32)) (note (string-utf8 200))` stores/updates your note under your principal.
  - `get-note (owner principal) (txid (buff 32))` returns `(optional { note: string-utf8 })`.

### Tests

- Clarinet tests are in `contract/tests/tx-notes_test.ts`.
- Run locally with Clarinet:

```bash
cd contract
clarinet test
```

Note: The IDE may show TypeScript type warnings in tests (imports from `clarinet`). These do not affect running `clarinet test`.

### Frontend integration

- Config uses environment variables to know the deployed contract IDs:
  - `NEXT_PUBLIC_TX_NOTES_CONTRACT_MAINNET`
  - `NEXT_PUBLIC_TX_NOTES_CONTRACT_TESTNET`

Create an `./env.local` (or set in your env) based on `env.example` at the project root:

```env
NEXT_PUBLIC_TX_NOTES_CONTRACT_MAINNET=SPxxxxxxx.tx-notes
NEXT_PUBLIC_TX_NOTES_CONTRACT_TESTNET=STxxxxxxx.tx-notes
```

- Utilities: `lib/tx-notes.ts` exposes `getNote()` and `setNote()` using `@stacks/transactions` and `@stacks/connect`.
- UI: `components/transaction-modal.tsx` now renders a "Transaction Note" card. When a wallet is connected, you can read an existing note and save a new note (opens your Stacks wallet for signing).

### Usage

1. Deploy `tx-notes` to your target network (e.g., via Clarinet or Hiro Platform/Stacks wallet tools).
2. Set the corresponding `NEXT_PUBLIC_TX_NOTES_CONTRACT_*` var to the deployed `SP.../ST....tx-notes` contract ID.
3. Run the app and connect your wallet. Open any transaction details modal to view and save a note.

### Notes about repository layout

- Use the `contract/` directory for Clarinet; if you see a `clarinet/` folder, it is not used by the app and can be ignored or removed.
