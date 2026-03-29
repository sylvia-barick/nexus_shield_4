"use client"

import { FileText, Bot, Link2, Activity, LayoutDashboard, Settings, Users, FileSearch, Landmark } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardMobileNavProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

const menuItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "contracts", label: "Contracts", icon: FileText },
  { id: "workbench", label: "Workbench", icon: FileSearch },
  { id: "ai-analysis", label: "AI Analysis", icon: Bot },
  { id: "blockchain", label: "Blockchain", icon: Link2 },
  { id: "advanced", label: "Advanced Features", icon: Landmark },
  { id: "audit-trail", label: "Audit Trail", icon: Activity },
  { id: "team", label: "Team", icon: Users },
  { id: "settings", label: "Settings", icon: Settings },
]

export function DashboardMobileNav({ activeSection, onSectionChange }: DashboardMobileNavProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 bg-card">
        <nav className="space-y-2 mt-8">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <SheetTrigger key={item.id} asChild>
                <button
                  onClick={() => onSectionChange(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    activeSection === item.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              </SheetTrigger>
            )
          })}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
