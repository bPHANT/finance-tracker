import CategorySelectorScreen from "@/app/categorySelector"
import { useLocalSearchParams } from "expo-router"

export default function CategorySelectorScreenFromBudget() {
  const params = useLocalSearchParams()

  return (
    <CategorySelectorScreen
      source='budgetForm'
      currentCategoryId={params.currentCategoryId}
      parentCategoryId={params.parentCategoryId}
      navigationPath={params.navigationPath}
    />
  )
}
