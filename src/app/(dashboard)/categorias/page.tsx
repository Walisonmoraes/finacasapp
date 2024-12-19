import { CategoriesTable } from "@/components/categories-table"
import { NewCategoryModal } from "@/components/new-category-modal"

export default function CategoriesPage() {
  return (
    <div className="flex-1 space-y-4 p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Categorias</h2>
        <NewCategoryModal />
      </div>
      <CategoriesTable />
    </div>
  )
}
