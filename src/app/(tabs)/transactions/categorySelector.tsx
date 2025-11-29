import CategorySelectorScreen from "@/components/screens/categorySelector"
import { useLocalSearchParams } from "expo-router"
export default function CategorySelectorScreenFromScan() {
  const params = useLocalSearchParams()

  return (
    <CategorySelectorScreen
      source='scan'
      currentCategoryId={params.currentCategoryId}
      parentCategoryId={params.parentCategoryId}
      navigationPath={params.navigationPath}
    />
  )
}
