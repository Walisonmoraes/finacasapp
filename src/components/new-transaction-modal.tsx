"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useTransactions } from "@/contexts/transactions-context"
import { getCategories, Category } from "@/services/categories"
import { supabase } from "@/lib/supabase"

const formSchema = z.object({
  description: z.string().min(3, {
    message: "A descrição deve ter pelo menos 3 caracteres.",
  }),
  amount: z.string().min(1, {
    message: "O valor é obrigatório.",
  }),
  category_id: z.string().min(1, {
    message: "A categoria é obrigatória.",
  }),
  type: z.enum(["income", "expense"]),
  date: z.string().min(1, {
    message: "A data é obrigatória.",
  }),
  is_recurring: z.boolean().default(false),
})

type TransactionType = "income" | "expense"

export function NewTransactionModal() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { addTransaction, updateTransactionsList } = useTransactions()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [transactionType, setTransactionType] = useState<TransactionType>("expense")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: "",
      category_id: "",
      type: "expense",
      date: new Date().toISOString().split("T")[0],
      is_recurring: false,
    },
  })

  useEffect(() => {
    async function loadCategories() {
      if (user) {
        try {
          const { data } = await getCategories()
          setCategories(data || [])
        } catch (error) {
          console.error("Erro ao carregar categorias:", error)
          toast({
            title: "Erro ao carregar categorias",
            description: "Não foi possível carregar as categorias. Tente novamente mais tarde.",
            variant: "destructive",
          })
        }
      }
    }

    loadCategories()
  }, [user, toast])

  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (user) {
      try {
        setLoading(true)
        const amountInCents = Math.round(
          parseFloat(data.amount.replace(/\D/g, "")) / 100
        )

        const { data: newTransaction, error } = await supabase
          .from("transactions")
          .insert([
            {
              user_id: user.id,
              description: data.description,
              amount: amountInCents,
              type: data.type,
              category_id: data.category_id,
              is_recurring: data.is_recurring,
              date: data.date,
            },
          ])
          .select()
          .single()

        if (error) throw error

        if (newTransaction) {
          addTransaction(newTransaction)
          if (user) {
            updateTransactionsList(user.id)
          }
          toast({
            description: "Transação adicionada com sucesso!",
          })
          form.reset()
          setOpen(false)
        }
      } catch (error) {
        console.error(error)
        toast({
          variant: "destructive",
          description: "Erro ao adicionar transação!",
        })
      } finally {
        setLoading(false)
      }
    }
  }

  const filteredCategories = (categories || []).filter(
    (category) => category.type === transactionType
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Nova transação</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nova transação</DialogTitle>
          <DialogDescription>
            Adicione uma nova transação ao seu histórico.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select
                    onValueChange={(value: TransactionType) => {
                      field.onChange(value)
                      setTransactionType(value)
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="income">Receita</SelectItem>
                      <SelectItem value="expense">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Compras do mês" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="R$ 0,00"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value
                        const numbers = value.replace(/\D/g, "")
                        const formatted = (Number(numbers) / 100).toLocaleString(
                          "pt-BR",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )
                        field.onChange(formatted)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_recurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Transação recorrente
                    </FormLabel>
                    <FormDescription>
                      Marque esta opção se esta transação se repete mensalmente
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? "Criando..." : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
