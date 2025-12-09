import type { CustomColorKeys } from "@/assets/colors"
import Button from "@/components/buttons/Button"
import EmojiWithBackground from "@/components/display/EmojiWithBackground"
import CategoryTouchable from "@/components/input/CategoryTouchable"
import FieldTitle from "@/components/input/FieldTitle"
import AlertModal from "@/components/modal/AlertModal"
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
    create: createCategory,
    update: updateCategory,
    remove: deleteCategory
  } = useCategory()

  const params = useLocalSearchParams()
  const source = params.source as "settings" | "parentSelection"

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
  const mode = params.categoryId === "-1" ? "create" : "update"
  
  const [confirmState, setConfirmState] = useState<{
    visible: boolean
    type: "error" | "confirm"
    title?: string
    message: string
    onConfirm: () => void
    onCancel: () => void
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

    setCategoryId(savedCategory.id)
    setCategoryName(savedCategory.name)
    setCategoryColor(savedCategory.color)
    setCategoryEmoji(savedCategory.emoji)

    const selectedParentId = params.selectedParentId
      ? Number(params.selectedParentId)
      : null

    if (selectedParentId === -1) {
      setParentCategory(null)
      return
    } else if (selectedParentId) {
      const parentCategoryResult = await getCategory({ id: selectedParentId })

      if (parentCategoryResult)
        setParentCategory({
          ...parentCategoryResult,
          color: parentCategoryResult.color as CustomColorKeys,
        })
    } else {
      setParentCategory(savedCategory.parentCategory)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId])

  useFocusEffect(
    useCallback(() => {
      if (source === "parentSelection") loadCategory()
      else fetchCategory()
    }, [fetchCategory, source, loadCategory])
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
      parentCategory: parentCategory,
    })

    router.push({
      pathname: "/settings/categorySelector",
      params: {
        source: "form",
        currentCategoryId: categoryId?.toString(),
      },
    })
  }

  async function handleSubmit() {
    if (!categoryName || categoryName.trim() === "") {
      alert(t("screens.categoryForm.alertNoName"))
      return
    }

    if (!categoryId) return

    if (categoryId === -1) {
      createCategory({
        name: categoryName,
        color: categoryColor,
        emoji: categoryEmoji,
        parentCategoryId: parentCategory?.id ?? null,
      })
    } else {
      await updateCategory({
        id: categoryId,
        name: categoryName,
        color: categoryColor,
        emoji: categoryEmoji,
        parentCategoryId: parentCategory?.id ?? null,
      })
    }

    router.dismissTo("/settings")
    router.push({
      pathname: "/settings/categorySelector",
      params: {
        source: "select",
      },
    })
  }

  async function handleDelete() {
    if (!categoryId) return
    
    setConfirmState({
      visible: true,
      type: "confirm",
      title: t("screens.categoryForm.confirmDelete.title"),
      message: t("screens.categoryForm.confirmDelete.message"),
      onConfirm: async () => {
        await deleteCategory(categoryId)
        setConfirmState(null)
        router.dismissTo("/settings")
      },
      onCancel: () => {
        setConfirmState(null)
      },
    })
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
            <ScreenTitle
              title={
                categoryId
                  ? categoryId === -1
                    ? t("screens.categoryForm.title.create")
                    : t("screens.categoryForm.title.update")
                  : t("screens.settings.categorySettings")
              }
              onBack={async () => router.back()}
            />
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
              title={
                mode === "create"
                  ? t("screens.categoryForm.create")
                  : t("common.save")
              }
              onPress={handleSubmit}
              functional='submit'
            />
            {mode === "update" && (
              <Button
                title={t("common.delete")}
                onPress={handleDelete}
                functional="cancel"
              />
            )}

          {confirmState && (
            <AlertModal
              visible={confirmState.visible}
              type={confirmState.type}
              title={confirmState.title}
              message={confirmState.message}
              onConfirm={confirmState.onConfirm}
              onCancel={confirmState.onCancel}
            />      
          )}      


          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  )
}
