"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Receipt,
  Tags,
  Settings,
  Menu,
  ChevronLeft,
} from "lucide-react"
import { Button } from "./ui/button"
import { useState, useEffect } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Separator } from "./ui/separator"

const menuItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Transações",
    href: "/transacoes",
    icon: Receipt,
  },
  {
    title: "Categorias",
    href: "/categorias",
    icon: Tags,
  },
  {
    title: "Configurações",
    href: "/configuracoes",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Evita hidratação incorreta
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Ajusta o estado inicial baseado no tamanho da tela
  useEffect(() => {
    if (isMounted) {
      setIsCollapsed(isMobile)
    }
  }, [isMobile, isMounted])

  if (!isMounted) {
    return null
  }

  return (
    <div
      className={cn(
        "relative flex h-full transition-all duration-300",
        isCollapsed ? "w-[70px]" : "w-[250px]"
      )}
    >
      <div className="flex w-full flex-col border-r bg-card px-2">
        <div className="flex h-14 items-center justify-between border-b px-2">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <Receipt className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">Finanças Gest</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <Menu className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="flex-1 space-y-1 py-4">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center rounded-lg px-2 py-2 text-sm font-medium hover:bg-accent",
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "transparent",
                  isCollapsed && "justify-center"
                )}
              >
                <Icon className={cn("h-5 w-5", !isCollapsed && "mr-2")} />
                {!isCollapsed && item.title}
              </Link>
            )
          })}
        </div>

        <div className="mt-auto">
          {!isCollapsed && (
            <>
              <Separator className="my-2" />
              <div className="px-2 py-4 text-center">
                <p className="text-xs text-muted-foreground">
                  2024 Finanças Gest. Todos os direitos reservados.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Versão 1.0.0
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
