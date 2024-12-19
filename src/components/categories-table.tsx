"use client"

import { useEffect, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
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
import { Category, getCategories, deleteCategory } from "@/services/categories"
import { useAuth } from "@/contexts/auth-context"
import { Trash2 } from "lucide-react"

export function CategoriesTable() {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function loadCategories() {
      if (user) {
        try {
          const { data } = await getCategories(user.id)
          setCategories(data || [])
        } catch (error) {
          console.error("Erro ao carregar categorias:", error)
          toast({
            title: "Erro ao carregar categorias",
            description: "Não foi possível carregar as categorias. Tente novamente mais tarde.",
            variant: "destructive",
          })
        } finally {
          setLoading(false)
        }
      }
    }

    loadCategories()
  }, [user, toast])

  async function handleDeleteCategory(categoryId: string) {
    if (user) {
      try {
        setLoading(true)
        await deleteCategory(categoryId, user.id)
        setCategories(categories.filter(category => category.id !== categoryId))
        toast({
          description: "Categoria excluída com sucesso!",
        })
      } catch (error) {
        console.error("Erro ao excluir categoria:", error)
        toast({
          variant: "destructive",
          description: error instanceof Error ? error.message : "Erro ao excluir categoria!",
        })
      } finally {
        setLoading(false)
      }
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {categories.map((category) => (
          <TableRow key={category.id}>
            <TableCell>{category.name}</TableCell>
            <TableCell>
              <span
                className={`inline-block px-2 py-1 rounded-full text-xs ${
                  category.type === "income"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {category.type === "income" ? "Receita" : "Despesa"}
              </span>
            </TableCell>
            <TableCell>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir categoria</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir esta categoria? Esta ação não
                      pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDeleteCategory(category.id)}>Excluir</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
