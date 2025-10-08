/*
 Deploy tx-categories to Stacks testnet using a private key.

 Usage (PowerShell):
   $env:PRIVATE_KEY="<your_testnet_private_key>"; node scripts/deploy-tx-categories.js

 On success, prints the contract ID and txId.
*/

// Load .env if present
// Top: keep dotenv load
try { require('dotenv').config(); } catch {}

const fs = require('fs');
const path = require('path');
const {
  makeContractDeploy,
} = require('@stacks/transactions');
const { STACKS_TESTNET } = require('@stacks/network');

(async () => {
  try {
    const PRIVATE_KEY = process.env.PRIVATE_KEY;
    if (!PRIVATE_KEY) {
      console.error('Error: PRIVATE_KEY env var is required');
      process.exit(1);
    }
    const CONTRACT_NAME = process.env.CONTRACT_NAME || 'tx-categories';
    const contractPath = path.resolve(__dirname, '..', 'contract', 'contracts', `${CONTRACT_NAME}.clar`);
    const codeBody = fs.readFileSync(contractPath, 'utf8');

    const network = { ...STACKS_TESTNET, url: process.env.API_URL || 'https://api.testnet.hiro.so' };

    const tx = await makeContractDeploy({
      contractName: CONTRACT_NAME,
      codeBody,
      senderKey: PRIVATE_KEY,
      network,
      fee: 2000n,
      anchorMode: 3, // Any
    });

    // Serialize to raw bytes
    const payload = typeof tx.serialize === 'function' ? tx.serialize() : tx;
    const url = (network && network.url ? network.url : 'https://api.testnet.hiro.so') + '/v2/transactions';
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: Buffer.from(payload),
    });
    const text = await resp.text();
    let result;
    try { result = JSON.parse(text); } catch { result = text; }

    if ((result && result.error) || (result && result.reason)) {
      console.error('Broadcast error:', result);
      process.exit(1);
    }

    const txId = typeof result === 'string' ? result : result.txid || result.txId || '';

    console.log('Deployed (broadcasted):');
    console.log('  TxID:', txId);
    console.log('  Contract ID will be <your-testnet-address>.' + CONTRACT_NAME);
    console.log('Explorer:', `https://explorer.hiro.so/txid/${txId}?chain=testnet`);
  } catch (e) {
    console.error('Deployment failed:', e);
    process.exit(1);
  }
})();