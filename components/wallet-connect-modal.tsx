"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SUPPORTED_WALLETS, stellarService, type WalletType } from "@/lib/stellar-service"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface WalletConnectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConnect: (publicKey: string, network: string, walletType: WalletType) => void
}

export function WalletConnectModal({ open, onOpenChange, onConnect }: WalletConnectModalProps) {
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedWallet, setSelectedWallet] = useState<WalletType | null>(null)

  const handleConnect = async (walletType: WalletType) => {
    setConnecting(true)
    setError(null)
    setSelectedWallet(walletType)

    try {
      const { publicKey, network } = await stellarService.connectWallet(walletType)
      onConnect(publicKey, network, walletType)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet")
    } finally {
      setConnecting(false)
      setSelectedWallet(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Connect Stellar Wallet</DialogTitle>
          <DialogDescription>Choose a wallet to connect to Nexus-Shield</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {SUPPORTED_WALLETS.map((wallet) => {
            // Determine colors based on wallet ID
            const colorStyles = {
              freighter: "border-indigo-500/50 hover:bg-indigo-500/10 hover:border-indigo-500 text-indigo-600 dark:text-indigo-400",
              albedo: "border-amber-500/50 hover:bg-amber-500/10 hover:border-amber-500 text-amber-600 dark:text-amber-400",
              xbull: "border-red-500/50 hover:bg-red-500/10 hover:border-red-500 text-red-600 dark:text-red-400",
              ledger: "border-slate-500/50 hover:bg-slate-500/10 hover:border-slate-500 text-slate-600 dark:text-slate-400",
            } as const;

            const walletColorClass = colorStyles[wallet.id as keyof typeof colorStyles] || "border-border hover:bg-accent";

            return (
              <Button
                key={wallet.id}
                variant="outline"
                className={cn(
                  "w-full justify-start h-auto py-4 px-4 disabled:opacity-50 disabled:cursor-not-allowed bg-transparent border-2 transition-all duration-200",
                  walletColorClass
                )}
                disabled={!wallet.enabled || connecting}
                onClick={() => handleConnect(wallet.id)}
              >
                <div className="flex items-center gap-3 w-full">
                  <span className="text-2xl">{wallet.icon}</span>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-foreground">{wallet.name}</div>
                    <div className="text-xs text-muted-foreground">{wallet.description}</div>
                  </div>
                  {connecting && selectedWallet === wallet.id && (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  )}
                  {wallet.enabled && !connecting && <CheckCircle2 className="h-4 w-4 text-muted-foreground" />}
                </div>
              </Button>
            )
          })}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground text-center">Connecting to Stellar Testnet</div>
      </DialogContent>
    </Dialog>
  )
}
