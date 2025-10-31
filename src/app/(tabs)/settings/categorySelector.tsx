import CategorySelectorScreen from "@/app/categorySelector"
import { useLocalSearchParams } from "expo-router"
export default function CategorySelectorScreenFromSettings() {
  const params = useLocalSearchParams()

  return (
    <CategorySelectorScreen
      source='settings'
      currentCategoryId={params.currentCategoryId}
      parentCategoryId={params.parentCategoryId}
      navigationPath={params.navigationPath}
    />
  )
}
