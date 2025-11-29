import CategorySelectorScreen from "@/components/screens/categorySelector"
import { useLocalSearchParams } from "expo-router"

export default function CategorySelectorScreenFromTransactions() {
  const params = useLocalSearchParams()

  return (
    <CategorySelectorScreen
      source='transactions'
      currentCategoryId={params.currentCategoryId}
      parentCategoryId={params.parentCategoryId}
      navigationPath={params.navigationPath}
    />
  )
}
