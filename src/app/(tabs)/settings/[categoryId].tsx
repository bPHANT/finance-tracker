import type { CustomColorKeys } from "@/assets/colors"
import Button from "@/components/buttons/Button"
import EmojiWithBackground from "@/components/display/EmojiWithBackground"
import CategoryTouchable from "@/components/input/CategoryTouchable"
import FieldTitle from "@/components/input/FieldTitle"
import TextField from "@/components/input/TextField"
import ColorModal from "@/components/modal/ColorModal"
import EmojiModal from "@/components/modal/EmojiModal"
import ScreenTitle from "@/components/tabs/ScreenTitle"
import useCategory from "@/db/queries/category"
import { useTypedTranslation } from "@/language/useTypedTranslation"
import { storage } from "@/utils/storage"
import { router, useFocusEffect, useLocalSearchParams } from "expo-router"
import React, { useCallback, useState } from "react"
import { View } from "react-native"
import { ScrollView } from "react-native-gesture-handler"
import { SafeAreaView } from "react-native-safe-area-context"

type Category = {
  id: number
  name: string
  color: CustomColorKeys
  emoji: string
}
type CategoryWithParent = Category & { parentCategory: Category }

export default function CategoryFormScreen() {
  const { t } = useTypedTranslation()
  const {
    get: getCategory,
    getWithParent: getCategoryWithParent,
    update: updateCategory,
  } = useCategory()

  const params = useLocalSearchParams()
  const from = params.from as "settings" | "parentSelection"

  const [categoryId, setCategoryId] = useState<number>()
  const [categoryName, setCategoryName] = useState<string>()
  const [categoryColor, setCategoryColor] = useState<CustomColorKeys>("gray")
  const [categoryEmoji, setCategoryEmoji] = useState(" ")
  const [parentCategory, setParentCategory] = useState<{
    id: number
    name: string
    color: CustomColorKeys
    emoji: string
  } | null>(null)

  const fetchCategory = useCallback(async () => {
    setCategoryId(params.categoryId ? Number(params.categoryId) : 0)
    if (!categoryId) return

    const categoryResult = await getCategoryWithParent({ id: categoryId })
    setCategoryName(categoryResult?.name ?? "")
    setCategoryColor((categoryResult?.color ?? "gray") as CustomColorKeys)
    setCategoryEmoji(categoryResult?.emoji ?? " ")
    setParentCategory(
      categoryResult?.parent
        ? {
            ...categoryResult?.parent,
            color: categoryResult?.parent?.color as CustomColorKeys,
          }
        : null
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId])

  const loadCategory = useCallback(async () => {
    const savedCategory = (await storage.getObject(
      "categoryFormState"
    )) as CategoryWithParent

    setCategoryName(savedCategory.name)
    setCategoryColor(savedCategory.color)
    setCategoryEmoji(savedCategory.emoji)

    // Get the selected parent ID from params
    const selectedParentId = params.selectedParentId
      ? Number(params.selectedParentId)
      : null

    if (selectedParentId) {
      const parentCategoryResult = await getCategory({ id: selectedParentId })

      if (parentCategoryResult)
        setParentCategory({
          ...parentCategoryResult,
          color: parentCategoryResult.color as CustomColorKeys,
        })
    }

    setCategoryId(savedCategory.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId])

  useFocusEffect(
    useCallback(() => {
      if (from === "parentSelection") loadCategory()
      else fetchCategory()
    }, [fetchCategory, from, loadCategory])
  )

  const [colorModalOpen, setColorModalOpen] = useState(false)
  const [emojiModalOpen, setEmojiModalOpen] = useState(false)

  async function handleNameChange(value: string) {
    setCategoryName(value)
  }

  async function handleSelectParentCategory() {
    await storage.setObject("categoryFormState", {
      id: categoryId,
      name: categoryName,
      color: categoryColor,
      emoji: categoryEmoji,
      parent: parentCategory,
    })

    router.push({
      pathname: "/categorySelector",
      params: {
        source: "form",
        currentCategoryId: categoryId?.toString(),
      },
    })
  }

  async function handleSubmit() {
    if (!categoryName) {
      //TODO handle input answer
      return
    }

    if (!categoryId) return

    await updateCategory({
      id: categoryId,
      name: categoryName,
      color: categoryColor,
      emoji: categoryEmoji,
      parentCategoryId: parentCategory?.id,
    })

    const categoryResult = await getCategoryWithParent({ id: categoryId })
    console.log(JSON.stringify(categoryResult))

    router.push("/settings")
  }

  return (
    <>
      <ColorModal
        visible={colorModalOpen}
        selected={categoryColor}
        onClose={() => setColorModalOpen(false)}
        onSelect={(c) => {
          setCategoryColor(c)
          setColorModalOpen(false)
        }}
      />
      <EmojiModal
        visible={emojiModalOpen}
        selected={categoryEmoji}
        onClose={() => setEmojiModalOpen(false)}
        onSelect={(e) => {
          setCategoryEmoji(e)
          setEmojiModalOpen(false)
        }}
      />

      <SafeAreaView className='flex-1 bg-primary-50 dark:bg-primary-950'>
        <ScrollView className='flex-col gap-4 px-4'>
          <View className='gap-4'>
            <ScreenTitle title={t("screens.settings.title")} showBackButton />
            <View className='items-center'>
              <View>
                <EmojiWithBackground
                  size='l'
                  emoji={categoryEmoji}
                  color={categoryColor}
                />
              </View>
            </View>

            <TextField
              title={t("screens.categoryForm.name")}
              value={categoryName}
              onChangeValue={handleNameChange}
            />

            <View className='flex-row gap-4'>
              <Button
                title={t("screens.categoryForm.color")}
                onPress={() => setColorModalOpen(true)}
                arrowRight
              />
              <Button
                title={t("screens.categoryForm.emoji")}
                onPress={() => setEmojiModalOpen(true)}
                arrowRight
              />
            </View>
            <View className='gap-1'>
              <FieldTitle title={t("screens.categoryForm.parentCategory")} />
              <CategoryTouchable
                color={parentCategory?.color}
                emoji={parentCategory?.emoji}
                title={
                  parentCategory?.name ??
                  t("screens.categoryForm.noParentCategory")
                }
                onPress={handleSelectParentCategory}
              />
            </View>
            <Button
              title={t("common.save")}
              onPress={handleSubmit}
              functional='submit'
            ></Button>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  )
}
