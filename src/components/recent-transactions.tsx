"use client"

import { useEffect, useState } from "react"
import { Avatar } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { getRecentTransactions } from "@/services/transactions"
import {
  Receipt,
  Wallet,
  Home,
  Car,
  UtensilsCrossed,
  ShoppingCart,
  CreditCard,
  Utensils,
  DollarSign
} from "lucide-react"

const CATEGORY_ICONS: { [key: string]: any } = {
  "Mercado": ShoppingCart,
  "Renda": Wallet,
  "Moradia": Home,
  "Transporte": Car,
  "Alimentação": Utensils,
  "Cartão de Crédito": CreditCard,
  "Outros": DollarSign
}

export function RecentTransactions() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTransactions() {
      if (user) {
        try {
          const data = await getRecentTransactions(user.id)
          setTransactions(data)
        } catch (error) {
          console.error("Erro ao carregar transações:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    loadTransactions()
  }, [user])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between p-2">
            <div className="flex items-center space-x-4">
              <div className="h-9 w-9 rounded-full bg-gray-200 animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => {
        const Icon = CATEGORY_ICONS[transaction.categories?.name] || DollarSign
        const amount = transaction.amount
        const sign = transaction.type === 'expense' ? '-' : '+'

        return (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium leading-none">
                  {transaction.description}
                </p>
                <p className="text-sm text-muted-foreground">
                  {transaction.categories?.name}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <p className={`text-sm font-medium ${transaction.type === 'expense' ? 'text-red-500' : 'text-green-500'}`}>
                {sign}R$ {Math.abs(amount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-muted-foreground">
                {new Date(transaction.date).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
