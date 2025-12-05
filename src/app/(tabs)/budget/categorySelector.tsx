import { CategoryWithChildrenCheck } from "@/components/containers/NavigationContainer"
import CategorySelectorScreen from "@/components/screens/categorySelector"
import { router, useLocalSearchParams } from "expo-router"

export default function CategorySelectorScreenFromBudget() {
  const params = useLocalSearchParams()

  async function handleOnCategorySelect(category: CategoryWithChildrenCheck) {
    router.replace({
      pathname: "/budget/budgetForm",
      params: {
        source: "categorySelection",
        budgetId: params.budgetId,
        selectedCategoryId: category.id,
      },
    })
  }

  async function handleOnCancel() {
    router.replace({
      pathname: "/budget/budgetForm",
      params: {
        source: "categorySelection",
        budgetId: params.budgetId,
      },
    })
  }

  return (
    <CategorySelectorScreen
      currentCategoryId={null}
      parentCategoryId={null}
      navigationPath={[]}
      onCategorySelect={handleOnCategorySelect}
      onCancel={handleOnCancel}
    />
  )
}
