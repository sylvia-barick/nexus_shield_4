"use client"

import { useState } from "react"
import { Coins, Landmark, ArrowRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { stellarContractService } from "@/lib/stellar-contract-service"
import { toast } from "sonner"

export function StellarAdvancedInteractions() {
  const [mintAmount, setMintAmount] = useState("100")
  const [depositAmount, setDepositAmount] = useState("50")
  const [loading, setLoading] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [hasError, setHasError] = useState(false)

  const handleMint = async () => {
    setLoading("minting")
    setTxHash(null)
    setHasError(false)
    try {
      const hash = await stellarContractService.mintTokens(BigInt(mintAmount))
      setTxHash(hash)
      toast.success("Tokens minted successfully!")
    } catch (error: any) {
      console.error(error)
      setHasError(true)
      toast.error(error.message || "Minting failed")
    } finally {
      setLoading(null)
    }
  }

  const handleDeposit = async () => {
    setLoading("depositing")
    setTxHash(null)
    setHasError(false)
    try {
      const hash = await stellarContractService.vaultDeposit(BigInt(depositAmount))
      setTxHash(hash)
      toast.success("Inter-contract deposit successful!")
    } catch (error: any) {
      console.error(error)
      setHasError(true)
      toast.error(error.message || "Deposit failed")
    } finally {
      setLoading(null)
    }
  }

  const handleFullTest = async () => {
    setLoading("testing")
    setTxHash(null)
    setHasError(false)
    try {
      const hash = await stellarContractService.mintAndDeposit(BigInt(mintAmount))
      setTxHash(hash)
      toast.success("Comprehensive test successful!")
    } catch (error: any) {
      console.error(error)
      setHasError(true)
      toast.error(error.message || "Test interaction failed")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="bg-card/50 border-border backdrop-blur-sm overflow-hidden">
        <CardHeader className="bg-primary/5 border-b border-primary/10">
          <div className="flex items-center gap-2 mb-1">
            <Coins className="h-5 w-5 text-primary" />
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-primary/20 text-primary">Requirement 1</Badge>
          </div>
          <CardTitle className="text-xl">Custom Nexus Token</CardTitle>
          <CardDescription>Mint custom Soroban tokens to your wallet</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-muted-foreground">Amount to Mint (NXST)</label>
            <div className="flex gap-2">
              <Input 
                type="number" 
                value={mintAmount} 
                onChange={(e) => setMintAmount(e.target.value)}
                className="bg-background border-border"
              />
              <Button 
                onClick={handleMint} 
                disabled={loading !== null}
                className="shrink-0"
              >
                {loading === "minting" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Mint Tokens"}
              </Button>
            </div>
          </div>
          <div className="p-3 bg-primary/5 rounded-md border border-primary/10">
            <p className="text-xs text-muted-foreground italic">
              Demonstrates a custom Soroban token contract implementation with minting logic.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border backdrop-blur-sm overflow-hidden">
        <CardHeader className="bg-accent/5 border-b border-accent/10">
          <div className="flex items-center gap-2 mb-1">
            <Landmark className="h-5 w-5 text-accent" />
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-accent/20 text-accent">Requirement 2</Badge>
          </div>
          <CardTitle className="text-xl">Inter-Contract Vault</CardTitle>
          <CardDescription>Vault calls Token contract to transfer funds</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-muted-foreground">Amount to Deposit (NXST)</label>
            <div className="flex gap-2">
              <Input 
                type="number" 
                value={depositAmount} 
                onChange={(e) => setDepositAmount(e.target.value)}
                className="bg-background border-border"
              />
              <Button 
                onClick={handleDeposit} 
                variant="default"
                disabled={loading !== null}
                className="shrink-0 bg-accent hover:bg-accent/90 text-white"
              >
                {loading === "depositing" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Deposit to Vault"}
              </Button>
            </div>
          </div>
          <div className="p-3 bg-accent/5 rounded-md border border-accent/10">
            <p className="text-xs text-muted-foreground italic">
              Demonstrates Contract A (Vault) calling Contract B (Token) securely on-chain.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border backdrop-blur-sm overflow-hidden md:col-span-2">
        <CardHeader className="bg-indigo-500/5 border-b border-indigo-500/10">
          <div className="flex items-center gap-2 mb-1">
            <ArrowRight className="h-5 w-5 text-indigo-500" />
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-indigo-500/20 text-indigo-500">Requirements 1 & 2</Badge>
          </div>
          <CardTitle className="text-xl">Contract Interaction Test</CardTitle>
          <CardDescription>Step 2: Mint → Transfer flow in a single transaction</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="space-y-2 flex-1">
              <label className="text-xs font-semibold uppercase text-muted-foreground">Test Amount (NXST)</label>
              <Input 
                type="number" 
                value={mintAmount} 
                onChange={(e) => setMintAmount(e.target.value)}
                className="bg-background border-border"
              />
            </div>
            <Button 
              onClick={handleFullTest} 
              disabled={loading !== null}
              className="w-full md:w-auto bg-indigo-500 hover:bg-indigo-600 text-white"
            >
              {loading === "testing" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              Run Full Interaction Test
            </Button>
          </div>
          <div className="p-3 bg-indigo-500/5 rounded-md border border-indigo-500/10 flex items-start gap-2">
            <div className="p-1 rounded bg-indigo-500/20">
              <Landmark className="h-4 w-4 text-indigo-500" />
            </div>
            <p className="text-xs text-muted-foreground">
              This triggers <strong>Vault::mint_and_deposit</strong>, which performs two inter-contract calls to <strong>Token::mint</strong> and <strong>Token::transfer</strong>.
            </p>
          </div>
        </CardContent>
      </Card>

      {txHash && (
        <Card className="md:col-span-2 border-green-500/20 bg-green-500/5 animate-in fade-in duration-500">
          <CardContent className="py-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-500/20">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-green-500 font-mono tracking-tight uppercase">TRANSACTION HASH RECORDED</p>
                <p className="text-xs font-mono text-green-500/70 break-all max-w-[300px] lg:max-w-md">{txHash}</p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="border-green-500/20 text-green-500 hover:bg-green-500/10 w-full md:w-auto" asChild>
              <a href={`https://stellar.expert/explorer/testnet/tx/${txHash}`} target="_blank" rel="noreferrer">
                View on Explorer
              </a>
            </Button>
          </CardContent>
        </Card>
      )}

      {hasError && (
         <Card className="md:col-span-2 border-red-500/20 bg-red-500/5 animate-in slide-in-from-top-4 duration-500">
          <CardContent className="py-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-sm font-bold text-red-500 uppercase tracking-wide">Operation Failed</p>
              <p className="text-xs text-red-500/70">Transaction rejected or failed. Check console for technical details.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
