
import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

function resolveAddress(account: any) {
  return typeof account === "string" ? account : account.address;
}

const wallet1Address = resolveAddress(wallet1);
const wallet2Address = resolveAddress(wallet2);

function makeTxid(seed: number) {
  const bytes = new Uint8Array(32);
  bytes.fill(seed);
  return bytes;
}

describe("transaction-annotations contract", () => {
  it("stores and retrieves a note for the caller", () => {
    const txid = makeTxid(1);
    const receipt = simnet.callPublicFn(
      "transaction-annotations",
      "set-note",
      [Cl.buffer(txid), Cl.stringUtf8("Reviewed transfer")],
      wallet1Address,
    );

    expect(receipt.result).toBeOk(Cl.bool(true));

    const read = simnet.callReadOnlyFn(
      "transaction-annotations",
      "get-note",
      [Cl.standardPrincipal(wallet1Address), Cl.buffer(txid)],
      wallet1Address,
    );

    expect(read.result).toBeSome(Cl.tuple({ note: Cl.stringUtf8("Reviewed transfer") }));
  });

  it("updates an existing note for the same owner", () => {
    const txid = makeTxid(2);

    simnet.callPublicFn(
      "transaction-annotations",
      "set-note",
      [Cl.buffer(txid), Cl.stringUtf8("Initial note")],
      wallet1Address,
    );

    const update = simnet.callPublicFn(
      "transaction-annotations",
      "set-note",
      [Cl.buffer(txid), Cl.stringUtf8("Updated note")],
      wallet1Address,
    );

    expect(update.result).toBeOk(Cl.bool(true));

    const read = simnet.callReadOnlyFn(
      "transaction-annotations",
      "get-note",
      [Cl.standardPrincipal(wallet1Address), Cl.buffer(txid)],
      wallet1Address,
    );

    expect(read.result).toBeSome(Cl.tuple({ note: Cl.stringUtf8("Updated note") }));
  });

  it("rejects empty notes", () => {
    const txid = makeTxid(3);

    const receipt = simnet.callPublicFn(
      "transaction-annotations",
      "set-note",
      [Cl.buffer(txid), Cl.stringUtf8("")],
      wallet1Address,
    );

    expect(receipt.result).toBeErr(Cl.uint(100));
  });

  it("clears a note and returns none afterwards", () => {
    const txid = makeTxid(4);

    simnet.callPublicFn(
      "transaction-annotations",
      "set-note",
      [Cl.buffer(txid), Cl.stringUtf8("To be cleared")],
      wallet1Address,
    );

    const cleared = simnet.callPublicFn(
      "transaction-annotations",
      "clear-note",
      [Cl.buffer(txid)],
      wallet1Address,
    );

    expect(cleared.result).toBeOk(Cl.bool(true));

    const read = simnet.callReadOnlyFn(
      "transaction-annotations",
      "get-note",
      [Cl.standardPrincipal(wallet1Address), Cl.buffer(txid)],
      wallet1Address,
    );

    expect(read.result).toBeNone();
  });

  it("does not allow clearing notes that do not exist", () => {
    const txid = makeTxid(5);

    const receipt = simnet.callPublicFn(
      "transaction-annotations",
      "clear-note",
      [Cl.buffer(txid)],
      wallet2Address,
    );

    expect(receipt.result).toBeErr(Cl.uint(404));
  });
});
