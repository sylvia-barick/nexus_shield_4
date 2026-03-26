import * as StellarSdk from "@stellar/stellar-sdk";
import {
  isConnected,
  getAddress,
  signTransaction,
  isAllowed,
  setAllowed
} from "@stellar/freighter-api";
import albedo from "@albedo-link/intent";
import { type WalletType } from "./stellar-service";

// Deployed Contract ID
const CONTRACT_ID = "CADI56PK5TY2TXYCCSQJP4OBNFTD6ZVLWINUJNQ4QIUEBECGGIG4RYKA";
const RPC_URL = "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;

export class StellarContractService {
  private server: StellarSdk.rpc.Server;
  private contract: StellarSdk.Contract;
  private activeWalletType: WalletType = "freighter";
  private cachedAddress: string | null = null;

  constructor() {
    this.server = new StellarSdk.rpc.Server(RPC_URL);
    this.contract = new StellarSdk.Contract(CONTRACT_ID);
  }

  setWalletType(type: WalletType) {
    this.activeWalletType = type;
    this.cachedAddress = null;
  }

  setAddress(address: string) {
    this.cachedAddress = address;
  }

  async isFreighterInstalled() {
    const res = await isConnected();
    return !!res.isConnected;
  }

  async connectWallet() {
    if (this.cachedAddress) return this.cachedAddress;

    if (this.activeWalletType === "albedo") {
      const { pubkey } = await albedo.publicKey({});
      this.cachedAddress = pubkey;
      return pubkey;
    }

    if (!await this.isFreighterInstalled()) {
      throw new Error("Wallet not found");
    }
    const allowed = await isAllowed();
    if (!allowed.isAllowed) {
      await setAllowed();
    }
    const { address, error } = await getAddress();
    if (error) throw new Error(error);
    this.cachedAddress = address;
    return address;
  }

  async sign(xdr: string): Promise<string> {
    console.log(`Signing with ${this.activeWalletType}...`);
    if (this.activeWalletType === "albedo") {
      try {
        console.log("Calling Albedo tx with XDR:", xdr);
        const result = await albedo.tx({
          xdr,
          network: (NETWORK_PASSPHRASE as string) === StellarSdk.Networks.PUBLIC ? "public" : "testnet"
        });
        console.log("Albedo result:", result);
        return result.signed_envelope_xdr;
      } catch (error: any) {
        console.error("Albedo signing error:", error);
        throw new Error(error.message || "Albedo transaction failed");
      }
    } else {
      const result = await signTransaction(xdr, {
        networkPassphrase: NETWORK_PASSPHRASE,
      });
      if (result.error) {
        throw new Error("Transaction rejected or failed: " + result.error);
      }
      return result.signedTxXdr;
    }
  }

  async storeHash(hash: string) {
    const address = await this.connectWallet();
    if (!address) throw new Error("Wallet not connected");

    // 1. Fetch account info
    const account = await this.server.getAccount(address);

    // 2. Build the transaction
    const tx = new StellarSdk.TransactionBuilder(account, {
      fee: "1000",
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        this.contract.call("store_hash", StellarSdk.nativeToScVal(hash, { type: "symbol" }))
      )
      .setTimeout(30)
      .build();

    // 3. Simulate to get footprint/fees
    const simulation = await this.server.simulateTransaction(tx);
    if (StellarSdk.rpc.Api.isSimulationError(simulation)) {
      throw new Error("Simulation failed: " + simulation.error);
    }

    const assembledBuilder = StellarSdk.rpc.assembleTransaction(tx, simulation);
    const assembledTx = assembledBuilder.build();

    // 4. Sign
    const xdrEncoded = assembledTx.toXDR();
    const signedTxXdr = await this.sign(xdrEncoded);

    // 5. Submit to network
    const signedTx = StellarSdk.TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE);
    const submission = await this.server.sendTransaction(signedTx as any);

    if (submission.status === "ERROR") {
      throw new Error("Transaction failed: " + submission.status);
    }

    // 6. Poll for results
    let txResponse = await this.server.getTransaction(submission.hash);
    while (txResponse.status === StellarSdk.rpc.Api.GetTransactionStatus.NOT_FOUND) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      txResponse = await this.server.getTransaction(submission.hash);
    }

    if (txResponse.status === StellarSdk.rpc.Api.GetTransactionStatus.FAILED) {
      throw new Error("Transaction execution failed");
    }
    console.log("TX HASH:", submission.hash);
    return submission.hash;
  }

  async sendPayment(amount: string, destination: string) {
    const address = await this.connectWallet();
    if (!address) throw new Error("Wallet not connected");

    // 1. Fetch account info from Horizon
    // Note: We use the RPC server's account fetcher if available, but for XLM transfers 
    // we typically use the standard Horizon server. However, since we have RPC_URL, 
    // let's see if we can use it or if we should use a Horizon URL.
    // The RPC server's getAccount is for Soroban. For standard XLM, Horizon is better.
    // Let's use the Horizon server for standard XLM transfers.
    const horizonUrl = RPC_URL.replace("soroban-", "").replace(":443", ""); // Rough heuristic
    // Actually, let's just use the testnet horizon URL directly for simplicity.
    const horizonServer = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");

    const account = await horizonServer.loadAccount(address);

    // 2. Build the transaction
    const tx = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination,
          asset: StellarSdk.Asset.native(),
          amount,
        })
      )
      .setTimeout(StellarSdk.TimeoutInfinite)
      .build();

    // 3. Sign
    const xdrEncoded = tx.toXDR();
    const signedTxXdr = await this.sign(xdrEncoded);

    // 4. Submit to network
    const signedTx = StellarSdk.TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE);
    const submission = await horizonServer.submitTransaction(signedTx);

    if (!submission.successful) {
      throw new Error("Transaction failed");
    }

    return submission.hash;
  }

  async getHash(): Promise<string> {
    try {
      const dummyAddress = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";
      const dummyAccount = new StellarSdk.Account(dummyAddress, "0");
      const tx = new StellarSdk.TransactionBuilder(dummyAccount, {
        fee: "100",
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(this.contract.call("get_hash"))
        .setTimeout(0)
        .build();

      const simulation = await this.server.simulateTransaction(tx);

      if (StellarSdk.rpc.Api.isSimulationError(simulation)) {
        return "";
      }

      const result = (simulation as any).result?.retval;
      if (result) {
        return StellarSdk.scValToNative(result);
      }
    } catch (e) {
      console.error("Error in getHash:", e);
    }
    return "";
  }
}

export const stellarContractService = new StellarContractService();
