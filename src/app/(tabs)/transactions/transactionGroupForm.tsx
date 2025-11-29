import { CustomColorKeys } from "@/assets/colors"
import TransactionGroupFormScreen, {
  Transaction,
} from "@/components/screens/transactionGroupForm"
import useTransactionGroup from "@/db/queries/transactionGroup"
import { useTypedTranslation } from "@/language/useTypedTranslation"
import { calculateTotalAmount, dateFromString } from "@/utils/helper"
import { router, useLocalSearchParams } from "expo-router"
import { useEffect, useState } from "react"
import { Alert, Keyboard } from "react-native"

export default function TransactionGroupFormFromTransactions() {
  const { t } = useTypedTranslation()
  const params = useLocalSearchParams()

  const [transactionGroupId] = useState(() => Number(params.transactionGroupId))

  const { get: getTransactionGroup, update: updateTransactionGroup } =
    useTransactionGroup()

  const [name, setTitle] = useState("")
  const [date, setDate] = useState(new Date())
  const [note, setNote] = useState("")
  const [transactions, setTransactions] = useState<Transaction[]>([])

  // -------------------------
  //  Lädt bestehende Gruppe
  // -------------------------
  useEffect(() => {
    const fetchGroup = async () => {
      const result = await getTransactionGroup({ id: transactionGroupId })
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionGroupId])

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
      setTransactions((prev) => prev.map((t, i) => (i === index ? data : t)))
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
      params: { addToGroup: transactionGroupId },
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
    if (name.trim() === "" || transactions.length === 0) {
      Alert.alert(t("common.error"), t("screens.input.errors.missingData"))
      return
    }

    const transactionData = transactions.map((transaction) => ({
      amount: parseFloat(transaction.amount),
      term: transaction.name,
      categoryId: transaction.category.id,
    }))

    const result = await updateTransactionGroup({
      id: transactionGroupId,
      name,
      note,
      date,
      transactions: transactionData,
    })

    if (result !== null) {
      Keyboard.dismiss()
      router.replace("/transactions")
    } else {
      Alert.alert(t("common.error"), "Failed to update transaction group")
    }
  }

  return (
    <TransactionGroupFormScreen
      title={t("screens.transactionGroupForm.title")}
      name={name}
      date={date}
      note={note}
      amount={calculateTotalAmount(transactions)}
      transactions={transactions}
      submitText={t("common.update")}
      onTitleChange={async (v) => setTitle(v)}
      onDateChange={async (v) => setDate(await dateFromString(v))}
      onNoteChange={async (v) => setNote(v)}
      onEdit={handleEditTransaction}
      onDelete={handleDeleteTransaction}
      onAdd={handleAddTransaction}
      onSubmit={handleUpdate}
      onBack={async () => router.replace("/transactions")}
    />
  )
}
