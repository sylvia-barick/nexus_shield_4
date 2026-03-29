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
import { monitoring } from "./monitoring";

// Deployed Contract IDs (Exported for component use)
export const CONTRACT_ID = "CADI56PK5TY2TXYCCSQJP4OBNFTD6ZVLWINUJNQ4QIUEBECGGIG4RYKA";
export const TOKEN_CONTRACT_ID = "CC4V4V4V4V4V4V4V4V4V4V4V4V4V4V4V4V4V4V4V4V4V4V4V4V4V4V4V";
export const VAULT_CONTRACT_ID = "CBV5V5V5V5V5V5V5V5V5V5V5V5V5V5V5V5V5V5V5V5V5V5V5V5V5V5V5";
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
    const stopTimer = monitoring.startTimer("Sign Transaction");
    console.log(`Signing with ${this.activeWalletType}...`);
    try {
      if (this.activeWalletType === "albedo") {
        const result = await albedo.tx({
          xdr,
          network: (NETWORK_PASSPHRASE as string) === StellarSdk.Networks.PUBLIC ? "public" : "testnet"
        });
        stopTimer();
        return result.signed_envelope_xdr;
      } else {
        const result = await signTransaction(xdr, {
          networkPassphrase: NETWORK_PASSPHRASE,
        });
        if (result.error) throw new Error(result.error);
        stopTimer();
        return result.signedTxXdr;
      }
    } catch (error: any) {
      monitoring.log("error", "Signing failed", error);
      throw error;
    }
  }

  async storeHash(hash: string) {
    const stopTimer = monitoring.startTimer("Store Hash Flow");
    try {
      const address = await this.connectWallet();
      const account = await this.server.getAccount(address);

      const tx = new StellarSdk.TransactionBuilder(account, {
        fee: "1000",
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(this.contract.call("store_hash", StellarSdk.nativeToScVal(hash, { type: "symbol" })))
        .setTimeout(30)
        .build();

      const simulation = await this.server.simulateTransaction(tx);
      const assembled = StellarSdk.rpc.assembleTransaction(tx, simulation).build();
      const signedXdr = await this.sign(assembled.toXDR());
      const res = await this.server.sendTransaction(StellarSdk.TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE) as any);
      
      stopTimer();
      return res.hash;
    } catch (error: any) {
      monitoring.log("error", "storeHash failed", error);
      throw error;
    }
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

  async vaultDeposit(amount: bigint) {
    const stopTimer = monitoring.startTimer("Vault Deposit Flow");
    try {
      const address = await this.connectWallet();
      const vaultContract = new StellarSdk.Contract(VAULT_CONTRACT_ID);
      const account = await this.server.getAccount(address);

      const tx = new StellarSdk.TransactionBuilder(account, {
        fee: "1000",
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(
          vaultContract.call("deposit", 
            StellarSdk.nativeToScVal(address, { type: "address" }),
            StellarSdk.nativeToScVal(TOKEN_CONTRACT_ID, { type: "address" }),
            StellarSdk.nativeToScVal(amount, { type: "i128" })
          )
        )
        .setTimeout(30)
        .build();

      const simulation = await this.server.simulateTransaction(tx);
      const assembled = StellarSdk.rpc.assembleTransaction(tx, simulation).build();
      const signedXdr = await this.sign(assembled.toXDR());
      const res = await this.server.sendTransaction(StellarSdk.TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE) as any);
      
      stopTimer();
      return res.hash;
    } catch (error: any) {
      monitoring.log("error", "vaultDeposit failed", error);
      throw error;
    }
  }

  async mintTokens(amount: bigint) {
    const stopTimer = monitoring.startTimer("Mint Tokens Flow");
    try {
      const address = await this.connectWallet();
      const tokenContract = new StellarSdk.Contract(TOKEN_CONTRACT_ID);
      const account = await this.server.getAccount(address);

      const tx = new StellarSdk.TransactionBuilder(account, {
        fee: "1000",
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(
          tokenContract.call("mint", 
            StellarSdk.nativeToScVal(address, { type: "address" }),
            StellarSdk.nativeToScVal(amount, { type: "i128" })
          )
        )
        .setTimeout(30)
        .build();

      const simulation = await this.server.simulateTransaction(tx);
      const assembled = StellarSdk.rpc.assembleTransaction(tx, simulation).build();
      const signedXdr = await this.sign(assembled.toXDR());
      const res = await this.server.sendTransaction(StellarSdk.TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE) as any);
      
      stopTimer();
      return res.hash;
    } catch (error: any) {
      monitoring.log("error", "mintTokens failed", error);
      throw error;
    }
  }

  async mintAndDeposit(amount: bigint) {
    const stopTimer = monitoring.startTimer("Multi-Call Interaction");
    try {
      const address = await this.connectWallet();
      const vaultContract = new StellarSdk.Contract(VAULT_CONTRACT_ID);
      const account = await this.server.getAccount(address);

      const tx = new StellarSdk.TransactionBuilder(account, {
        fee: "1500",
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(
          vaultContract.call("mint_and_deposit", 
            StellarSdk.nativeToScVal(address, { type: "address" }),
            StellarSdk.nativeToScVal(TOKEN_CONTRACT_ID, { type: "address" }),
            StellarSdk.nativeToScVal(amount, { type: "i128" })
          )
        )
        .setTimeout(30)
        .build();

      const simulation = await this.server.simulateTransaction(tx);
      const assembled = StellarSdk.rpc.assembleTransaction(tx, simulation).build();
      const signedXdr = await this.sign(assembled.toXDR());
      const res = await this.server.sendTransaction(StellarSdk.TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE) as any);
      
      stopTimer();
      return res.hash;
    } catch (error: any) {
      monitoring.log("error", "mintAndDeposit failed", error);
      throw error;
    }
  }

  // --- NEW: ADVANCED EVENT STREAMING ---
  async getContractEvents(contractId: string, limit: number = 10): Promise<any[]> {
    try {
      const response = await this.server.getEvents({
        startLedger: 1, // Use startLedger instead of 0
        filters: [
          {
            type: "contract",
            contractIds: [contractId],
          },
        ],
        limit: limit,
      } as any); // Use any to bypass strict union check if needed, but startLedger should work
      return response.events;
    } catch (error) {
      monitoring.log("error", "getEvents failed", error);
      return [];
    }
  }

  async subscribeToEvents(contractId: string, callback: (event: any) => void) {
    let lastSeenLedger = 0;
    
    try {
      const events = await this.getContractEvents(contractId, 1);
      if (events.length > 0) lastSeenLedger = events[0].ledger;
    } catch (e) {}

    const interval = setInterval(async () => {
      try {
        const response = await this.server.getEvents({
          startLedger: lastSeenLedger + 1,
          filters: [{ type: "contract", contractIds: [contractId] }],
          limit: 10,
        } as any);

        const newEvents = response.events;
        if (newEvents && newEvents.length > 0) {
          newEvents.forEach(callback);
          lastSeenLedger = Math.max(...newEvents.map(e => e.ledger));
        }
      } catch (error) {}
    }, 5000);

    return () => clearInterval(interval);
  }
}

export const stellarContractService = new StellarContractService();
