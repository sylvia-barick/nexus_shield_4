"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Edit, Trash2, Eye } from "lucide-react"
import type { Contract } from "@/lib/contract-service"
import { format } from "date-fns"

interface ContractListProps {
  contracts: Contract[]
  onView: (contract: Contract) => void
  onEdit: (contract: Contract) => void
  onDelete: (contract: Contract) => void
}

const statusColors = {
  draft: "bg-muted text-muted-foreground",
  review: "bg-chart-4/20 text-chart-4",
  approved: "bg-chart-2/20 text-chart-2",
  signed: "bg-primary/20 text-primary",
}

export function ContractList({ contracts, onView, onEdit, onDelete }: ContractListProps) {
  if (contracts.length === 0) {
    return (
      <Card className="border-border">
        <CardContent className="py-16 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No contracts yet</h3>
          <p className="text-muted-foreground">Create your first contract to get started</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {contracts.map((contract) => (
        <Card key={contract.id} className="border-border hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{contract.title}</CardTitle>
                </div>
                <CardDescription>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {contract.type}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {contract.jurisdiction}
                    </Badge>
                    <Badge className={`text-xs ${statusColors[contract.status]}`}>{contract.status}</Badge>
                  </div>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Created: {format(contract.createdAt, "MMM d, yyyy")}</div>
                <div>Updated: {format(contract.updatedAt, "MMM d, yyyy")}</div>
                {contract.blockchainHash && (
                  <div className="font-mono text-[10px] break-all max-w-[300px] text-zinc-500 mt-1">
                    Blockchain Hash: {contract.blockchainHash}
                  </div>
                )}
                {contract.parties.length > 0 && <div>Parties: {contract.parties.join(", ")}</div>}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onView(contract)}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => onEdit(contract)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => onDelete(contract)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
