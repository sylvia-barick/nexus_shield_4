"use client"

import { useState, useEffect } from "react"
import { Activity, Radio, Clock, Hash, Database } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { stellarContractService, TOKEN_CONTRACT_ID, VAULT_CONTRACT_ID } from "@/lib/stellar-contract-service"
import { motion, AnimatePresence } from "framer-motion"

interface SorobanEvent {
  id: string
  ledger: number
  contractId: string
  topic: string[]
  value: any
}

export function SorobanEventStream() {
  const [events, setEvents] = useState<SorobanEvent[]>([])
  const [isLive, setIsLive] = useState(true)

  useEffect(() => {
    if (!isLive) return

    // Initial load
    stellarContractService.getContractEvents(TOKEN_CONTRACT_ID, 5).then(newEvents => {
        const formatted = newEvents.map((e: any) => ({
            id: e.id,
            ledger: e.ledger,
            contractId: e.contractId,
            topic: e.topic.map((t: any) => t.toString()), // Simplified
            value: e.value // Simplified
        }));
        setEvents(formatted);
    });

    // Subscriptions for both contracts
    const unsubToken = stellarContractService.subscribeToEvents(TOKEN_CONTRACT_ID, (event) => {
      setEvents(prev => [{
        id: event.id,
        ledger: event.ledger,
        contractId: event.contractId,
        topic: event.topic.map((t: any) => t.toString()),
        value: event.value
      }, ...prev].slice(0, 10))
    })

    const unsubVault = stellarContractService.subscribeToEvents(VAULT_CONTRACT_ID, (event) => {
        setEvents(prev => [{
          id: event.id,
          ledger: event.ledger,
          contractId: event.contractId,
          topic: event.topic.map((t: any) => t.toString()),
          value: event.value
        }, ...prev].slice(0, 10))
      })

    return () => {
      unsubToken.then(u => u())
      unsubVault.then(u => u())
    }
  }, [isLive])

  return (
    <Card className="bg-card/50 border-border backdrop-blur-sm overflow-hidden">
      <CardHeader className="border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className={`h-5 w-5 ${isLive ? "text-red-500 animate-pulse" : "text-muted-foreground"}`} />
            <CardTitle className="text-xl">Real-Time Event Stream</CardTitle>
          </div>
          <Badge variant={isLive ? "default" : "secondary"} onClick={() => setIsLive(!isLive)} className="cursor-pointer">
            {isLive ? "LIVE" : "PAUSED"}
          </Badge>
        </div>
        <CardDescription>Live contract events from Soroban (Nexus-Shield & Tokens)</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[400px] overflow-y-auto font-mono text-xs">
          <AnimatePresence initial={false}>
            {events.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p>Waiting for events...</p>
              </div>
            ) : (
              events.map((event, idx) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`p-4 border-b border-border/30 hover:bg-accent/5 transition-colors ${idx === 0 ? "bg-primary/5" : ""}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Ledger: {event.ledger}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] scale-90 border-muted-foreground/20">
                      {event.contractId === TOKEN_CONTRACT_ID ? "TOKEN" : "VAULT"}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex gap-2">
                      <span className="text-primary font-bold">TOPIC:</span>
                      <span className="text-foreground truncate">{event.topic.join(" → ")}</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-accent font-bold">DATA:</span>
                        <span className="text-zinc-400 break-all">
                          {JSON.stringify(event.value, (key, value) =>
                            typeof value === 'bigint' ? value.toString() : value
                          )}
                        </span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  )
}
