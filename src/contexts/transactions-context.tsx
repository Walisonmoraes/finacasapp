"use client"

import { Transaction } from "@/services/transactions"
import { createContext, useContext, useState, useCallback, ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

interface TransactionsContextData {
  transactions: Transaction[]
  setTransactions: (transactions: Transaction[]) => void
  addTransaction: (transaction: Transaction) => void
  removeTransaction: (transactionId: string) => void
  updateTransactionsList: (userId: string) => Promise<void>
}

const TransactionsContext = createContext<TransactionsContextData>({} as TransactionsContextData)

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const { toast } = useToast()

  const addTransaction = (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev])
  }

  const removeTransaction = (transactionId: string) => {
    setTransactions(prev => prev.filter(t => t.id !== transactionId))
  }

  const updateTransactionsList = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select(`
          *,
          categories:category_id (
            id,
            name,
            color
          )
        `)
        .eq("user_id", userId)
        .order("date", { ascending: false })

      if (error) throw error

      if (data) {
        setTransactions(data)
      }
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        description: "Erro ao atualizar transações!",
      })
    }
  }, [toast])

  return (
    <TransactionsContext.Provider 
      value={{ 
        transactions, 
        setTransactions, 
        addTransaction, 
        removeTransaction,
        updateTransactionsList
      }}
    >
      {children}
    </TransactionsContext.Provider>
  )
}

export function useTransactions() {
  const context = useContext(TransactionsContext)
  if (!context) {
    throw new Error("useTransactions must be used within a TransactionsProvider")
  }
  return context
}
