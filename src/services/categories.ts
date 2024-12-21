import { supabase, Tables } from '@/lib/supabase'

export type Category = Tables['categories']

export async function getCategories(userId: string) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('name')

  if (error) {
    console.error("Erro ao buscar categorias:", error)
    throw new Error(`Erro ao buscar categorias: ${error.message}`)
  }

  return { data: data || [] }
}

export async function createCategory(category: Pick<Category, 'name' | 'type' | 'color' | 'description'>, userId: string) {
  const { data, error } = await supabase
    .from('categories')
    .insert([{ ...category, user_id: userId }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateCategory(id: string, category: Partial<Category>, userId: string) {
  console.log("Atualizando categoria:", { id, category, userId })
  
  if (!id || !userId) {
    throw new Error("ID da categoria ou do usuário não fornecido")
  }

  const { data, error } = await supabase
    .from('categories')
    .update(category)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error("Erro ao atualizar categoria:", error)
    throw new Error(`Erro ao atualizar categoria: ${error.message}`)
  }

  console.log("Categoria atualizada:", data)
  return data
}

export async function deleteCategory(categoryId: string, userId: string) {
  if (!categoryId || !userId) {
    throw new Error("ID da categoria ou do usuário não fornecido")
  }

  // Verifica se existem transações usando esta categoria
  const { data: transactions, error: transactionsError } = await supabase
    .from('transactions')
    .select('id')
    .eq('category_id', categoryId)
    .limit(1)

  if (transactionsError) {
    console.error("Erro ao verificar transações:", transactionsError)
    throw new Error(`Erro ao verificar transações: ${transactionsError.message}`)
  }

  if (transactions && transactions.length > 0) {
    throw new Error("Não é possível excluir uma categoria que possui transações vinculadas")
  }

  // Verifica se a categoria pertence ao usuário e exclui
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId)
    .eq('user_id', userId)

  if (error) {
    console.error("Erro ao excluir categoria:", error)
    throw new Error(`Erro ao excluir categoria: ${error.message}`)
  }
}

export async function getCategoryStats(userId: string) {
  const { data: transactions, error } = await supabase
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

  if (error) throw error

  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  const currentMonthTransactions = transactions.filter(t => {
    const date = new Date(t.date)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  })

  const expensesByCategory = currentMonthTransactions.reduce((acc: any, t: any) => {
    if (t.type === 'expense' && t.categories) {
      const category = t.categories
      if (!acc[category.id]) {
        acc[category.id] = {
          name: category.name,
          color: category.color,
          total: 0
        }
      }
      acc[category.id].total += t.amount
    }
    return acc
  }, {})

  return Object.values(expensesByCategory)
}
