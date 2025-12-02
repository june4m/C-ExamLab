"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Home,
  BarChart3,
  Calendar,
  Users,
  Menu,
  X,
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

const sidebarNavigation = [
  {
    name: "Home",
    href: "/admin",
    icon: Home,
  },
  {
    name: "Report",
    href: "/admin/report",
    icon: BarChart3,
  },
  {
    name: "Calendar",
    href: "/admin/calendar",
    icon: Calendar,
  },
  {
    name: "User Management",
    href: "/admin/users",
    icon: Users,
  },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-20 border-r-2 border-blue-200 bg-white transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col items-center py-6">
          {/* Logo and Close Button */}
          <div className="mb-8 flex w-full items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-blue-500 bg-purple-100">
              <Image
                src="/logo.png"
                alt="Logo"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation Icons */}
          <nav className="flex flex-1 flex-col gap-4">
            {sidebarNavigation.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-lg transition-colors",
                    isActive
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                  title={item.name}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-6 w-6" />
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-20">
        {/* Mobile menu button - floating */}
        <Button
          variant="ghost"
          size="icon"
          className="fixed left-24 top-4 z-30 lg:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Page Content */}
        <main className="min-h-screen bg-purple-50 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
