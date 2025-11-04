import type { CustomColorKeys } from "@/assets/colors"
import Button from "@/components/buttons/Button"
import EmojiWithBackground from "@/components/display/EmojiWithBackground"
import TextField from "@/components/input/TextField"
import ColorModal from "@/components/modal/ColorModal"
import EmojiModal from "@/components/modal/EmojiModal"
import ScreenTitle from "@/components/tabs/ScreenTitle"
import useCategory from "@/db/queries/category"
import { useTypedTranslation } from "@/language/useTypedTranslation"
import { router, useFocusEffect, useLocalSearchParams } from "expo-router"
import React, { useCallback, useState } from "react"
import { View } from "react-native"
import { ScrollView } from "react-native-gesture-handler"
import { SafeAreaView } from "react-native-safe-area-context"

export default function CategoryFormScreen() {
  const { t } = useTypedTranslation()
  const {
    get: getCategory,
    create: createCategory,
    update: updateCategory,
  } = useCategory()

  const params = useLocalSearchParams()
  const categoryId = params.categoryId ? Number(params.categoryId) : 0
  const mode = params.categoryId === "-1" ? "create" : "update"

  const fetchCategory = useCallback(async () => {
    const categoryResult = await getCategory({ id: categoryId })
    setCategoryName(categoryResult?.name ?? "")
    setCategoryColor((categoryResult?.color ?? "gray") as CustomColorKeys)
    setCategoryEmoji(categoryResult?.emoji ?? " ")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId])

  useFocusEffect(
    useCallback(() => {
      fetchCategory()
    }, [fetchCategory])
  )

  const [categoryName, setCategoryName] = useState<string>()
  const [categoryColor, setCategoryColor] = useState<CustomColorKeys>("gray")
  const [categoryEmoji, setCategoryEmoji] = useState(" ")

  const [colorModalOpen, setColorModalOpen] = useState(false)
  const [emojiModalOpen, setEmojiModalOpen] = useState(false)

  async function handleNameChange(value: string) {
    setCategoryName(value)
  }

  async function handleSubmit() {
    if (!categoryName) {
      //TODO handle input answer
      return
    }

    async function createCategory() {
      //TODO handle create Answer
    }
    updateCategory({
      id: categoryId,
      name: categoryName,
      color: categoryColor,
      emoji: categoryEmoji,
    })

    router.back()
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
            <View className='items-center '>
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
            <Button
              title={
                mode === "create"
                  ? t("screens.categoryForm.create")
                  : t("common.save")
              }
              onPress={handleSubmit}
              functional='submit'
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  )
}
