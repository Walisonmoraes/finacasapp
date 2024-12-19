"use client"

import { useEffect, useState } from "react"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useAuth } from "@/contexts/auth-context"
import { getTransactionStats } from "@/services/transactions"

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

export function Overview() {
  const { user } = useAuth()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      if (user) {
        try {
          const currentYear = new Date().getFullYear()
          const result = await getTransactionStats(user.id)
          
          const monthlyData = MONTHS.map((month, index) => {
            const monthTransactions = (result.data || []).filter((t: any) => {
              const date = new Date(t.date)
              return date.getMonth() === index && date.getFullYear() === currentYear
            })

            const revenue = monthTransactions
              .filter((t: any) => t.type === 'income')
              .reduce((sum: number, t: any) => sum + t.amount, 0)

            const expenses = monthTransactions
              .filter((t: any) => t.type === 'expense')
              .reduce((sum: number, t: any) => sum + t.amount, 0)

            return {
              month,
              revenue,
              expenses
            }
          })

          setData(monthlyData)
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
      <div className="h-[350px] flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-4 w-32 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <XAxis
          dataKey="month"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        />
        <Line
          type="monotone"
          strokeWidth={2}
          dataKey="revenue"
          stroke="#4ade80"
          dot={false}
          name="Receitas"
        />
        <Line
          type="monotone"
          strokeWidth={2}
          dataKey="expenses"
          stroke="#f87171"
          dot={false}
          name="Despesas"
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Receitas
                      </span>
                      <span className="font-bold text-green-500">
                        R$ {payload[0].value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Despesas
                      </span>
                      <span className="font-bold text-red-500">
                        R$ {payload[1].value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              )
            }
            return null
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
