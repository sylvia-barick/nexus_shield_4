export interface Contract {
  id: string
  title: string
  content: string
  status: "draft" | "review" | "approved" | "signed"
  createdAt: Date
  updatedAt: Date
  parties: string[]
  type: string
  jurisdiction: string
  blockchainHash?: string
  paymentHash?: string
}

export interface ContractTemplate {
  id: string
  name: string
  description: string
  content: string
  category: string
}

export const CONTRACT_TEMPLATES: ContractTemplate[] = [
  {
    id: "nda",
    name: "Non-Disclosure Agreement",
    description: "Standard NDA for protecting confidential information",
    category: "Confidentiality",
    content: `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement (the "Agreement") is entered into as of [DATE] by and between:

Party A: [PARTY A NAME]
Address: [PARTY A ADDRESS]

AND

Party B: [PARTY B NAME]  
Address: [PARTY B ADDRESS]

WHEREAS, the parties wish to explore a business relationship and may disclose confidential information to one another.

NOW, THEREFORE, in consideration of the mutual covenants and agreements herein contained, the parties agree as follows:

1. DEFINITION OF CONFIDENTIAL INFORMATION
"Confidential Information" means any information disclosed by one party to the other party, either directly or indirectly, in writing, orally, or by inspection of tangible objects.

2. OBLIGATIONS OF RECEIVING PARTY
Each party agrees to hold and maintain the Confidential Information in strictest confidence for the sole and exclusive benefit of the disclosing party.

3. TERM
This Agreement shall remain in effect for a period of [TIME PERIOD] from the date of disclosure.

4. GOVERNING LAW
This Agreement shall be governed by and construed in accordance with the laws of [JURISDICTION].`,
  },
  {
    id: "service",
    name: "Service Agreement",
    description: "Contract for provision of services",
    category: "Service",
    content: `SERVICE AGREEMENT

This Service Agreement (the "Agreement") is entered into as of [DATE] by and between:

Service Provider: [PROVIDER NAME]
Address: [PROVIDER ADDRESS]

AND

Client: [CLIENT NAME]
Address: [CLIENT ADDRESS]

1. SERVICES
The Service Provider agrees to provide the following services to the Client:
[DESCRIPTION OF SERVICES]

2. COMPENSATION
The Client agrees to pay the Service Provider:
Amount: [PAYMENT AMOUNT]
Payment Terms: [PAYMENT TERMS]

3. TERM AND TERMINATION
This Agreement shall commence on [START DATE] and continue until [END DATE], unless terminated earlier.

4. CONFIDENTIALITY
Both parties agree to maintain confidentiality of proprietary information.

5. GOVERNING LAW
This Agreement shall be governed by the laws of [JURISDICTION].`,
  },
  {
    id: "partnership",
    name: "Partnership Agreement",
    description: "Agreement for business partnership",
    category: "Partnership",
    content: `PARTNERSHIP AGREEMENT

This Partnership Agreement (the "Agreement") is entered into as of [DATE] by and between:

Partner 1: [PARTNER 1 NAME]
Address: [PARTNER 1 ADDRESS]

AND

Partner 2: [PARTNER 2 NAME]
Address: [PARTNER 2 ADDRESS]

1. FORMATION
The partners hereby form a partnership to conduct business as [BUSINESS NAME].

2. CAPITAL CONTRIBUTIONS
Each partner shall contribute the following to the partnership:
Partner 1: [CONTRIBUTION]
Partner 2: [CONTRIBUTION]

3. PROFIT AND LOSS DISTRIBUTION
Profits and losses shall be distributed as follows:
Partner 1: [PERCENTAGE]%
Partner 2: [PERCENTAGE]%

4. MANAGEMENT
Partners shall have equal rights in the management of the partnership business.

5. GOVERNING LAW
This Agreement shall be governed by the laws of [JURISDICTION].`,
  },
]

export class ContractService {
  private static instance: ContractService
  private contracts: Contract[] = []
  private readonly STORAGE_KEY = "nexus-shield-contracts"

  private constructor() {
    this.loadContracts()
  }

  static getInstance(): ContractService {
    if (!ContractService.instance) {
      ContractService.instance = new ContractService()
    }
    return ContractService.instance
  }

  private loadContracts() {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(this.STORAGE_KEY)
        if (stored) {
          this.contracts = JSON.parse(stored).map((c: any) => ({
            ...c,
            createdAt: new Date(c.createdAt),
            updatedAt: new Date(c.updatedAt),
          }))
        }
      } catch (error) {
        console.error("Failed to load contracts from local storage:", error)
        this.contracts = []
      }
    }
  }

  private saveContracts() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.contracts))
      } catch (error) {
        console.error("Failed to save contracts to local storage:", error)
      }
    }
  }

  createContract(title: string, content: string, type: string, jurisdiction: string, parties: string[]): Contract {
    const contract: Contract = {
      id: `contract-${Date.now()}`,
      title,
      content,
      status: "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
      parties,
      type,
      jurisdiction,
    }
    this.contracts.push(contract)
    this.saveContracts()
    return contract
  }

  getContracts(): Contract[] {
    // Reload from storage to ensure we have the latest if modified elsewhere
    this.loadContracts()
    return [...this.contracts]
  }

  getContract(id: string): Contract | undefined {
    this.loadContracts()
    return this.contracts.find((c) => c.id === id)
  }

  updateContract(id: string, updates: Partial<Contract>): Contract | undefined {
    const index = this.contracts.findIndex((c) => c.id === id)
    if (index === -1) return undefined

    this.contracts[index] = {
      ...this.contracts[index],
      ...updates,
      updatedAt: new Date(),
    }
    this.saveContracts()
    return this.contracts[index]
  }

  deleteContract(id: string): boolean {
    const index = this.contracts.findIndex((c) => c.id === id)
    if (index === -1) return false

    this.contracts.splice(index, 1)
    this.saveContracts()
    return true
  }
}

export const contractService = ContractService.getInstance()
