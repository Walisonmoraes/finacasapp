"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"

const data = [
  {
    name: "Jan",
    receitas: 4000,
    despesas: 2400,
  },
  {
    name: "Fev",
    receitas: 3000,
    despesas: 1398,
  },
  {
    name: "Mar",
    receitas: 2000,
    despesas: 9800,
  },
  {
    name: "Abr",
    receitas: 2780,
    despesas: 3908,
  },
  {
    name: "Mai",
    receitas: 1890,
    despesas: 4800,
  },
  {
    name: "Jun",
    receitas: 2390,
    despesas: 3800,
  },
]

export function MonthlyComparison() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis
            dataKey="name"
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
            tickFormatter={(value) => `R$${value}`}
          />
          <Bar
            dataKey="receitas"
            fill="rgba(74, 222, 128, 0.6)"
            radius={[4, 4, 0, 0]}
            name="Receitas"
            className="hover:fill-green-500/70 transition-colors"
          />
          <Bar
            dataKey="despesas"
            fill="rgba(248, 113, 113, 0.6)"
            radius={[4, 4, 0, 0]}
            name="Despesas"
            className="hover:fill-red-500/70 transition-colors"
          />
          <Tooltip 
            cursor={{ fill: 'transparent' }}
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
                          R${payload[0].value}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          Despesas
                        </span>
                        <span className="font-bold text-red-500">
                          R${payload[1].value}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
          <Legend />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
