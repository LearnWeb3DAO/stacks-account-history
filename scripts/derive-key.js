/*
 Derive the first account's Stacks private key from a mnemonic (secret key).

 Usage (PowerShell):
   node scripts/derive-key.js "your 12-or-24 word mnemonic here"

 Output:
   - Testnet address (for reference)
   - Private key (hex) suitable for signing deployments (DO NOT SHARE)
*/

const { generateWallet, deriveAccount } = require('@stacks/wallet-sdk');

(async () => {
  try {
    const mnemonic = process.argv.slice(2).join(' ').trim();
    if (!mnemonic || mnemonic.split(' ').length < 12) {
      console.error('Error: Provide your mnemonic as a quoted argument.');
      process.exit(1);
    }

    // Build wallet and derive account 0 (first account)
    const wallet = await generateWallet({ secretKey: mnemonic, password: '' });
    // Some SDK versions provide accounts array; to be safe, derive explicitly:
    const account = wallet.accounts?.[0] || deriveAccount({ rootNode: wallet.rootNode, index: 0 });

    const privateKey = account.stxPrivateKey || account.stacksPrivateKey;
    if (!privateKey) {
      console.error('Failed to derive private key from mnemonic.');
      process.exit(1);
    }

    console.log('Private key (keep secret):', privateKey);
    console.log('\nNext steps:');
    console.log('  1) Set PRIVATE_KEY only in your shell, not in code:');
    console.log('     PowerShell:  $env:PRIVATE_KEY="<paste private key>"');
    console.log('  2) Deploy:     node scripts/deploy-tx-categories.js');
  } catch (e) {
    console.error('Derivation failed:', e);
    process.exit(1);
  }
})();
