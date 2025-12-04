import { CategoryWithChildrenCheck } from "@/components/containers/NavigationContainer"
import CategorySelectorScreen from "@/components/screens/categorySelector"
import { router, useLocalSearchParams } from "expo-router"
export default function CategorySelectorScreenFromSettings() {
  const params = useLocalSearchParams()
  const source = params.source as string

  async function handleOnCancel() {
    router.replace("/settings")
  }

  async function handleOnCategorySelect(
    category: CategoryWithChildrenCheck,
    originalCategoryId: number | null | undefined
  ) {
    if (source === "select") {
      if (!category.id) {
        console.error("Error while Selection: No category.id for select mode")
        return
      }
      router.push({
        pathname: "/(tabs)/settings/categoryForm",
        params: {
          categoryId: category.id,
        },
      })
    } else if (source === "form") {
      router.replace({
        pathname: "/(tabs)/settings/categoryForm",
        params: {
          categoryId: originalCategoryId,
          source: "parentSelection",
          selectedParentId: category.id ?? -1,
        },
      })
    }
  }

  async function handleOnAdd() {}

  return (
    <CategorySelectorScreen
      currentCategoryId={null}
      parentCategoryId={null}
      navigationPath={[]}
      showRootCategory={source === "form"}
      onCategorySelect={handleOnCategorySelect}
      onCancel={handleOnCancel}
      onAdd={source === "select" ? handleOnAdd : undefined}
    />
  )
}
