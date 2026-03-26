import * as freighterApiModule from "@stellar/freighter-api";
import albedo from "@albedo-link/intent";

// Handle both standard ESM and potential default export wrappers
const freighterApi = (freighterApiModule as any).default || freighterApiModule;
const { isConnected, getAddress, getNetwork, isAllowed, setAllowed } = freighterApi;

export type WalletType = "freighter" | "albedo" | "xbull" | "ledger" | "lobstr" | "rabet" | "hana"

export interface WalletInfo {
  id: WalletType
  name: string
  icon: string
  enabled: boolean
  description: string
}

export const SUPPORTED_WALLETS: WalletInfo[] = [
  {
    id: "freighter",
    name: "Freighter",
    icon: "🚢",
    enabled: true,
    description: "Chrome Extension",
  },
  {
    id: "albedo",
    name: "Albedo",
    icon: "🌟",
    enabled: true,
    description: "Web-based Wallet (No extension required)",
  },
  {
    id: "xbull",
    name: "xBull",
    icon: "🐂",
    enabled: false,
    description: "Multi-platform Wallet",
  },
  {
    id: "ledger",
    name: "Ledger",
    icon: "🧊",
    enabled: false,
    description: "Hardware Wallet",
  },

]

export class StellarWalletService {
  private static instance: StellarWalletService

  private constructor() { }

  static getInstance(): StellarWalletService {
    if (!StellarWalletService.instance) {
      StellarWalletService.instance = new StellarWalletService()
    }
    return StellarWalletService.instance
  }

  async isFreighterInstalled(): Promise<boolean> {
    try {
      const { isConnected: connected } = await isConnected()
      return connected
    } catch {
      return false
    }
  }

  async connectFreighter(): Promise<{ publicKey: string; network: string }> {
    const connected = await this.isFreighterInstalled()

    if (!connected) {
      throw new Error("Freighter wallet is not installed. Please install the Freighter browser extension.")
    }

    try {
      // Check if already allowed
      const { isAllowed: allowed } = await isAllowed()

      if (!allowed) {
        // Request permission
        await setAllowed()
      }

      // Get public key (address)
      const { address } = await getAddress()

      // Get network (should be testnet for this project)
      const { network } = await getNetwork()

      return { publicKey: address, network }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to connect to Freighter: ${error.message}`)
      }
      throw new Error("Failed to connect to Freighter: Unknown error")
    }
  }

  async connectAlbedo(): Promise<{ publicKey: string; network: string }> {
    try {
      const { pubkey } = await albedo.publicKey({});
      // Albedo handles multiple networks but for this project we assume testnet
      return { publicKey: pubkey, network: "TESTNET" };
    } catch (error: any) {
      throw new Error(`Failed to connect to Albedo: ${error.message || "Unknown error"}`);
    }
  }

  shortenAddress(address: string): string {
    if (!address || address.length < 12) return address
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  async connectWallet(walletType: WalletType): Promise<{ publicKey: string; network: string }> {
    switch (walletType) {
      case "freighter":
        return this.connectFreighter()
      case "albedo":
        return this.connectAlbedo()
      case "xbull":
        throw new Error("xBull wallet integration coming soon")
      case "ledger":
        throw new Error("Ledger wallet integration coming soon")
      default:
        throw new Error(`Wallet ${walletType} is not available`)
    }
  }
}

export const stellarService = StellarWalletService.getInstance();
