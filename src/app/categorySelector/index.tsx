import { colors, CustomColorKeys } from "@/assets/colors"
import EmojiWithBackground from "@/components/display/EmojiWithBackground"
import ScreenTitle from "@/components/tabs/ScreenTitle"
import useCategory from "@/db/queries/category"
import { Ionicons } from "@expo/vector-icons"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useColorScheme } from "nativewind"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { ScrollView, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

type Category = {
  id: number
  name: string
  color: CustomColorKeys
  emoji: string
  parentCategoryId?: number | null
}

type CategoryWithChildrenCheck = Category & {
  hasChildren?: boolean
}

type CategorySelectorScreenProps = {
  source: "scan" | "settings"
  currentCategoryId: string | string[]
  parentCategoryId: string | string[]
  navigationPath: string | string[]
}

export default function CategorySelectorScreen(
  props: CategorySelectorScreenProps
) {
  const { t } = useTranslation()
  const { colorScheme } = useColorScheme()

  const router = useRouter()
  const params = useLocalSearchParams()

  const source = (params.source as "scan" | "settings") || props.source

  const currentCategoryId = params.currentCategoryId
    ? Number(params.currentCategoryId)
    : 0

  const parentCategoryId = params.parentCategoryId
    ? params.parentCategoryId === "null"
      ? null
      : Number(params.parentCategoryId)
    : null

  const navigationPath = params.navigationPath
    ? JSON.parse(params.navigationPath as string)
    : []

  const [categories, setCategories] = useState<CategoryWithChildrenCheck[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const { getByParentId, hasChildren } = useCategory()

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

  const handleCategorySelect = (category: CategoryWithChildrenCheck) => {
    if (source === "settings") {
      router.push({
        pathname: "/(tabs)/settings/[categoryId]",
        params: {
          categoryId: category.id.toString(),
        },
      })
    } else {
      router.push({
        pathname: "/(tabs)/scan/transactionForm",
        params: {
          selectedCategory: JSON.stringify(category),
        },
      })
    }
  }

  const handleCategoryNavigate = (category: CategoryWithChildrenCheck) => {
    const newNavigationPath = [
      ...navigationPath,
      { id: category.id, name: category.name },
    ]

    const pathname =
      source === "settings"
        ? "/(tabs)/settings/categorySelector"
        : "/(tabs)/scan/categorySelector"

    router.push({
      pathname,
      params: {
        parentCategoryId: category.id.toString(),
        navigationPath: JSON.stringify(newNavigationPath),
        currentCategoryId: params.currentCategoryId,
      },
    })
  }

  const handleBackNavigation = () => {
    if (navigationPath.length === 0) {
      router.back()
    } else {
      const newNavigationPath = [...navigationPath]
      newNavigationPath.pop()

      const newParentId =
        newNavigationPath.length > 0
          ? newNavigationPath[newNavigationPath.length - 1].id
          : null

      const pathname =
        source === "settings"
          ? "/(tabs)/settings/categorySelector"
          : "/(tabs)/scan/categorySelector"

      router.push({
        pathname,
        params: {
          source,
          parentCategoryId: newParentId ? newParentId.toString() : "null",
          navigationPath: JSON.stringify(newNavigationPath),
          currentCategoryId: params.currentCategoryId,
        },
      })
    }
  }

  return (
    <SafeAreaView className='bg-gray-100 dark:bg-primary-950 flex-1'>
      <View className='flex-1'>
        <View className='px-4'>
          <ScreenTitle title={t("screens.categorySelector.title")} />

          {/* Breadcrumb Navigation */}
          {navigationPath.length > 0 && (
            <View className='flex-row items-center mb-4 flex-wrap'>
              <TouchableOpacity
                onPress={handleBackNavigation}
                className='flex-row items-center justify-center gap-2 mr-2 p-2 bg-gray-200 dark:bg-primary-800 rounded-lg'
              >
                <Ionicons
                  name='arrow-back-outline'
                  size={20}
                  color={
                    colorScheme === "dark" ? colors.gray[200] : colors.gray[600]
                  }
                />
                <Text className='text-gray-600 dark:text-gray-200 text-base'>
                  Back
                </Text>
              </TouchableOpacity>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className='flex-row items-center'>
                  {navigationPath.map((pathItem: any, index: number) => (
                    <View key={pathItem.id} className='flex-row items-center'>
                      {index > 0 && (
                        <Text className='text-base text-gray-600 dark:text-gray-200 mx-2'>
                          ›
                        </Text>
                      )}
                      <Text className='text-base text-gray-600 dark:text-gray-200 text-sm font-medium'>
                        {pathItem.name}
                      </Text>
                    </View>
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
              {categories.map((category) => (
                <View
                  key={category.id}
                  className={`flex-row items-center rounded-xl ${
                    currentCategoryId === category.id
                      ? "bg-primary-200 dark:bg-primary-700"
                      : "bg-gray-50 dark:bg-primary-800"
                  }`}
                >
                  <TouchableOpacity
                    onPress={() => handleCategorySelect(category)}
                    className='flex-1 flex-row items-center p-4'
                    activeOpacity={0.7}
                  >
                    <EmojiWithBackground
                      color={category.color}
                      emoji={category.emoji}
                      size='xs'
                    />
                    <Text
                      className={`text-base ml-4 flex-1 ${
                        currentCategoryId === category.id
                          ? "text-primary-800 dark:text-primary-200 font-semibold"
                          : "text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>

                  {category.hasChildren && (
                    <TouchableOpacity
                      onPress={() => handleCategoryNavigate(category)}
                      className='p-2 items-center justify-center border-2 border-gray-500 dark:border-primary-500 rounded-xl m-4'
                    >
                      <Ionicons
                        name='chevron-forward-outline'
                        size={24}
                        color={
                          colorScheme === "dark"
                            ? colors.primary[500]
                            : colors.gray[500]
                        }
                      />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  )
}
