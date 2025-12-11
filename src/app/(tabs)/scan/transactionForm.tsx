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

export default function TransactionFormScreenFromScan() {
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

        if (loadCategory && savedFormData && categoryId) {
          const categoryResult = (await getCategory({
            id: categoryId,
          })) as TransactionFormCategory
          setTransaction({
            ...savedFormData,
            category: categoryResult,
          })
        } else if (savedFormData) {
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
  }, [loadTransaction, loadCategory, categoryId, params.refresh])

  async function handleOnCancel() {
    await storage.remove("inputTransaction")
    router.replace({
      pathname: "/scan/transactionGroupForm",
      params: { action: "loadTransactionData", refresh: Date.now().toString() },
    })
  }

  async function handleOnSelectCategory(currentFormData: TransactionFormData) {
    await storage.setObject("transactionFormData", currentFormData)

    router.push({
      pathname: `/scan/categorySelector`,
      params: {
        currentCategoryId: currentFormData?.category?.id ?? -1,
        transactionFormType: isUpdate ? "update" : "create",
      },
    })
  }

  async function handleOnSubmit(transactionData: Transaction) {
    Keyboard.dismiss()

    await storage.setObject("inputTransaction", transactionData)
    router.replace({
      pathname: "/scan/transactionGroupForm",
      params: {
        action: "loadTransactionData",
        refresh: Date.now(),
      },
    })
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
