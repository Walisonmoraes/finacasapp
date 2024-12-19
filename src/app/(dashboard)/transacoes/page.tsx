import { TransactionsTable } from "@/components/transactions-table"
import { NewTransactionModal } from "@/components/new-transaction-modal"

export default function TransactionsPage() {
  return (
    <div className="flex-1 space-y-4 p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Transações</h2>
        <NewTransactionModal />
      </div>
      <TransactionsTable />
    </div>
  )
}
