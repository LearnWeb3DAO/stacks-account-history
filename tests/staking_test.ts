import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.7.1/index.ts';
import { assertEquals } from 'https://deno.land/std@0.170.0/testing/asserts.ts';

Clarinet.test({
    name: "Can stake STX tokens",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('staking', 'stake', [types.uint(1000000)], wallet1.address)
        ]);
        
        assertEquals(block.receipts.length, 1);
        block.receipts[0].result.expectOk().expectUint(1000000);
        
        // Check staked balance
        let getStakeBlock = chain.mineBlock([
            Tx.contractCall('staking', 'get-stake', [types.principal(wallet1.address)], wallet1.address)
        ]);
        
        getStakeBlock.receipts[0].result.expectUint(1000000);
    },
});

Clarinet.test({
    name: "Can unstake STX tokens",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        
        // First stake some tokens
        let stakeBlock = chain.mineBlock([
            Tx.contractCall('staking', 'stake', [types.uint(2000000)], wallet1.address)
        ]);
        
        stakeBlock.receipts[0].result.expectOk().expectUint(2000000);
        
        // Then unstake partial amount
        let unstakeBlock = chain.mineBlock([
            Tx.contractCall('staking', 'unstake', [types.uint(500000)], wallet1.address)
        ]);
        
        unstakeBlock.receipts[0].result.expectOk().expectUint(500000);
        
        // Check remaining balance
        let getStakeBlock = chain.mineBlock([
            Tx.contractCall('staking', 'get-stake', [types.principal(wallet1.address)], wallet1.address)
        ]);
        
        getStakeBlock.receipts[0].result.expectUint(1500000);
    },
});

Clarinet.test({
    name: "Cannot unstake more than staked",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        
        // Stake 1 STX
        let stakeBlock = chain.mineBlock([
            Tx.contractCall('staking', 'stake', [types.uint(1000000)], wallet1.address)
        ]);
        
        // Try to unstake 2 STX (should fail)
        let unstakeBlock = chain.mineBlock([
            Tx.contractCall('staking', 'unstake', [types.uint(2000000)], wallet1.address)
        ]);
        
        unstakeBlock.receipts[0].result.expectErr(types.uint(102));
    },
});

Clarinet.test({
    name: "Only staker can unstake their tokens",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        const wallet2 = accounts.get('wallet_2')!;
        
        // Wallet1 stakes tokens
        let stakeBlock = chain.mineBlock([
            Tx.contractCall('staking', 'stake', [types.uint(1000000)], wallet1.address)
        ]);
        
        stakeBlock.receipts[0].result.expectOk().expectUint(1000000);
        
        // Wallet2 tries to unstake wallet1's tokens (should have 0 staked)
        let unstakeBlock = chain.mineBlock([
            Tx.contractCall('staking', 'unstake', [types.uint(1000000)], wallet2.address)
        ]);
        
        unstakeBlock.receipts[0].result.expectErr(types.uint(102));
    },
});