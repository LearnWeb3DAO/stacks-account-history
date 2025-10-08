import { Clarinet, Tx, Chain, Account, types } from "clarinet";

Clarinet.test({
  name: "tx-notes: can set and get a note for a tx id",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const wallet1 = accounts.get("wallet_1")!;

    // 32-byte dummy txid
    const txid = new Uint8Array(32);
    txid.set([
      0xde, 0xad, 0xbe, 0xef, 0x00, 0x11, 0x22, 0x33,
      0x44, 0x55, 0x66, 0x77, 0x88, 0x99, 0xaa, 0xbb,
      0xcc, 0xdd, 0xee, 0xff, 0x10, 0x20, 0x30, 0x40,
      0x50, 0x60, 0x70, 0x80, 0x90, 0xa0, 0xb0, 0xc0,
    ]);

    // Set note by wallet1
    let block = chain.mineBlock([
      Tx.contractCall(
        "tx-notes",
        "set-note",
        [types.buff(txid), types.utf8("hello world")],
        wallet1.address
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);

    // Read back
    const ro = chain.callReadOnlyFn(
      "tx-notes",
      "get-note",
      [types.principal(wallet1.address), types.buff(txid)],
      deployer.address
    );

    const tuple = ro.expectSome().expectTuple();
    tuple["note"].expectUtf8("hello world");
  },
});

Clarinet.test({
  name: "tx-notes: notes are per-owner; another principal has no note",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const wallet1 = accounts.get("wallet_1")!;
    const wallet2 = accounts.get("wallet_2")!;

    const txid = new Uint8Array(32);

    // wallet1 sets a note
    chain.mineBlock([
      Tx.contractCall(
        "tx-notes",
        "set-note",
        [types.buff(txid), types.utf8("w1 note")],
        wallet1.address
      ),
    ]);

    // wallet2 should see none for same txid
    const ro = chain.callReadOnlyFn(
      "tx-notes",
      "get-note",
      [types.principal(wallet2.address), types.buff(txid)],
      deployer.address
    );

    ro.expectNone();
  },
});
