import { CustomColorKeys } from "@/assets/colors"
import TransactionGroupFormScreen, {
  Transaction,
} from "@/components/screens/transactionGroupForm"
import useTransactionGroup from "@/db/queries/transactionGroup"
import { calculateTotalAmount, dateFromString } from "@/utils/helper"
import { useLocalSearchParams } from "expo-router"
import { useEffect, useState } from "react"

export default function TransactionGroupFormFromTransactions() {
  const params = useLocalSearchParams()
  const id = params.transactionGroupId

  const { get: getTransactionGroup } = useTransactionGroup()

  const [title, setTitle] = useState<string>("")
  const [date, setDate] = useState<Date>(new Date())
  const [note, setNote] = useState<string>("")
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    const fetchTransactionGroup = async () => {
      const transactionGroupResult = await getTransactionGroup({
        id: Number(id),
      })
      setTitle(transactionGroupResult?.name ?? "")
      setDate(transactionGroupResult?.date ?? new Date())
      setNote(transactionGroupResult?.note ?? "")
      setTransactions(
        transactionGroupResult?.transactions.map((transaction) => ({
          name: transaction.name,
          amount: transaction.amount.toString(),
          category: {
            id: transaction.categoryId,
            name: transaction.categoryName,
            color: transaction.categoryColor as CustomColorKeys,
            emoji: transaction.categoryEmoji,
          },
        })) ?? []
      )
    }

    fetchTransactionGroup()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function handleEditTransaction() {}

  async function handleDeleteTransaction() {}

  async function handleAddTransaction() {}

  async function handleUpdate() {}

  return (
    <TransactionGroupFormScreen
      title={title}
      date={date}
      note={note}
      amount={calculateTotalAmount(transactions)}
      transactions={transactions}
      onTitleChange={async (value) => setTitle(value)}
      onDateChange={async (value) => setDate(await dateFromString(value))}
      onNoteChange={async (value) => setNote(value)}
      onEdit={handleEditTransaction}
      onDelete={handleDeleteTransaction}
      onAdd={handleAddTransaction}
      onSubmit={handleUpdate}
    />
  )
}
