"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { getTransactionStats } from "@/services/transactions"
import { getCategories, Category } from "@/services/categories"
import { Transaction } from "@/services/transactions"

const COLORS = [
  '#4ade80', // verde
  '#f87171', // vermelho
  '#60a5fa', // azul
  '#fbbf24', // amarelo
  '#a78bfa', // roxo
  '#34d399', // verde água
  '#f472b6', // rosa
  '#fb923c', // laranja
]

type ChartData = {
  name: string
  value: number
  percentage: string
}

const RADIAN = Math.PI / 180
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  name,
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-xs font-medium"
    >
      {`${name} (${(percent * 100).toFixed(1)}%)`}
    </text>
  )
}

export function ExpensesByCategory() {
  const { user } = useAuth()
  const [data, setData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      if (user) {
        try {
          const [transactionsResult, categoriesResult] = await Promise.all([
            getTransactionStats(user.id),
            getCategories()
          ])

          const transactions = transactionsResult.data || []
          const categories = categoriesResult.data || []

          // Filtrar apenas despesas do mês atual
          const currentDate = new Date()
          const currentMonth = currentDate.getMonth()
          const currentYear = currentDate.getFullYear()

          const expenses = transactions.filter((t: any) => {
            const date = new Date(t.date)
            return t.type === 'expense' &&
              date.getMonth() === currentMonth &&
              date.getFullYear() === currentYear
          })

          const incomes = transactions.filter((t: any) => {
            const date = new Date(t.date)
            return t.type === 'income' &&
              date.getMonth() === currentMonth &&
              date.getFullYear() === currentYear
          })

          const totalIncome = incomes.reduce((acc, transaction) => acc + transaction.amount, 0)

          // Agrupar por categoria
          const expensesByCategory = expenses.reduce((acc: Record<string, number>, curr: any) => {
            const category = categories.find((c: Category) => c.id === curr.category_id)
            if (!category) return acc

            const categoryName = category.name.charAt(0).toUpperCase() + category.name.slice(1)
            acc[categoryName] = (acc[categoryName] || 0) + curr.amount
            return acc
          }, {})

          // Calcular porcentagens
          const chartData = Object.entries(expensesByCategory)
            .map(([name, value]) => ({
              name,
              value,
              percentage: totalIncome > 0 ? ((value / totalIncome) * 100).toFixed(1) : '0.0'
            }))
            .sort((a, b) => b.value - a.value) // Ordenar por valor

          setData(chartData)
        } catch (error) {
          console.error("Erro ao carregar dados:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    loadData()
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

  if (data.length === 0) {
    return (
      <div className="h-[350px] flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Nenhuma despesa registrada este mês
        </p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Legend
          formatter={(value, entry) => (
            <span className="text-sm">
              {value} ({data.find(d => d.name === value)?.percentage}% da receita)
            </span>
          )}
          layout="vertical"
          align="right"
          verticalAlign="middle"
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid gap-1">
                    <div className="font-semibold">{data.name}</div>
                    <div className="text-sm text-muted-foreground">
                      R$ {data.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {data.percentage}% da receita
                    </div>
                  </div>
                </div>
              )
            }
            return null
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
