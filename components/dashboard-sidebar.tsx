"use client"

import { FileText, Bot, Link2, Activity, LayoutDashboard, Settings, Users, FileSearch, Landmark } from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardSidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
  className?: string
}

const menuItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, color: "text-blue-500", activeBg: "bg-blue-500/10", activeText: "text-blue-600 dark:text-blue-400" },
  { id: "contracts", label: "Contracts", icon: FileText, color: "text-purple-500", activeBg: "bg-purple-500/10", activeText: "text-purple-600 dark:text-purple-400" },
  { id: "workbench", label: "Workbench", icon: FileSearch, color: "text-orange-500", activeBg: "bg-orange-500/10", activeText: "text-orange-600 dark:text-orange-400" },
  { id: "ai-analysis", label: "AI Analysis", icon: Bot, color: "text-pink-500", activeBg: "bg-pink-500/10", activeText: "text-pink-600 dark:text-pink-400" },
  { id: "blockchain", label: "Blockchain", icon: Link2, color: "text-yellow-500", activeBg: "bg-yellow-500/10", activeText: "text-yellow-600 dark:text-yellow-400" },
  { id: "advanced", label: "Advanced Features", icon: Landmark, color: "text-indigo-500", activeBg: "bg-indigo-500/10", activeText: "text-indigo-600 dark:text-indigo-400" },
  { id: "audit-trail", label: "Audit Trail", icon: Activity, color: "text-emerald-500", activeBg: "bg-emerald-500/10", activeText: "text-emerald-600 dark:text-emerald-400" },
  { id: "team", label: "Team", icon: Users, color: "text-cyan-500", activeBg: "bg-cyan-500/10", activeText: "text-cyan-600 dark:text-cyan-400" },
  { id: "settings", label: "Settings", icon: Settings, color: "text-slate-500", activeBg: "bg-slate-500/10", activeText: "text-slate-600 dark:text-slate-400" },
]

export function DashboardSidebar({ activeSection, onSectionChange, className }: DashboardSidebarProps) {
  return (
    <aside className={cn("w-64 border-r border-border bg-card/50 h-[calc(100vh-4rem)] sticky top-16 hidden lg:block", className)}>
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeSection === item.id

          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border-2 border-transparent",
                isActive
                  ? cn(item.activeBg, item.activeText, "border-current shadow-sm scale-[1.02]")
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
              )}
            >
              <Icon className={cn("h-5 w-5", isActive ? "text-current" : item.color)} />
              {item.label}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
