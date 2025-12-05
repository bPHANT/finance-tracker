import { CustomColorKeys } from "@/assets/colors"
import TransactionGroupFormScreen from "@/components/screens/transactionGroupForm"
import useCategory from "@/db/queries/category"
import useTransactionGroup from "@/db/queries/transactionGroup"
import { useTypedTranslation } from "@/language/useTypedTranslation"
import { useAi } from "@/utils/ai"
import { calculateTotalAmount, dateFromString } from "@/utils/helper"
import { storage } from "@/utils/storage"
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router"
import React, { useCallback, useEffect, useState } from "react"
import { Alert, BackHandler, Keyboard } from "react-native"

type TransactionResponse = {
  specific: string
  amount: number
  term: string
  categoryId: number
}

type Category = {
  id: number
  name: string
  color: CustomColorKeys
  emoji: string
}

type Transaction = {
  name: string
  specific?: string
  amount: number
  category: Category
}

export default function TransactionGroupFormScreenFromScan() {
  const { t } = useTypedTranslation()
  const router = useRouter()
  const params = useLocalSearchParams()

  const { getAnswer } = useAi()

  const [name, setTitle] = useState("")
  const [note, setNote] = useState("")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [date, setDate] = useState(new Date())

  const { getMany: getCategories } = useCategory()
  const { create: createTransactionGroup } = useTransactionGroup()

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        return true
      }

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      )

      return () => subscription.remove()
    }, [])
  )

  useEffect(() => {
    const loadAiData = async () => {
      const aiData = await getAnswer()
      try {
        const categoryIds = aiData.map(
          (transaction: TransactionResponse) => transaction.categoryId
        )

        if (!categoryIds || categoryIds.length === 0) {
          Alert.alert(
            t("common.error"),
            t("screens.input.errors.noCategoryIds")
          )
          setTransactions([])
          return
        }

        const categories = await getCategories({
          ids: categoryIds,
        })

        if (!categories || categories.length === 0) {
          Alert.alert(
            t("common.error"),
            t("screens.input.errors.categoryNotFound")
          )
          return
        }

        setTransactions(
          aiData.map((transaction: TransactionResponse) => {
            const category = categories.find(
              (category: any) => category.id === transaction.categoryId
            )
            return {
              name: transaction.term,
              specific: transaction.specific || "",
              amount: transaction.amount,
              category: category,
            }
          })
        )
      } catch (error) {
        console.error("Error while parsing: ", error)
        Alert.alert(t("common.error"), t("screens.input.errors.parsingError"))
      }
    }

    const loadStoredData = async () => {
      const data = (await storage.getObject("inputData")) as any
      const transaction = (await storage.getObject("inputTransaction")) as any

      console.log(JSON.stringify(data))
      console.log(JSON.stringify(transaction))
      if (data) {
        setTitle(data.title || "")
        setNote(data.note || "")
        setDate(data.date ? new Date(data.date) : new Date())

        const storedTransactions = data.transactions || []

        if (transaction) {
          if (transaction.idx >= 0) {
            const updatedTransactions = [...storedTransactions]
            updatedTransactions[transaction.idx] = {
              name: transaction.name,
              specific: transaction.specific,
              amount: transaction.amount,
              category: transaction.category,
            }
            setTransactions(updatedTransactions)
          } else {
            setTransactions([
              ...storedTransactions,
              {
                name: transaction.name,
                specific: transaction.specific,
                amount: transaction.amount,
                category: transaction.category,
              },
            ])
          }
        } else {
          setTransactions(storedTransactions)
        }
      }
    }

    const clearData = async () => {
      setTitle("")
      setNote("")
      setDate(new Date())
      setTransactions([])
    }

    if (params.action === "loadAiData") loadAiData()
    else if (params.action === "loadTransactionData") loadStoredData()
    else clearData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.action, params.refresh])

  const handleSubmit = async () => {
    if (name.trim() === "" || transactions.length === 0) {
      Alert.alert(t("common.error"), t("screens.input.errors.missingData"))
      return
    }

    const transactionData = transactions.map((transaction) => ({
      amount: transaction.amount,
      term: transaction.name,
      categoryId: transaction.category.id,
    }))

    await createTransactionGroup({
      name,
      note,
      date,
      transactions: transactionData,
    })

    Keyboard.dismiss()
    router.push("/transactions")

    setTitle("")
    setNote("")
    setTransactions([])
  }

  const handleAddTransaction = async () => {
    await storage.setObject("inputData", {
      name,
      note,
      date,
      transactions,
    })
    router.push("/scan/transactionForm")
  }

  const handleUpdateTransaction = async (index: number) => {
    const transaction = transactions[index]
    await storage.setObject("inputData", {
      name,
      note,
      date,
      transactions,
    })
    await storage.setObject("transactionFormData", {
      ...transaction,
      idx: index,
    })
    router.push({
      pathname: "/scan/transactionForm",
      params: {
        load: "transaction",
        type: "update",
        transactionIndex: index,
        refresh: Date.now(),
      },
    })
  }

  const handleDeleteTransaction = async (index: number) => {
    setTransactions(transactions.filter((_, i) => i !== index))
  }

  return (
    <TransactionGroupFormScreen
      title={t("screens.input.title")}
      name={name}
      date={date}
      note={note}
      amount={calculateTotalAmount(transactions)}
      transactions={transactions}
      onTitleChange={async (value) => setTitle(value)}
      onDateChange={async (value) => setDate(await dateFromString(value))}
      onNoteChange={async (value) => setNote(value)}
      onEdit={handleUpdateTransaction}
      onDelete={handleDeleteTransaction}
      onAdd={handleAddTransaction}
      onSubmit={handleSubmit}
      submitText={t("common.save")}
    />
  )
}
