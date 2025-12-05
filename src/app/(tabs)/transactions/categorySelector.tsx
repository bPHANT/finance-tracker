import { CategoryWithChildrenCheck } from "@/components/containers/NavigationContainer"
import CategorySelectorScreen from "@/components/screens/categorySelector"
import { router, useLocalSearchParams } from "expo-router"

export default function CategorySelectorScreenFromTransactions() {
  const params = useLocalSearchParams()

  const currentCategoryId = params.currentCategoryId
    ? params.currentCategoryId === "null"
      ? null
      : Number(params.currentCategoryId)
    : null

  async function handleOnCategorySelect(category: CategoryWithChildrenCheck) {
    router.replace({
      pathname: "/transactions/transactionForm",
      params: {
        load: "category",
        categoryId: category.id,
        type: params.transactionFormType,
      },
    })
  }

  async function handleOnCancel() {
    router.replace({
      pathname: "/transactions/transactionForm",
      params: {
        load: "transaction",
        type: params.transactionFormType,
      },
    })
  }

  return (
    <CategorySelectorScreen
      currentCategoryId={currentCategoryId}
      parentCategoryId={null}
      navigationPath={[]}
      onCategorySelect={handleOnCategorySelect}
      onCancel={handleOnCancel}
    />
  )
}
