"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, TrendingUp, MapPin, Users, Calculator, Package,
  ShieldCheck, CalendarRange, AlertTriangle, Factory, Scissors,
} from "lucide-react"
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter,
} from "@/components/ui/sidebar"

const nav = [
  { group: "Decide", items: [
    { title: "Overview", href: "/", icon: LayoutDashboard },
    { title: "Revenue model", href: "/revenue", icon: TrendingUp },
    { title: "Where to open", href: "/locations", icon: MapPin },
    { title: "Competitors", href: "/competitors", icon: Users },
  ]},
  { group: "Build", items: [
    { title: "Unit economics", href: "/economics", icon: Calculator },
    { title: "Sourcing", href: "/sourcing", icon: Package },
    { title: "Compliance", href: "/compliance", icon: ShieldCheck },
    { title: "Launch plan", href: "/plan", icon: CalendarRange },
  ]},
  { group: "Watch", items: [
    { title: "Risks", href: "/risks", icon: AlertTriangle },
    { title: "Manufacturing later", href: "/manufacturing", icon: Factory },
  ]},
]

export function AppSidebar() {
  const pathname = usePathname()
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                  <Scissors className="size-4" />
                </div>
                <div className="grid leading-tight">
                  <span className="font-semibold">Hair studio plan</span>
                  <span className="text-xs text-sidebar-foreground/70">New Gurgaon · Sep 2026</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {nav.map((g) => (
          <SidebarGroup key={g.group}>
            <SidebarGroupLabel>{g.group}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {g.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.title}>
                      <Link href={item.href}><item.icon /><span>{item.title}</span></Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <p className="px-2 text-xs text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden">
          Numbers are estimates from Sep 2026 research. Edit src/data/insights.ts.
        </p>
      </SidebarFooter>
    </Sidebar>
  )
}
