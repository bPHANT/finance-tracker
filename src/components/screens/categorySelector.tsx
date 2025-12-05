import NavigationContainer, {
  CategoryWithChildrenCheck,
} from "@/components/containers/NavigationContainer"
import NavigationPath, {
  NavigationPathItem,
} from "@/components/display/NavigationPath"
import ScreenTitle from "@/components/tabs/ScreenTitle"
import useCategory from "@/db/queries/category"
import { Ionicons } from "@expo/vector-icons"
import { useFocusEffect } from "expo-router"
import React, { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { BackHandler, ScrollView, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

type CategorySelectorScreenProps = {
  currentCategoryId: number | null
  parentCategoryId: number | null
  navigationPath: NavigationPathItem[]
  showRootCategory?: boolean
  onCancel: () => Promise<void>
  onCategorySelect: (
    category: CategoryWithChildrenCheck,
    originalCategoryId?: number | null
  ) => Promise<void>
  onAdd?: () => Promise<void>
}

export default function CategorySelectorScreen(
  props: CategorySelectorScreenProps
) {
  const { t } = useTranslation()

  const [categories, setCategories] = useState<CategoryWithChildrenCheck[]>([])
  const [originalCategoryId, setOriginalCategoryId] = useState<number | null>(
    props.currentCategoryId
  )
  const [parentCategoryId, setParentCategoryId] = useState<number | null>(
    props.parentCategoryId
  )
  const [navigationPath, setNavigationPath] = useState<NavigationPathItem[]>(
    props.navigationPath
  )

  const { getByParentId, hasChildren } = useCategory()

  useEffect(() => {
    setParentCategoryId(props.parentCategoryId)
    setOriginalCategoryId(props.currentCategoryId)
    setNavigationPath(props.navigationPath)
  }, [props.parentCategoryId, props.currentCategoryId, props.navigationPath])

  function resetPath() {
    setParentCategoryId(null)
  }

  async function handleBackNavigation() {
    if (parentCategoryId) {
      const newNavigationPath = navigationPath.slice(0, -1)
      setParentCategoryId(
        newNavigationPath.length > 0
          ? newNavigationPath[newNavigationPath.length - 1].id
          : null
      )
      setNavigationPath(newNavigationPath)
    } else {
      resetPath()
      props.onCancel()
    }
  }

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        handleBackNavigation()
        return true
      }

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      )

      return () => subscription.remove()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  )

  useEffect(() => {
    let isMounted = true

    const loadCategories = async () => {
      try {
        const categoryResult = await getByParentId({
          parentId: parentCategoryId,
        })

        if (isMounted) {
          const categoriesWithChildrenCheck = await Promise.all(
            categoryResult.map(async (category) => {
              const childrenExist = await hasChildren({
                categoryId: category.id,
              })
              return {
                ...category,
                hasChildren: childrenExist,
              }
            })
          )

          setCategories(
            categoriesWithChildrenCheck as CategoryWithChildrenCheck[]
          )
        }
      } catch (error) {
        console.error("Error loading categories:", error)
      }
    }

    loadCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentCategoryId])

  async function handleCategoryNavigate(category: CategoryWithChildrenCheck) {
    if (!category.id) return
    setParentCategoryId(category.id)
    setNavigationPath([
      ...navigationPath,
      { id: category.id, name: category.name },
    ])
  }

  return (
    <SafeAreaView className='bg-gray-100 dark:bg-primary-950 flex-1'>
      <View className='flex-1'>
        <View className='px-4'>
          <View className='flex-row items-center justify-between'>
            <ScreenTitle
              title={t("screens.categorySelector.title")}
              onBack={handleBackNavigation}
            />
            <TouchableOpacity
              accessibilityLabel={t("common.add")}
              onPress={props.onAdd}
              className='p-2 -mr-2'
              hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            >
              <Ionicons name='add-circle-outline' size={28} color='#ffffff' />
            </TouchableOpacity>
          </View>
          {navigationPath.length > 0 && (
            <View className='flex-row items-center flex-wrap mb-4'>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className='flex-row items-center'>
                  {navigationPath.map((pathItem, index) => (
                    <NavigationPath
                      key={pathItem.id}
                      index={index}
                      pathItem={pathItem}
                    />
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
        </View>

        <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
          <View className='gap-3 pb-6 px-4'>
            {props.showRootCategory && !parentCategoryId && (
              <NavigationContainer
                category={{
                  id: null,
                  color: "gray",
                  emoji: " ",
                  name: t("screens.categorySelector.noParentCategory"),
                  hasChildren: false,
                  parentCategoryId: null,
                }}
                currentCategoryId={originalCategoryId ?? undefined}
                onPress={props.onCategorySelect}
              />
            )}
            {categories.map((category) => (
              <NavigationContainer
                key={category.id}
                category={category}
                currentCategoryId={originalCategoryId ?? undefined}
                onPress={async (category) =>
                  await props.onCategorySelect(category, originalCategoryId)
                }
                onNavigationPress={handleCategoryNavigate}
              />
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}
