"use client"

import { useState, useEffect } from "react"
import { 
  Card, CardContent, CardDescription, 
  CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  Bot, Loader2, CheckCircle2, AlertCircle, 
  RefreshCcw, ShieldCheck, Database, Key, Send 
} from "lucide-react"
import { stellarContractService } from "@/lib/stellar-contract-service"

export function StellarSorobanInteraction() {
  const [hashInput, setHashInput] = useState("")
  const [storedHash, setStoredHash] = useState<string | null>(null)
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "failed">("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)

  const CONTRACT_ID = "CDE6BW24RTQKPXWBJAG4MRXWB6HW5T26OZ4KVXLXX2PY76HB2RNUQZMR"

  // Load contract data on mount
  useEffect(() => {
    fetchLatestHash()
  }, [])

  const fetchLatestHash = async () => {
    try {
      const h = await stellarContractService.getHash()
      setStoredHash(h)
    } catch (e) {
      console.error("Failed to fetch hash:", e)
    }
  }

  const handleStoreHash = async () => {
    if (!hashInput.trim()) return

    setStatus("pending")
    setErrorMessage(null)
    setTxHash(null)

    try {
      const tx = await stellarContractService.storeHash(hashInput.trim())
      setTxHash(tx)
      setStatus("success")
      
      // Step 5: Real-time event update - refresh UI
      await fetchLatestHash()
      setHashInput("")
      
    } catch (error: any) {
      console.error(error)
      setStatus("failed")
      
      // Step 4: Add 3 error handling cases
      let msg = error.message || "Unknown error"
      
      if (msg.includes("Wallet not found") || msg.includes("isConnected")) {
        msg = "Wallet not found. Please install Freighter."
      } else if (msg.includes("User declined") || msg.includes("rejected")) {
        msg = "Transaction rejected. Please approve in your wallet."
      } else if (msg.includes("insufficient") || msg.includes("balance")) {
        msg = "Insufficient balance. Please fund your testnet account."
      }
      
      setErrorMessage(msg)
      alert(msg) // Match user instruction for alert
    }
  }

  return (
    <Card className="border-border bg-card/80 backdrop-blur-md shadow-lg border-2">
      <CardHeader className="bg-primary/5 border-b border-border/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-md">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Soroban Contract Interaction</CardTitle>
              <CardDescription>Store & verify contract fingerprints on-chain</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 font-mono text-[10px]">
            TESTNET ACTIVE
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Contract ID Section */}
        <div className="p-4 bg-muted/30 rounded-lg border border-border/50 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            <Key className="h-3 w-3" /> Deployed Contract ID
          </div>
          <div className="font-mono text-sm break-all bg-background/50 p-2 rounded border border-border/20 text-foreground">
            {CONTRACT_ID}
          </div>
        </div>

        {/* Transaction Status UI (Step 3) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4" /> Interaction
            </h4>
            
            {status === "pending" && (
              <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 animate-pulse">
                ⏳ Pending
              </Badge>
            )}
            {status === "success" && (
              <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                ✅ Success
              </Badge>
            )}
            {status === "failed" && (
              <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
                ❌ Failed
              </Badge>
            )}
          </div>

          <div className="flex gap-2">
            <Input 
              value={hashInput}
              onChange={(e) => setHashInput(e.target.value)}
              placeholder="Enter contract fingerprint (e.g. hash_v1)"
              disabled={status === "pending"}
              className="bg-background/50 border-border"
            />
            <Button 
              onClick={handleStoreHash} 
              disabled={status === "pending" || !hashInput.trim()}
              className="bg-primary hover:bg-primary/90 text-white min-w-[120px]"
            >
              {status === "pending" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>Store Hash <Send className="h-4 w-4 ml-2" /></>
              )}
            </Button>
          </div>
        </div>

        {/* Success / Error Display */}
        {status === "success" && txHash && (
          <Alert className="bg-green-500/5 border-green-500/20 text-green-700 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription className="text-xs break-all font-mono opacity-80">
              Tx: {txHash}
            </AlertDescription>
          </Alert>
        )}

        {status === "failed" && errorMessage && (
          <Alert variant="destructive" className="bg-red-500/5 border-red-500/20 text-red-600 dark:text-red-400">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Transaction Failed</AlertTitle>
            <AlertDescription className="text-sm">{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Data from Contract (Step 6) */}
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold flex items-center gap-2">
              <Bot className="h-4 w-4" /> On-Chain Data
            </div>
            <Button variant="ghost" size="icon" onClick={fetchLatestHash} className="h-6 w-6">
              <RefreshCcw className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-background border rounded-md">
            <span className="text-xs font-mono text-muted-foreground uppercase">Stored Hash</span>
            <span className="font-bold font-mono text-primary">{storedHash || "None"}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-3 w-3 text-green-500" />
            Verification Status: <span className="text-green-500 font-medium">{storedHash ? "Verified ✔" : "Unverified"}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-muted/10 border-t border-border/10 flex justify-center py-4">
        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
          <ShieldCheck className="h-3 w-3" /> Secured by Stellar Testnet & Soroban Smart Contracts
        </p>
      </CardFooter>
    </Card>
  )
}
