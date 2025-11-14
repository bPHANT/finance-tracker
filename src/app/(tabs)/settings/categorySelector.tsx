import CategorySelectorScreen from "@/components/screens/categorySelector"
import { useLocalSearchParams } from "expo-router"
export default function CategorySelectorScreenFromSettings() {
  const params = useLocalSearchParams()

  return (
    <CategorySelectorScreen
      source={(params.source as undefined | "form") ?? "settings"}
      currentCategoryId={params.currentCategoryId}
      parentCategoryId={params.parentCategoryId}
      navigationPath={params.navigationPath}
    />
  )
}
