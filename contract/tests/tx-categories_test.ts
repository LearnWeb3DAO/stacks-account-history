import { Clarinet, Tx, Chain, Account, types } from "clarinet";

Clarinet.test({
  name: "tx-categories: can set and get a category for a tx id",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const wallet1 = accounts.get("wallet_1")!;

    const txid = new Uint8Array(32);

    // Set category by wallet1
    let block = chain.mineBlock([
      Tx.contractCall(
        "tx-categories",
        "set-category",
        [types.buff(txid), types.utf8("Income")],
        wallet1.address
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);

    // Read back
    const ro = chain.callReadOnlyFn(
      "tx-categories",
      "get-category",
      [types.principal(wallet1.address), types.buff(txid)],
      deployer.address
    );

    const tuple = ro.expectSome().expectTuple();
    tuple["category"].expectUtf8("Income");
  },
});

Clarinet.test({
  name: "tx-categories: categories are per-owner",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const wallet1 = accounts.get("wallet_1")!;
    const wallet2 = accounts.get("wallet_2")!;

    const txid = new Uint8Array(32);

    chain.mineBlock([
      Tx.contractCall(
        "tx-categories",
        "set-category",
        [types.buff(txid), types.utf8("Expense")],
        wallet1.address
      ),
    ]);

    const ro = chain.callReadOnlyFn(
      "tx-categories",
      "get-category",
      [types.principal(wallet2.address), types.buff(txid)],
      deployer.address
    );

    ro.expectNone();
  },
});
