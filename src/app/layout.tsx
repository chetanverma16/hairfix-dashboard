import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"


export const metadata: Metadata = {
  title: "Hair studio plan",
  description: "Decision dashboard for a non-surgical hair replacement studio in New Gurgaon",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset className="min-w-0">{children}</SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  )
}
