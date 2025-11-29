import { CustomColorKeys } from "@/assets/colors"
import TransactionGroupFormScreen, { Transaction } from "@/components/screens/transactionGroupForm"
import useTransactionGroup from "@/db/queries/transactionGroup"
import { calculateTotalAmount, dateFromString } from "@/utils/helper"
import { useLocalSearchParams, router } from "expo-router"
import { useEffect, useState } from "react"

export default function TransactionGroupFormFromTransactions() {
  const params = useLocalSearchParams()
  const id = Number(params.transactionGroupId)

  const { get: getTransactionGroup } = useTransactionGroup()

  const [title, setTitle] = useState("")
  const [date, setDate] = useState(new Date())
  const [note, setNote] = useState("")
  const [transactions, setTransactions] = useState<Transaction[]>([])

  // -------------------------
  //  Lädt bestehende Gruppe
  // -------------------------
  useEffect(() => {
    const fetchGroup = async () => {
      const result = await getTransactionGroup({ id })
      if (!result) return

      setTitle(result.name ?? "")
      setDate(result.date ?? new Date())
      setNote(result.note ?? "")

      setTransactions(
        result.transactions.map((t) => ({
          name: t.name,
          amount: t.amount.toString(),
          category: {
            id: t.categoryId,
            name: t.categoryName,
            emoji: t.categoryEmoji ?? "",
            color: t.categoryColor as CustomColorKeys,
          },
        }))
      )
    }
    fetchGroup()
  }, [id])

  // -----------------------------------------
  // return Transaction
  // -----------------------------------------
  useEffect(() => {
    if (!params.newTransaction) return

    try {
      const tx = JSON.parse(params.newTransaction as string)
      setTransactions((prev) => [...prev, tx])
    } catch (e) {
      console.error("Fehler beim Lesen von newTransaction:", e)
    }

    // Parameter delete
    router.setParams({ newTransaction: undefined })
  }, [params.newTransaction])

  // -----------------------------------------
  // Bearbeitete Transaktion wurde zurückgegeben
  // -----------------------------------------
  useEffect(() => {
    if (!params.updatedTransaction) return

    try {
      const { index, data } = JSON.parse(params.updatedTransaction as string)
      setTransactions((prev) =>
        prev.map((t, i) => (i === index ? data : t))
      )
    } catch (e) {
      console.error("Fehler beim Lesen von updatedTransaction:", e)
    }

    router.setParams({ updatedTransaction: undefined })
  }, [params.updatedTransaction])

  // -------------------------
  //     Aktionen
  // -------------------------

  // Add
  const handleAddTransaction = async () => {
    router.push({
      pathname: "/transactions/transactionForm",
      params: { addToGroup: id },
    })
  }

  // Transaktion change
  const handleEditTransaction = async (index: number) => {
    const tx = transactions[index]

    router.push({
      pathname: "/transactions/transactionForm",
      params: {
        editIndex: index.toString(),
        editData: JSON.stringify(tx),
      },
    })
  }

  // Transaktion delete
  const handleDeleteTransaction = async (index: number) => {
    setTransactions((prev) => prev.filter((_, i) => i !== index))
  }

  //  Update 
  const handleUpdate = async () => {
    console.log("TODO: Update in DB implementieren")
  }

  return (
    <TransactionGroupFormScreen
      title={title}
      date={date}
      note={note}
      amount={calculateTotalAmount(transactions)}
      transactions={transactions}
      onTitleChange={async (v) => setTitle(v)}
      onDateChange={async (v) => setDate(await dateFromString(v))}
      onNoteChange={async (v) => setNote(v)}
      onEdit={handleEditTransaction}
      onDelete={handleDeleteTransaction}
      onAdd={handleAddTransaction}
      onSubmit={handleUpdate}
    />
  )
}
