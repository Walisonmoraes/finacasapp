"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2, RefreshCw, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "./ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTransactions } from "@/contexts/transactions-context"
import { deleteTransaction, getTransactions } from "@/services/transactions"

export function TransactionsTable() {
  const [loading, setLoading] = useState(false)
  const [recurrenceFilter, setRecurrenceFilter] = useState<"all" | "recurring" | "non-recurring">("all")
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const { user } = useAuth()
  const { toast } = useToast()
  const { transactions, setTransactions, removeTransaction, updateTransactionsList } = useTransactions()

  const filteredTransactions = useCallback(() => {
    return transactions.filter((transaction) => {
      const matchesRecurrence = 
        recurrenceFilter === "all" ? true :
        recurrenceFilter === "recurring" ? transaction.is_recurring :
        !transaction.is_recurring

      const matchesType =
        typeFilter === "all" ? true :
        typeFilter === "income" ? transaction.type === "income" :
        transaction.type === "expense"

      return matchesRecurrence && matchesType
    })
  }, [transactions, recurrenceFilter, typeFilter])

  const paginatedTransactions = useCallback(() => {
    const filtered = filteredTransactions()
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filtered.slice(startIndex, endIndex)
  }, [filteredTransactions, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredTransactions().length / itemsPerPage)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  async function handleDeleteTransaction(transactionId: string) {
    if (user) {
      try {
        setLoading(true)
        await deleteTransaction(transactionId, user.id)
        removeTransaction(transactionId)
        toast({
          description: "Transação excluída com sucesso!",
        })
      } catch (error) {
        console.error(error)
        toast({
          variant: "destructive",
          description: "Erro ao excluir transação!",
        })
      } finally {
        setLoading(false)
      }
    }
  }

  async function loadTransactions() {
    if (user) {
      try {
        setLoading(true)
        const { data } = await getTransactions(user.id)
        if (data) {
          setTransactions(data)
        }
      } catch (error) {
        console.error(error)
        toast({
          variant: "destructive",
          description: "Erro ao carregar transações!",
        })
      } finally {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    if (user) {
      updateTransactionsList(user.id)
    }
  }, [user])

  if (loading) {
    return (
      <div className="rounded-md border p-8 text-center">
        <p className="text-muted-foreground">Carregando transações...</p>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <p className="text-muted-foreground">
          Nenhuma transação encontrada. Crie uma nova transação para começar!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <Select value={recurrenceFilter} onValueChange={(value: "all" | "recurring" | "non-recurring") => setRecurrenceFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por recorrência" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as transações</SelectItem>
            <SelectItem value="recurring">Apenas recorrentes</SelectItem>
            <SelectItem value="non-recurring">Não recorrentes</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={(value: "all" | "income" | "expense") => setTypeFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="income">Apenas receitas</SelectItem>
            <SelectItem value="expense">Apenas despesas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTransactions().map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="flex items-center gap-2">
                  {transaction.description}
                  {transaction.is_recurring && (
                    <RefreshCw className="h-4 w-4 text-muted-foreground" />
                  )}
                </TableCell>
                <TableCell>
                  <span
                    className="inline-block px-2 py-1 rounded-full text-xs"
                    style={{
                      backgroundColor: transaction.categories?.color + "20",
                      color: transaction.categories?.color,
                    }}
                  >
                    {transaction.categories?.name}
                  </span>
                </TableCell>
                <TableCell>{new Date(transaction.date).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell className={`text-right ${transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                  {transaction.type === 'expense' ? '-' : '+'}
                  R$ {Math.abs(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </TableCell>
                <TableCell>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Deletar transação</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja deletar esta transação? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            handleDeleteTransaction(transaction.id)
                          }}
                        >
                          Deletar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <tfoot className="bg-muted/50">
            <TableRow className="border-t-2 hover:bg-muted/50">
              <TableCell colSpan={3} className="py-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">
                    Total {typeFilter === "income" ? "das receitas" : typeFilter === "expense" ? "das despesas" : ""}
                    {recurrenceFilter === "recurring" ? " recorrentes" : recurrenceFilter === "non-recurring" ? " não recorrentes" : ""}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right py-4">
                {(() => {
                  const total = filteredTransactions().reduce((acc, transaction) => {
                    // Se for despesa, subtrai o valor; se for receita, soma
                    return transaction.type === 'expense' 
                      ? acc - transaction.amount 
                      : acc + transaction.amount
                  }, 0)
                  
                  return (
                    <span className={`text-lg font-bold ${total >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {total >= 0 ? "+" : "-"}R$ {Math.abs(total).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  )
                })()}
              </TableCell>
              <TableCell className="py-4"></TableCell>
            </TableRow>
          </tfoot>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Itens por página:
          </p>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => {
              setItemsPerPage(Number(value))
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-6">
          <span className="text-sm text-muted-foreground">
            {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredTransactions().length)} of {filteredTransactions().length}
          </span>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
