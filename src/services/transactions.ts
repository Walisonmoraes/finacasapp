import { supabase, Tables } from '@/lib/supabase'
import { Category } from "./categories"

export type Transaction = Tables<'transactions'> & {
  categories: Category | null
  is_recurring: boolean
}

export type TransactionInput = {
  description: string
  amount: number
  date: string
  category_id: string
  type: 'income' | 'expense'
  notes?: string
  is_recurring?: boolean
}

export async function getTransactions(userId: string) {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      categories (
        id,
        name,
        color
      )
    `)
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (error) throw error
  return { data: data || [] }
}

export async function getRecentTransactions(userId: string, limit = 5) {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      categories (
        id,
        name,
        color
      )
    `)
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export async function createTransaction(transaction: TransactionInput, userId: string) {
  const { data, error } = await supabase
    .from("transactions")
    .insert([
      {
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        date: transaction.date,
        category_id: transaction.category_id,
        user_id: userId,
        is_recurring: transaction.is_recurring || false,
      },
    ])
    .select()
    .single()

  if (error) {
    console.error("Erro ao criar transação:", error)
    throw error
  }

  return { data, error }
}

export async function updateTransaction(id: string, transaction: Partial<TransactionInput>, userId: string) {
  const { data, error } = await supabase
    .from('transactions')
    .update(transaction)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteTransaction(id: string, userId: string) {
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)

  if (error) {
    console.error("Erro ao deletar transação:", error)
    throw error
  }

  return { error: null }
}

export async function getTransactionStats(userId: string) {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false })

  if (error) {
    console.error("Erro ao buscar transações:", error)
    throw error
  }

  return { data: data || [], error: null }
}
