"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Bot, Link2, Loader2, CheckCircle2, ExternalLink } from "lucide-react"
import { contractService, type Contract } from "@/lib/contract-service"
import { stellarContractService } from "@/lib/stellar-contract-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ContractEditorProps {
  initialContract?: Contract
  requiresBlockchainAction?: boolean
  onSave: (contract: Contract) => void
  onCancel: () => void
}

export function ContractEditor({ initialContract, requiresBlockchainAction, onSave, onCancel }: ContractEditorProps) {
  const [title, setTitle] = useState(initialContract?.title || "")
  const [content, setContent] = useState(initialContract?.content || "")
  const [type, setType] = useState(initialContract?.type || "")
  const [jurisdiction, setJurisdiction] = useState(initialContract?.jurisdiction || "")
  const [parties, setParties] = useState(initialContract?.parties.join(", ") || "")
  const [saving, setSaving] = useState(false)
  const [blockchainStatus, setBlockchainStatus] = useState<"idle" | "payment" | "anchoring" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [txStatus, setTxStatus] = useState<string>("")
  const [paymentHash, setPaymentHash] = useState<string | null>(null)
  const [anchorHash, setAnchorHash] = useState<string | null>(null)

  const handleSave = async () => {
    setSaving(true)
    setErrorMessage(null)

    const partiesArray = parties
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean)

    try {
      let contract: Contract
      if (initialContract) {
        const updated = contractService.updateContract(initialContract.id, {
          title,
          content,
          type,
          jurisdiction,
          parties: partiesArray,
        })
        contract = updated!
      } else {
        contract = contractService.createContract(title, content, type, jurisdiction, partiesArray)
      }

      // Handle template-specific blockchain interactions
      if (requiresBlockchainAction) {
        setTxStatus("pending")
        // Step 1: 5 XLM Payment
        setBlockchainStatus("payment")
        const destination = "GBYOEY63WVKXY5KTSQZG4FGCDYY2CV7K3SH4ZSVN6IFDWJ464HPFIEIQ"
        const pHash = await stellarContractService.sendPayment("5", destination)
        setPaymentHash(pHash)

        // Step 2: Anchor to Blockchain (Connect Smart Contract)
        setBlockchainStatus("anchoring")
        // Use contract ID or a hash of the content as the fingerprint
        const fingerprint = `nexus_${contract.id.split("-")[1]}` 
        const aHash = await stellarContractService.storeHash(fingerprint)
        setAnchorHash(aHash)
        
        // Update contract with hashes
        contract = contractService.updateContract(contract.id, {
          paymentHash: pHash,
          blockchainHash: aHash
        })!
        
        setBlockchainStatus("success")
        setTxStatus("success")
      }

      // Success!
      setTimeout(() => {
        setSaving(false)
        onSave(contract)
      }, 1500)
    } catch (error: any) {
      console.error("Save error:", error)
      setSaving(false)
      setBlockchainStatus("error")
      setTxStatus("failed")
      
      let msg = error.message || "An error occurred while saving the contract."
      
      if (msg.includes("Wallet not found") || msg.includes("isConnected")) {
        msg = "Wallet not found. Please install the Freighter browser extension."
      } else if (msg.includes("User declined") || msg.includes("rejected")) {
        msg = "Transaction rejected. Please approve the transaction in your wallet."
      } else if (msg.includes("insufficient") || msg.includes("balance")) {
        msg = "Insufficient balance. Please fund your testnet account with XLM."
      }
      
      setErrorMessage(msg)
    }
  }

  const isValid = title.trim() && content.trim() && type && jurisdiction

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Contract Details</CardTitle>
          <CardDescription>Basic information about the contract</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Contract Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Service Agreement with Acme Corp"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Contract Type *</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nda">Non-Disclosure Agreement</SelectItem>
                  <SelectItem value="service">Service Agreement</SelectItem>
                  <SelectItem value="partnership">Partnership Agreement</SelectItem>
                  <SelectItem value="employment">Employment Contract</SelectItem>
                  <SelectItem value="sales">Sales Contract</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jurisdiction">Jurisdiction *</Label>
              <Select value={jurisdiction} onValueChange={setJurisdiction}>
                <SelectTrigger id="jurisdiction">
                  <SelectValue placeholder="Select jurisdiction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us">United States</SelectItem>
                  <SelectItem value="uk">United Kingdom</SelectItem>
                  <SelectItem value="eu">European Union</SelectItem>
                  <SelectItem value="singapore">Singapore</SelectItem>
                  <SelectItem value="canada">Canada</SelectItem>
                  <SelectItem value="australia">Australia</SelectItem>
                  <SelectItem value="international">International</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="parties">Parties (comma-separated)</Label>
              <Input
                id="parties"
                placeholder="e.g., Company A, Company B"
                value={parties}
                onChange={(e) => setParties(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Contract Content</CardTitle>
          <CardDescription>Draft your contract text below</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Enter contract content here..."
            className="min-h-[400px] font-mono text-sm"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card className="border-border bg-muted/30">
        <CardHeader>
          <CardTitle className="text-sm">AI-Powered Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm font-medium">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" disabled>
              <Bot className="h-4 w-4 mr-2" />
              Analyze Risks
            </Button>
            <Button variant="outline" size="sm" disabled>
              <Bot className="h-4 w-4 mr-2" />
              Check Compliance
            </Button>
            <Button variant="outline" size="sm" disabled={requiresBlockchainAction}>
              <Link2 className="h-4 w-4 mr-2" />
              Anchor to Blockchain
            </Button>
          </div>

          {blockchainStatus !== "idle" && (
            <div className="pt-2 border-t border-border/50">
              {blockchainStatus === "payment" && (
                <div className="flex items-center text-primary animate-pulse">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing 5 XLM Template Fee...
                </div>
              )}
              {blockchainStatus === "anchoring" && (
                <div className="flex items-center text-secondary animate-pulse">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting Smart Contract to Stellar...
                </div>
              )}
              {blockchainStatus === "success" && (
                <div className="flex items-center text-green-500">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Blockchain Integration Successful!
                </div>
              )}
            </div>
          )}

          <div className="space-y-1 font-mono text-sm mt-4 border-t border-border/20 pt-4">
            {txStatus === "pending" && <p className="text-yellow-500 animate-pulse">⏳ Transaction Pending...</p>}
            {txStatus === "success" && (
              <div className="space-y-2">
                <p className="text-green-500 font-bold">✅ Transaction Successful</p>
                {paymentHash && (
                  <div className="text-[10px] text-muted-foreground break-all bg-background/50 p-2 rounded border border-border/20">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-primary uppercase text-[8px]">Fee Payment Hash</span>
                      <a 
                        href={`https://stellar.expert/explorer/testnet/tx/${paymentHash}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center"
                      >
                        Explorer <ExternalLink className="h-2 w-2 ml-1" />
                      </a>
                    </div>
                    {paymentHash}
                  </div>
                )}
                {anchorHash && (
                  <div className="text-[10px] text-muted-foreground break-all bg-background/50 p-2 rounded border border-border/20">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-secondary uppercase text-[8px]">Anchor/Connect Hash</span>
                      <a 
                        href={`https://stellar.expert/explorer/testnet/tx/${anchorHash}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-secondary hover:underline flex items-center"
                      >
                        Explorer <ExternalLink className="h-2 w-2 ml-1" />
                      </a>
                    </div>
                    {anchorHash}
                  </div>
                )}
              </div>
            )}
            {txStatus === "failed" && <p className="text-red-500">❌ Transaction Failed</p>}
          </div>

          {errorMessage && (
            <Alert variant="destructive" className="mt-4">
              <Bot className="h-4 w-4" />
              <AlertTitle>Blockchain Error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!isValid || saving} className="bg-primary hover:bg-primary/90">
          {saving ? (
            <>Saving...</>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Contract
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
