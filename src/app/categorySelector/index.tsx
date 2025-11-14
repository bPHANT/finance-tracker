import NavigationContainer, {
  CategoryWithChildrenCheck,
} from "@/components/containers/NavigationContainer"
import NavigationPath, {
  NavigationPathItem,
} from "@/components/display/NavigationPath"
import ScreenTitle from "@/components/tabs/ScreenTitle"
import useCategory from "@/db/queries/category"
import { storage } from "@/utils/storage"
import { Ionicons } from "@expo/vector-icons"
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router"
import React, { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  BackHandler,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

type CategorySelectorScreenProps = {
  source: "scan" | "settings" | "form"
  currentCategoryId: string | string[]
  parentCategoryId: string | string[]
  navigationPath: string | string[]
}

export default function CategorySelectorScreen(
  props: CategorySelectorScreenProps
) {
  const { t } = useTranslation()

  const router = useRouter()
  const params = useLocalSearchParams()

  const source = (params.source as "scan" | "settings" | "form") || props.source

  const currentCategoryId = params.currentCategoryId
    ? Number(params.currentCategoryId)
    : 0

  const transactionIndex = params.transactionIndex
    ? params.transactionIndex
    : undefined

  const parentCategoryId = params.parentCategoryId
    ? params.parentCategoryId === "null"
      ? null
      : Number(params.parentCategoryId)
    : null

  const navigationPath: NavigationPathItem[] = params.navigationPath
    ? JSON.parse(params.navigationPath as string)
    : []

  const [categories, setCategories] = useState<CategoryWithChildrenCheck[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const { getByParentId, hasChildren } = useCategory()

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
    }, [navigationPath, source, transactionIndex])
  )

  useEffect(() => {
    let isMounted = true

    const loadCategories = async () => {
      try {
        setIsLoading(true)

        const categoryResult = await getByParentId({
          parentId: parentCategoryId === null ? null : parentCategoryId,
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
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadCategories()

    return () => {
      isMounted = false
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentCategoryId])

  const handleCategorySelect = async (category: CategoryWithChildrenCheck) => {
    if (!category.id) {
      console.log("Error while Selection: No category.id")
      return
    }
    if (source === "settings") {
      router.push({
        pathname: "/(tabs)/settings/[categoryId]",
        params: {
          categoryId: category.id.toString(),
        },
      })
    } else if (source === "form") {
      router.replace({
        pathname: "/(tabs)/settings/[categoryId]",
        params: {
          categoryId: currentCategoryId.toString(),
          source: "parentSelection",
          selectedParentId: category.id.toString(),
        },
      })
    } else if (source === "scan") {
      await storage.setObject("inputCategory", category)
      router.replace({
        pathname: "/scan/transactionForm",
        params: { transactionIndex: transactionIndex },
      })
    }
  }

  const handleNoParentCategorySelect = async () => {
    router.push({
      pathname: "/settings/[categoryId]",
      params: {
        categoryId: currentCategoryId.toString(),
        source: "parentSelection",
        selectedParentId: "-1",
      },
    })
  }

  const handleCategoryNavigate = async (
    category: CategoryWithChildrenCheck
  ) => {
    const newNavigationPath = [
      ...navigationPath,
      { id: category.id, name: category.name },
    ]

    const pathname =
      source === "settings"
        ? "/settings/categorySelector"
        : "/scan/categorySelector"

    router.push({
      pathname,
      params: {
        parentCategoryId: category.id?.toString(),
        navigationPath: JSON.stringify(newNavigationPath),
        currentCategoryId: params.currentCategoryId,
        source: source === "form" ? "form" : undefined,
      },
    })
  }

  const handleBackNavigation = async () => {
    if (navigationPath.length === 0) {
      if (source === "settings") {
        router.back()
      } else if (source === "form") {
        router.back()
      } else if (source === "scan") {
        router.replace({
          pathname: "/(tabs)/scan/transactionForm",
          params: { transactionIndex: transactionIndex },
        })
      } else {
        router.back()
      }
      return
    }

    const newNavigationPath = navigationPath.slice(0, -1)
    const newParentId =
      newNavigationPath.length > 0
        ? newNavigationPath[newNavigationPath.length - 1].id
        : null

    const pathname =
      source === "settings"
        ? "/settings/categorySelector"
        : "/scan/categorySelector"

    router.push({
      pathname,
      params: {
        parentCategoryId: newParentId?.toString() ?? "null",
        navigationPath: JSON.stringify(newNavigationPath),
        currentCategoryId: params.currentCategoryId,
        source: source === "form" ? "form" : source,
        transactionIndex: transactionIndex,
      },
    })
  }

  const handleAddPress = () => {
    router.push({
      pathname: "/(tabs)/settings/[categoryId]",
      params: {
        categoryId: -1,
      },
    })
  }

  return (
    <SafeAreaView className='bg-gray-100 dark:bg-primary-950 flex-1'>
      <View className='flex-1'>
        <View className='px-4'>
          <View className='flex-row items-center justify-between'>
            <ScreenTitle
              title={t("screens.categorySelector.title")}
              onBack={() => handleBackNavigation()}
            />
            <TouchableOpacity
              accessibilityLabel={t("common.add")}
              onPress={handleAddPress}
              className='p-2 -mr-2'
              hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            >
              <Ionicons name='add-circle-outline' size={28} color='#ffffff' />
            </TouchableOpacity>
          </View>
          {navigationPath.length > 0 && (
            <View className='flex-row items-center flex-wrap mb-4'>
              {/* <BackButton onPress={handleBackNavigation} /> */}

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

        {isLoading ? (
          <View className='flex-1 items-center justify-center'>
            <Text className='text-gray-600 dark:text-gray-400'>
              {t("screens.categorySelector.loading")}
            </Text>
          </View>
        ) : (
          <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
            <View className='gap-3 pb-6 px-4'>
              {source === "form" && !parentCategoryId && (
                <NavigationContainer
                  category={{
                    id: null,
                    color: "gray",
                    emoji: " ",
                    name: t("screens.categorySelector.noParentCategory"),
                    hasChildren: false,
                    parentCategoryId: null,
                  }}
                  currentCategoryId={currentCategoryId}
                  onPress={handleNoParentCategorySelect}
                />
              )}
              {categories.map((category) => (
                <NavigationContainer
                  key={category.id}
                  category={category}
                  currentCategoryId={currentCategoryId}
                  onPress={handleCategorySelect}
                  onNavigationPress={handleCategoryNavigate}
                />
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  )
}
