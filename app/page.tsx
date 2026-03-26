"use client"

import { useState, useEffect } from "react"
import { Shield, FileText, Bot, Link2, Activity, TrendingUp, Users, Plus, Search, Sparkles, Pencil, Star, Briefcase, Scale, Globe, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { WalletConnectModal } from "@/components/wallet-connect-modal"
import { ThemeToggle } from "@/components/theme-toggle"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardMobileNav } from "@/components/dashboard-mobile-nav"
import { ContractTemplateSelector } from "@/components/contract-template-selector"
import { ContractEditor } from "@/components/contract-editor"
import { ContractList } from "@/components/contract-list"
import { ContractAnalysisChatbot } from "@/components/contract-analysis-chatbot"
import { BlockchainAuditTrail } from "@/components/blockchain-audit-trail"
import { StellarSorobanInteraction } from "@/components/stellar-soroban-interaction"
import { stellarService, type WalletType } from "@/lib/stellar-service"
import { stellarContractService } from "@/lib/stellar-contract-service"
import { contractService, type Contract, type ContractTemplate } from "@/lib/contract-service"
import { DottedSurface } from "@/components/ui/dotted-surface"
import { Tiles } from "@/components/ui/tiles"
import { CreativePricing, type PricingTier } from "@/components/ui/creative-pricing"

