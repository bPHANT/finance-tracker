import TransactionFormScreen, {
  Transaction,
  TransactionFormCategory,
  TransactionFormData,
} from "@/components/screens/transactionForm"
import useCategory from "@/db/queries/category"
import { storage } from "@/utils/storage"
import { router, useLocalSearchParams } from "expo-router"
import { useEffect, useState } from "react"
import { Keyboard } from "react-native"

export default function TransactionFormScreenFromTransactions() {
  const params = useLocalSearchParams()

  const { get: getCategory } = useCategory()

  const [transaction, setTransaction] = useState<TransactionFormData | null>(
    null
  )

  const loadTransaction = params.load === "transaction"
  const loadCategory = params.load === "category"
  const isUpdate = params.type === "update"
  const categoryId = Number(params.categoryId)

  useEffect(() => {
    const loadData = async () => {
      if (loadTransaction || loadCategory) {
        const savedFormData = (await storage.getObject(
          "transactionFormData"
        )) as TransactionFormData

        if (loadCategory && savedFormData) {
          const categoryResult = (await getCategory({
            id: categoryId,
          })) as TransactionFormCategory
          setTransaction({
            ...savedFormData,
            category: categoryResult,
          })
        } else {
          setTransaction(savedFormData)
        }
      } else {
        setTransaction({
          idx: -1,
          name: "",
          category: null,
          amount: "",
          type: "expense",
        })
      }
    }

    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadCategory, loadTransaction, categoryId, params.refresh])

  async function handleOnCancel() {
    router.replace({
      pathname: "/transactions/transactionGroupForm",
      params: { loadFromStorage: "2", refresh: Date.now().toString() },
    })
  }

  async function handleOnSelectCategory(currentFormData: TransactionFormData) {
    await storage.setObject("transactionFormData", currentFormData)

    router.push({
      pathname: `/transactions/categorySelector`,
      params: {
        currentCategoryId: currentFormData?.category?.id ?? -1,
        transactionFormType: isUpdate ? "update" : "create",
      },
    })
  }

  async function handleOnSubmit(transactionData: Transaction) {
    Keyboard.dismiss()

    await storage.setObject("formTransaction", transactionData)
    if (isUpdate) {
      router.replace({
        pathname: "/transactions/transactionGroupForm",
        params: {
          action: "updateTransaction",
          update: Date.now(),
        },
      })
    } else {
      router.replace({
        pathname: "/transactions/transactionGroupForm",
        params: {
          action: "createTransaction",
          update: Date.now(),
        },
      })
    }
  }

  return (
    <TransactionFormScreen
      transaction={transaction}
      isUpdate={isUpdate}
      onSelectCategory={handleOnSelectCategory}
      onSubmit={handleOnSubmit}
      onCancel={handleOnCancel}
    />
  )
}
