import { CategoryWithChildrenCheck } from "@/components/containers/NavigationContainer"
import CategorySelectorScreen from "@/components/screens/categorySelector"
import { storage } from "@/utils/storage"
import { useLocalSearchParams, useRouter } from "expo-router"
export default function CategorySelectorScreenFromScan() {
  const params = useLocalSearchParams()
  const router = useRouter()

  const currentCategoryId = params.currentCategoryId
    ? params.currentCategoryId === "null"
      ? null
      : Number(params.currentCategoryId)
    : null

  async function handleOnCancel() {
    router.replace("/scan/transactionForm")
  }

  async function handleOnCategorySelect(category: CategoryWithChildrenCheck) {
    await storage.setObject("inputCategory", category)
    router.replace("/scan/transactionForm")
  }

  return (
    <CategorySelectorScreen
      currentCategoryId={currentCategoryId}
      parentCategoryId={null}
      navigationPath={[]}
      onCancel={handleOnCancel}
      onCategorySelect={handleOnCategorySelect}
    />
  )
}