const pricingTiers: PricingTier[] = [
  {
    name: "Starter",
    icon: <Briefcase className="w-6 h-6" />,
    price: 29,
    description: "For small businesses entering global trade",
    color: "secondary",
    features: [
      "Contract drafting & version tracking",
      "AI clause summary & basic risk flags",
      "Multi-language contract reading",
      "Contract hash anchoring on Stellar",
      "Wallet-based contract signing",
      "Basic audit timeline",
    ],
  },
  {
    name: "Professional",
    icon: <Scale className="w-6 h-6" />,
    price: 99,
    description: "For frequent cross-border contracts",
    color: "primary",
    features: [
      "Everything in Starter",
      "AI jurisd. & Incoterms risk detection",
      "Split-screen comparison + AI highlights",
      "Trade Q&A chatbot (document-aware)",
      "Soroban milestone approvals",
      "Detailed on-chain audit trail",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    icon: <Building2 className="w-6 h-6" />,
    price: 249,
    description: "For high-volume, mission-critical trade",
    color: "accent",
    features: [
      "Everything in Professional",
      "Multi-party contract workflows",
      "Advanced compliance & liability analysis",
      "Real-time Stellar status dashboard",
      "Automated milestone sealing & logs",
      "Enterprise privacy (off-chain + proofs)",
    ],
  },
];

export default function HomePage() {
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string>("")
  const [network, setNetwork] = useState<string>("")
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [activeSection, setActiveSection] = useState("overview")

  const [workbenchView, setWorkbenchView] = useState<"list" | "select" | "edit">("list")
  const [editingContract, setEditingContract] = useState<Contract | undefined>()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [contractsView, setContractsView] = useState<"list" | "view">("list")
  const [viewingContract, setViewingContract] = useState<Contract | undefined>()
  const [requiresBlockchainAction, setRequiresBlockchainAction] = useState(false)

  useEffect(() => {
    // Load contracts from persistence store on mount
    setContracts(contractService.getContracts())
  }, [])

  const handleWalletConnect = (publicKey: string, networkType: string, walletType: WalletType) => {
    setWalletAddress(publicKey)
    setNetwork(networkType)
    setWalletConnected(true)
    stellarContractService.setAddress(publicKey)
    stellarContractService.setWalletType(walletType)
  }

  const handleDisconnect = () => {
    setWalletConnected(false)
    setWalletAddress("")
    setNetwork("")
    setActiveSection("overview")
  }

  const handleStartNewContract = () => {
    setWorkbenchView("select")
  }

  const handleSelectTemplate = (template: ContractTemplate) => {
    const newContract = contractService.createContract(
      template.name,
      template.content,
      template.category,
      "international",
      [],
    )
    setEditingContract(newContract)
    setRequiresBlockchainAction(true)
    setWorkbenchView("edit")
  }

  const handleStartBlank = () => {
    setEditingContract(undefined)
    setRequiresBlockchainAction(true)
    setWorkbenchView("edit")
  }

  const handleSaveContract = (contract: Contract) => {
    setContracts(contractService.getContracts())
    setWorkbenchView("list")
    setEditingContract(undefined)
    setActiveSection("contracts")
  }

  const handleCancelEdit = () => {
    setWorkbenchView("list")
    setEditingContract(undefined)
    setRequiresBlockchainAction(false)
  }

  const handleViewContract = (contract: Contract) => {
    setViewingContract(contract)
    setContractsView("view")
  }

  const handleEditContract = (contract: Contract) => {
    setEditingContract(contract)
    setRequiresBlockchainAction(false)
    setActiveSection("workbench")
    setWorkbenchView("edit")
  }

  const handleDeleteContract = (contract: Contract) => {
    if (confirm(`Are you sure you want to delete "${contract.title}"?`)) {
      contractService.deleteContract(contract.id)
      setContracts(contractService.getContracts())
    }
  }

  if (!walletConnected) {
    return (
      <div className="min-h-screen bg-background font-sans">
        {/* Navigation */}
        <nav className="border-b-2 border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center gap-2">
                <div className="bg-primary text-primary-foreground p-2 rounded-md border-2 border-black shadow-[4px_4px_0px_0px_#000]">
                  <Shield className="h-6 w-6" />
                </div>
                <span className="font-bold text-2xl text-foreground tracking-tight">Nexus-Shield</span>
              </div>

              <div className="hidden md:flex items-center gap-6">
                <a href="#features" className="text-base font-medium hover:underline decoration-2 underline-offset-4">
                  Features
                </a>
                <a
                  href="#how-it-works"
                  className="text-base font-medium hover:underline decoration-2 underline-offset-4"
                >
                  How It Works
                </a>
                <a href="#pricing" className="text-base font-medium hover:underline decoration-2 underline-offset-4">
                  Pricing
                </a>
                <ThemeToggle />
                <Button onClick={() => setShowWalletModal(true)} size="lg" className="font-bold text-base">
                  Connect Wallet
                </Button>
              </div>

              <div className="md:hidden flex items-center gap-2">
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowWalletModal(true)}
                  className="hover:bg-accent"
                >
                  <Shield className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="py-24 lg:py-32 relative overflow-hidden bg-secondary/10">
          <div className="absolute inset-0 z-0">
            <Tiles rows={60} cols={15} tileSize="md" />
          </div>
          <div className="container mx-auto px-4 lg:px-8 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <Badge variant="outline" className="text-sm px-4 py-1 border-2 border-black bg-white text-black shadow-[4px_4px_0px_0px_#000] rotate-[-1deg]">
                Powered by Stellar Blockchain
              </Badge>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-foreground leading-[1.1]">
                Secure. Intelligent. <br />
                <span className="text-primary underline decoration-4 underline-offset-4 decoration-black">Borderless</span>.
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium font-mono">
                Next-gen Contract Lifecycle Management with AI & Blockchain.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
                <Button
                  size="lg"
                  onClick={() => setShowWalletModal(true)}
                  className="text-xl h-16 px-10 border-2 border-black shadow-[6px_6px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] transition-all"
                >
                  Connect Stellar Wallet
                </Button>
                <Button size="lg" variant="secondary" className="text-xl h-16 px-10 border-2 border-black shadow-[6px_6px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] transition-all bg-white text-black hover:bg-zinc-50">
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 border-y-2 border-black">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 font-handwritten rotate-1">Why Nexus-Shield?</h2>
              <p className="text-muted-foreground text-xl max-w-2xl mx-auto font-mono">
                The brutal truth about modern contract management.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="hover:rotate-1 transition-transform duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary rounded-md border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#000] mb-4">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">Collaborative Workbench</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base font-medium">
                    Draft, review, and negotiate agreements in real-time.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="hover:-rotate-1 transition-transform duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-accent rounded-md border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#000] mb-4">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">AI Risk Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base font-medium">
                    Detect legal risks instantly with our intelligent AI engine.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="hover:rotate-1 transition-transform duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-secondary rounded-md border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#000] mb-4">
                    <Link2 className="h-6 w-6 text-black" />
                  </div>
                  <CardTitle className="text-xl">Blockchain Security</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base font-medium">
                    Immutable verification on the Stellar network.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="hover:-rotate-1 transition-transform duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-chart-4 rounded-md border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#000] mb-4">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">Immutable Audit Trails</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base font-medium">
                    Every action recorded. Total transparency.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Section (Creative Pricing Integration) */}
        <section id="pricing" className="bg-muted py-24">
          <CreativePricing
            title="Trade-Ready Plans"
            tag="Fair & Simple"
            description="Choose the perfect toolkit for your legal workflow"
            tiers={pricingTiers}
          />
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 font-handwritten -rotate-1">How It Works</h2>
            </div>

            <div className="max-w-4xl mx-auto space-y-8">
              {[
                {
                  number: "01",
                  title: "Collaborative Contract Workbench",
                  description:
                    "Teams draft, review, and negotiate contracts together in a single online workspace.",
                },
                {
                  number: "02",
                  title: "AI-Powered Risk Analysis",
                  description:
                    "Built-in AI scans contracts to detect legal risks, highlight missing or weak clauses.",
                },
                {
                  number: "03",
                  title: "Blockchain-Backed Trust",
                  description:
                    "Cryptographic fingerprints anchored on Stellar blockchain ensure proof of authenticity.",
                },
              ].map((step) => (
                <Card key={step.number} className="border-2 border-black shadow-[8px_8px_0px_0px_#000]">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="text-5xl font-black text-muted-foreground/30 font-mono">{step.number}</div>
                      <div className="flex-1">
                        <CardTitle className="text-2xl mb-2">{step.title}</CardTitle>
                        <CardDescription className="text-lg leading-relaxed">{step.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-primary text-primary-foreground border-y-2 border-black">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <h2 className="text-4xl md:text-6xl font-black rotate-1">Ready to Dive In?</h2>
              <p className="text-2xl font-medium opacity-90">Connect your Stellar wallet and start managing contracts like a pro.</p>
              <Button
                size="lg"
                onClick={() => setShowWalletModal(true)}
                className="bg-white text-black hover:bg-zinc-100 text-xl h-16 px-12 border-2 border-black shadow-[6px_6px_0px_0px_#000]"
              >
                Connect Stellar Wallet
              </Button>
            </div>
          </div>
        </section>

        <WalletConnectModal open={showWalletModal} onOpenChange={setShowWalletModal} onConnect={handleWalletConnect} />
      </div>
    )
  }

  // Dashboard view (shown after wallet is connected)
  // Forced Dark Mode wrapper with Dotted Surface
  return (
    <div className="relative min-h-screen bg-background overflow-hidden font-sans text-foreground">
      {/* Background Effect */}
      <DottedSurface className="absolute inset-0 z-0 opacity-50" />

      {/* Content Wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Dashboard Navigation */}
        <nav className="border-b border-border/20 bg-background/50 backdrop-blur-md sticky top-0 z-50">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <DashboardMobileNav activeSection={activeSection} onSectionChange={setActiveSection} />
                <div className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-primary" />
                  <span className="font-semibold text-lg text-foreground">Nexus-Shield</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="hidden sm:inline-flex text-xs bg-zinc-800 text-zinc-300 border-zinc-700">
                  {network === "TESTNET" ? "Testnet" : network}
                </Badge>
                <Badge variant="outline" className="font-mono text-xs hidden sm:inline-flex border-zinc-700 text-zinc-400">
                  {stellarService.shortenAddress(walletAddress)}
                </Badge>
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDisconnect}
                  className="hidden sm:inline-flex text-zinc-400 hover:text-white hover:bg-zinc-800"
                >
                  Disconnect
                </Button>
              </div>
            </div>
          </div>
        </nav>

        <div className="flex flex-1">
          <DashboardSidebar activeSection={activeSection} onSectionChange={setActiveSection} className="bg-background/40 border-r border-border/20" />

          {/* Main Content Area */}
          <main className="flex-1 p-4 lg:p-8">
            {activeSection === "overview" && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-5xl font-bold mb-2 text-foreground font-sans tracking-tight">Dashboard Overview</h1>
                  <p className="text-lg text-muted-foreground">Monitor your contract lifecycle at a glance</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="bg-card/50 border-border text-foreground shadow-none hover:bg-accent/50 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-base font-medium text-muted-foreground">Active Contracts</CardTitle>
                      <FileText className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold font-mono">{contracts.length}</div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {contracts.length === 0 ? "No active contracts" : "Total contracts"}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-zinc-900/50 border-zinc-800 text-white shadow-none hover:bg-zinc-900 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-base font-medium text-muted-foreground">AI Scans</CardTitle>
                      <Bot className="h-4 w-4 text-accent" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold font-mono">0</div>
                      <p className="text-sm text-muted-foreground mt-1">Ready to analyze</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/50 border-border text-foreground shadow-none hover:bg-accent/50 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-base font-medium text-muted-foreground">Verified</CardTitle>
                      <Link2 className="h-4 w-4 text-secondary" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold font-mono">0</div>
                      <p className="text-sm text-muted-foreground mt-1">On Stellar network</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/50 border-border text-foreground shadow-none hover:bg-accent/50 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-base font-medium text-muted-foreground">Audits</CardTitle>
                      <Activity className="h-4 w-4 text-chart-4" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold font-mono">0</div>
                      <p className="text-sm text-muted-foreground mt-1">Actions tracked</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-card/80 border-border backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-2xl text-foreground">Quick Actions</CardTitle>
                      <CardDescription className="text-base text-muted-foreground">Get started with common tasks</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button
                        onClick={() => {
                          setActiveSection("workbench")
                          setWorkbenchView("select")
                        }}
                        className="w-full justify-start bg-primary hover:bg-primary/90 text-white border-none shadow-none"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Contract
                      </Button>
                      <Button
                        onClick={() => setActiveSection("ai-analysis")}
                        variant="outline"
                        className="w-full justify-start bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                      >
                        <Bot className="h-4 w-4 mr-2" />
                        Run AI Analysis
                      </Button>
                      <Button
                        onClick={() => setActiveSection("blockchain")}
                        variant="outline"
                        className="w-full justify-start bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                      >
                        <Link2 className="h-4 w-4 mr-2" />
                        Verify on Blockchain
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/80 border-border backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-2xl text-foreground">Recent Activity</CardTitle>
                      <CardDescription className="text-base text-muted-foreground">Latest updates and actions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-zinc-500">
                        <Activity className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm font-mono">No recent activity</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeSection === "contracts" && (
              <div className="space-y-6">
                {contractsView === "list" ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-3xl font-bold mb-2 text-foreground">Contracts</h1>
                        <p className="text-muted-foreground">Manage all your cross-border contracts</p>
                      </div>
                      <Button
                        onClick={() => {
                          setActiveSection("workbench")
                          setWorkbenchView("select")
                        }}
                        className="bg-primary hover:bg-primary/90 text-white border-none shadow-none"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        New Contract
                      </Button>
                    </div>

                    <div className="flex gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <Input placeholder="Search contracts..." className="pl-10 bg-card/50 border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary" />
                      </div>
                      <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white bg-transparent">Filter</Button>
                    </div>

                    <ContractList
                      contracts={contracts}
                      onView={handleViewContract}
                      onEdit={handleEditContract}
                      onDelete={handleDeleteContract}
                    />
                  </>
                ) : (
                  <div className="space-y-6">
                    <Button variant="outline" onClick={() => setContractsView("list")} className="border-zinc-700 text-zinc-300 bg-transparent hover:bg-zinc-800">
                      ← Back to List
                    </Button>
                    <Card className="border-border bg-card/80 text-foreground shadow-none">
                      <CardHeader>
                        <CardTitle>{viewingContract?.title}</CardTitle>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="border-zinc-700 text-zinc-400">{viewingContract?.type}</Badge>
                          <Badge variant="outline" className="border-zinc-700 text-zinc-400">{viewingContract?.jurisdiction}</Badge>
                          <Badge className="bg-primary/20 text-primary border-transparent">{viewingContract?.status}</Badge>
                        </div>
                        {viewingContract?.blockchainHash && (
                          <div className="mt-4 p-3 bg-muted rounded-md border border-border">
                            <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Blockchain Hash</p>
                            <p className="text-xs font-mono break-all text-primary">{viewingContract.blockchainHash}</p>
                          </div>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="whitespace-pre-wrap font-mono text-sm bg-muted p-6 rounded-lg text-foreground border border-border">
                          {viewingContract?.content}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}

            {activeSection === "workbench" && (
              <div className="space-y-6">
                {workbenchView === "list" && (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-3xl font-bold mb-2 text-foreground">Contract Workbench</h1>
                        <p className="text-muted-foreground">Collaborative space for drafting and reviewing contracts</p>
                      </div>
                      <Button onClick={handleStartNewContract} className="bg-primary hover:bg-primary/90 text-white border-none shadow-none">
                        <Plus className="h-4 w-4 mr-2" />
                        New Contract
                      </Button>
                    </div>

                    <Card className="border-border bg-card/50 text-foreground shadow-none backdrop-blur-sm">
                      <CardContent className="py-16 text-center">
                        <FileText className="h-12 w-12 mx-auto mb-4 text-primary opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">Start Creating Contracts</h3>
                        <p className="text-muted-foreground mb-6">
                          Use templates or start from scratch to create professional contracts
                        </p>
                        <Button onClick={handleStartNewContract} className="bg-primary hover:bg-primary/90 text-white border-none shadow-none">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Your First Contract
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                )}

                {workbenchView === "select" && (
                  <>
                    <Button variant="outline" onClick={() => setWorkbenchView("list")} className="border-zinc-700 text-zinc-300 bg-transparent hover:bg-zinc-800">
                      ← Back
                    </Button>
                    <ContractTemplateSelector onSelectTemplate={handleSelectTemplate} onStartBlank={handleStartBlank} />
                  </>
                )}

                {workbenchView === "edit" && (
                  <>
                    <div className="flex items-center justify-between">
                      <h1 className="text-3xl font-bold text-foreground">{editingContract ? "Edit Contract" : "Create New Contract"}</h1>
                    </div>
                    <ContractEditor
                      initialContract={editingContract}
                      requiresBlockchainAction={requiresBlockchainAction}
                      onSave={handleSaveContract}
                      onCancel={handleCancelEdit}
                    />
                  </>
                )}
              </div>
            )}

            {activeSection === "ai-analysis" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2 text-foreground">AI Risk Analysis</h1>
                  <p className="text-muted-foreground">AI-powered contract analysis and compliance checking</p>
                </div>

                <ContractAnalysisChatbot />
              </div>
            )}

            {activeSection === "blockchain" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2 text-foreground">Blockchain Verification</h1>
                  <p className="text-muted-foreground">Anchor contract fingerprints on Stellar blockchain with Soroban</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-8">
                    <StellarSorobanInteraction />
                  </div>
                  <div className="space-y-8">
                    <BlockchainAuditTrail />
                  </div>
                </div>
              </div>
            )}

            {activeSection === "audit-trail" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2 text-foreground">Audit Trail</h1>
                  <p className="text-muted-foreground">Immutable record of all contract actions</p>
                </div>

                <Card className="border-border bg-card/50 text-foreground shadow-none">
                  <CardContent className="py-16 text-center">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-zinc-600 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No audit events yet</h3>
                    <p className="text-muted-foreground">All contract actions will be tracked here</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === "team" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2 text-foreground">Team Management</h1>
                  <p className="text-muted-foreground">Manage team members and permissions</p>
                </div>

                <Card className="border-border bg-card/50 text-foreground shadow-none">
                  <CardContent className="py-16 text-center">
                    <Users className="h-12 w-12 mx-auto mb-4 text-zinc-600 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">Team feature coming soon</h3>
                    <p className="text-muted-foreground">Invite team members and manage collaboration</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === "settings" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2 text-foreground">Settings</h1>
                  <p className="text-muted-foreground">Configure your Nexus-Shield account</p>
                </div>

                <Card className="border-border bg-card/50 text-foreground shadow-none">
                  <CardHeader>
                    <CardTitle>Wallet Connection</CardTitle>
                    <CardDescription className="text-muted-foreground">Your connected Stellar wallet</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-card border border-border">
                      <div>
                        <p className="text-sm font-medium mb-1 text-foreground">Connected Address</p>
                        <p className="text-xs text-muted-foreground font-mono">{walletAddress}</p>
                      </div>
                      <Badge variant="secondary" className="bg-muted text-muted-foreground">{network === "TESTNET" ? "Testnet" : network}</Badge>
                    </div>
                    <Button variant="destructive" onClick={handleDisconnect} className="shadow-none">
                      Disconnect Wallet
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
