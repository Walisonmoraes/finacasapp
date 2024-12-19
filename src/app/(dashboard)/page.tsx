"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card } from "@/components/ui/card"
import { Overview } from "@/components/overview"
import { RecentTransactions } from "@/components/recent-transactions"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  ArrowDown,
  ArrowUp,
  ArrowRight,
  DollarSign,
  CreditCard,
  AlertCircle,
  PiggyBank,
  TrendingUp,
  TrendingDown,
  Wallet
} from "lucide-react"
import { useEffect, useState } from "react"
import { getTransactionStats } from "@/services/transactions"
import { ExpensesByCategory } from "@/components/expenses-by-category"

export default function Home() {
  const { user } = useAuth()
  const [stats, setStats] = useState<{
    currentMonth: {
      income: number
      expense: number
      total: number
      savingsRate: number
    }
    lastMonth: {
      income: number
      expense: number
      total: number
      savingsRate: number
    }
  }>({
    currentMonth: {
      income: 0,
      expense: 0,
      total: 0,
      savingsRate: 0
    },
    lastMonth: {
      income: 0,
      expense: 0,
      total: 0,
      savingsRate: 0
    }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      if (user) {
        try {
          const { data: transactions } = await getTransactionStats(user.id)
          
          const currentDate = new Date()
          const currentMonth = currentDate.getMonth()
          const currentYear = currentDate.getFullYear()
          const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
          const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

          const currentMonthTransactions = transactions.filter(t => {
            const date = new Date(t.date)
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear
          })

          const lastMonthTransactions = transactions.filter(t => {
            const date = new Date(t.date)
            return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear
          })

          const calculateTotals = (txs: any[]) => {
            const totals = txs.reduce(
              (acc, t) => {
                if (t.type === 'income') {
                  acc.income += t.amount
                } else {
                  acc.expense += t.amount
                }
                return acc
              },
              { income: 0, expense: 0 }
            )
            
            totals.total = totals.income - totals.expense
            totals.savingsRate = totals.income > 0 
              ? ((totals.income - totals.expense) / totals.income) * 100 
              : 0

            return totals
          }

          setStats({
            currentMonth: calculateTotals(currentMonthTransactions),
            lastMonth: calculateTotals(lastMonthTransactions)
          })
        } catch (error) {
          console.error("Erro ao carregar estatísticas:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    loadStats()
  }, [user])

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-3 mt-4">
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const incomeChange = stats.lastMonth.income === 0 
    ? 0 
    : ((stats.currentMonth.income - stats.lastMonth.income) / stats.lastMonth.income) * 100

  const expenseChange = stats.lastMonth.expense === 0 
    ? 0 
    : ((stats.currentMonth.expense - stats.lastMonth.expense) / stats.lastMonth.expense) * 100

  const totalChange = stats.lastMonth.total === 0 
    ? 0 
    : ((stats.currentMonth.total - stats.lastMonth.total) / stats.lastMonth.total) * 100

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center">
              <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Saldo Total</h3>
            </div>
            {totalChange >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">
                R$ {stats.currentMonth.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                {totalChange >= 0 ? "+" : ""}{totalChange.toFixed(1)}% em relação ao mês anterior
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center">
              <ArrowUp className="mr-2 h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Receitas</h3>
            </div>
            {incomeChange >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">
                R$ {stats.currentMonth.income.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                {incomeChange >= 0 ? "+" : ""}{incomeChange.toFixed(1)}% em relação ao mês anterior
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center">
              <ArrowDown className="mr-2 h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Despesas</h3>
            </div>
            {expenseChange <= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">
                R$ {stats.currentMonth.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                {expenseChange >= 0 ? "+" : ""}{expenseChange.toFixed(1)}% em relação ao mês anterior
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center">
              <PiggyBank className="mr-2 h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Taxa de Economia</h3>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="w-full">
              <div className="flex justify-between">
                <div className="text-2xl font-bold">{stats.currentMonth.savingsRate.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Meta: 70%</div>
              </div>
              <Progress value={stats.currentMonth.savingsRate} className="mt-2" />
            </div>
          </div>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Visão Geral</h3>
          </div>
          <Overview />
        </Card>
        <Card className="col-span-3 p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Transações Recentes</h3>
            <Button variant="link" className="h-8 text-xs" asChild>
              <a href="/transactions">
                Ver todas
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
          <RecentTransactions />
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Despesas por Categoria</h3>
          </div>
          <ExpensesByCategory />
        </Card>
      </div>
    </div>
  )
}
