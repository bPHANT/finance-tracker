import { CustomColorKeys } from "@/assets/colors"
import AccountModal, { Account } from "@/components/modal/AccountModal"
import {
  Transaction,
  TransactionFormData,
} from "@/components/screens/transactionForm"
import TransactionGroupFormScreen from "@/components/screens/transactionGroupForm"
import useTransactionGroup from "@/db/queries/transactionGroup"
import { useTypedTranslation } from "@/language/useTypedTranslation"
import { calculateTotalAmount, dateFromString } from "@/utils/helper"
import { storage } from "@/utils/storage"
import { router, useFocusEffect, useLocalSearchParams } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import { Alert, Keyboard } from "react-native"

type TransactionGroupFormData = {
  id: number
  name: string
  date: string
  note: string
  selectedAccount: Account
}

export default function TransactionGroupFormFromTransactions() {
  const { t } = useTypedTranslation()
  const params = useLocalSearchParams()

  const [transactionGroupId, setTransactionGroupId] = useState(() => {
    const id = Number(params.transactionGroupId)
    if (isNaN(id) || id <= 0) {
      console.error(
        "Invalid initial transactionGroupId:",
        params.transactionGroupId
      )
      return 0
    }
    return id
  })

  const { get: getTransactionGroup, update: updateTransactionGroup } =
    useTransactionGroup()

  const [name, setName] = useState("")
  const [date, setDate] = useState(new Date())
  const [note, setNote] = useState("")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)

  const [showAccountModal, setShowAccountModal] = useState(false)

  const fetchTransactionGroup = useCallback(async () => {
    if (!transactionGroupId) {
      return
    }

    if (isNaN(transactionGroupId)) {
      console.error("Invalid transaction group id!")
      return
    }

    const result = await getTransactionGroup({ id: transactionGroupId })
    if (!result) return

    setName(result.name ?? "")
    setDate(result.date ?? new Date())
    setNote(result.note ?? "")
    setSelectedAccount(result.account as Account)

    setTransactions(
      result.transactions.map((t) => ({
        idx: t.id,
        name: t.name,
        amount: t.amount,
        category: {
          id: t.categoryId,
          name: t.categoryName,
          emoji: t.categoryEmoji ?? "",
          color: t.categoryColor as CustomColorKeys,
        },
      }))
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionGroupId])

  useFocusEffect(
    useCallback(() => {
      fetchTransactionGroup()
    }, [fetchTransactionGroup])
  )

  useEffect(() => {
    const loadTransaction = async () => {
      const formData = (await storage.getObject(
        "transactionGroupData"
      )) as TransactionGroupFormData

      if (!formData || !formData.id) return
      setTransactionGroupId(formData.id)
      setName(formData.name)
      setDate(await dateFromString(formData.date))
      setNote(formData.note)
      setSelectedAccount(formData.selectedAccount)

      const transactionData = (await storage.getObject(
        "formTransaction"
      )) as Transaction

      if (params.action === "updateTransaction") {
        setTransactions((prev) =>
          prev.map((t, i) =>
            i === transactionData?.idx
              ? {
                  idx: transactionData.idx,
                  name: transactionData.name,
                  amount: transactionData.amount,
                  category: transactionData.category,
                }
              : t
          )
        )
      } else if (params.action === "createTransaction" && transactionData) {
        setTransactions([
          ...transactions,
          {
            idx: transactionData.idx,
            name: transactionData.name,
            amount: transactionData.amount,
            category: transactionData.category,
          },
        ])
      }
    }

    loadTransaction()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.action, params.refresh])

  async function saveFormData() {
    await storage.setObject("transactionGroupData", {
      id: transactionGroupId,
      name,
      date,
      note,
      selectedAccount,
    })
  }

  async function handleAddTransaction() {
    saveFormData()
    router.push({
      pathname: "/transactions/transactionForm",
      params: { type: "create", refresh: Date.now() },
    })
  }

  const handleUpdateTransaction = async (index: number) => {
    saveFormData()
    const transaction = transactions[index]
    await storage.setObject("transactionFormData", {
      ...transaction,
      idx: index, // Store the array index, not the database id
      amount: Math.abs(transaction.amount).toString(),
      type: transaction.amount < 0 ? "expense" : "income",
    } as TransactionFormData)

    router.push({
      pathname: "/transactions/transactionForm",
      params: {
        load: "transaction",
        type: "update",
        refresh: Date.now(),
      },
    })
  }

  const handleDeleteTransaction = async (index: number) => {
    setTransactions((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpdate = async () => {
    if (name.trim() === "" || transactions.length === 0 || !selectedAccount) {
      Alert.alert(t("common.error"), t("screens.input.errors.missingData"))
      return
    }

    if (
      !transactionGroupId ||
      isNaN(transactionGroupId) ||
      transactionGroupId <= 0
    ) {
      console.error(
        "Invalid transactionGroupId in handleUpdate:",
        transactionGroupId
      )
      Alert.alert(t("common.error"), "Invalid transaction group ID")
      return
    }

    const transactionData = transactions.map((transaction) => ({
      amount: transaction.amount,
      term: transaction.name,
      categoryId: transaction.category!.id,
      accountId: selectedAccount.id!,
    }))

    const result = await updateTransactionGroup({
      id: transactionGroupId,
      name,
      note,
      date,
      accountId: selectedAccount.id,
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
    <>
      <AccountModal
        visible={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        onSelectAccount={async (account) => {
          setSelectedAccount(account)
          setShowAccountModal(false)
        }}
      />

      <TransactionGroupFormScreen
        title={t("screens.transactionGroupForm.title")}
        name={name}
        date={date}
        account={selectedAccount}
        onAccountPress={async () => setShowAccountModal(true)}
        note={note}
        amount={calculateTotalAmount(transactions)}
        transactions={transactions}
        submitText={t("common.update")}
        onTitleChange={async (v) => setName(v)}
        onDateChange={async (v) => setDate(await dateFromString(v))}
        onNoteChange={async (v) => setNote(v)}
        onEdit={handleUpdateTransaction}
        onDelete={handleDeleteTransaction}
        onAdd={handleAddTransaction}
        onSubmit={handleUpdate}
        onBack={async () => router.replace("/transactions")}
      />
    </>
  )
}
