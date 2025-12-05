import type { CustomColorKeys } from "@/assets/colors"
import Button from "@/components/buttons/Button"
import EmojiWithBackground from "@/components/display/EmojiWithBackground"
import CategoryTouchable from "@/components/input/CategoryTouchable"
import DateField from "@/components/input/DateField"
import FieldTitle from "@/components/input/FieldTitle"
import TextField from "@/components/input/TextField"
import ColorModal from "@/components/modal/ColorModal"
import EmojiModal from "@/components/modal/EmojiModal"
import ScreenTitle from "@/components/tabs/ScreenTitle"
import useBudget from "@/db/queries/budget"
import useCategory from "@/db/queries/category"
import { useTypedTranslation } from "@/language/useTypedTranslation"
import { storage } from "@/utils/storage"
import { router, useFocusEffect, useLocalSearchParams } from "expo-router"
import React, { useCallback, useState } from "react"
import { Alert, Text, View } from "react-native"
import { ScrollView } from "react-native-gesture-handler"
import { SafeAreaView } from "react-native-safe-area-context"

type Category = {
  id: number
  name: string
  color: CustomColorKeys
  emoji: string
}

export default function BudgetFormScreen() {
  const { t } = useTypedTranslation()
  const {
    get: getBudget,
    create: createBudget,
    update: updateBudget,
    remove: removeBudget,
  } = useBudget()
  const { get: getCategory } = useCategory()

  const params = useLocalSearchParams()
  const source = params.source as "budget" | "categorySelection"

  const [budgetId, setBudgetId] = useState<number>()
  const [budgetName, setBudgetName] = useState<string>("")
  const [budgetAmount, setBudgetAmount] = useState<string>("")
  const [budgetColor, setBudgetColor] = useState<CustomColorKeys>("gray")
  const [budgetEmoji, setBudgetEmoji] = useState(" ")
  const [budgetStart, setBudgetStart] = useState<Date>(new Date())
  const [budgetEnd, setBudgetEnd] = useState<Date | null>(null)
  const [budgetPeriod, setBudgetPeriod] = useState<
    "daily" | "weekly" | "monthly" | "semesterly" | "yearly"
  >("monthly")
  const [linkedCategories, setLinkedCategories] = useState<Category[]>([])

  const mode = params.budgetId === "-1" ? "create" : "update"

  const fetchBudget = useCallback(async () => {
    const id = params.budgetId ? Number(params.budgetId) : 0
    setBudgetId(id)

    if (!id || id === -1) {
      // Clear form for new budget
      setBudgetName("")
      setBudgetAmount("")
      setBudgetColor("gray")
      setBudgetEmoji(" ")
      setBudgetStart(new Date())
      setBudgetEnd(null)
      setBudgetPeriod("monthly")
      setLinkedCategories([])
      return
    }

    const budgetResult = await getBudget(id)
    if (!budgetResult) return

    setBudgetName(budgetResult.name)
    setBudgetAmount(budgetResult.amount.toString())
    setBudgetColor(budgetResult.color as CustomColorKeys)
    setBudgetEmoji(budgetResult.emoji)
    setBudgetStart(new Date(budgetResult.start))
    setBudgetEnd(budgetResult.end ? new Date(budgetResult.end) : null)
    setBudgetPeriod(budgetResult.period)
    setLinkedCategories(
      budgetResult.categories.map((cat) => ({
        ...cat,
        color: cat.color as CustomColorKeys,
      }))
    )
  }, [params.budgetId, getBudget])

  const loadBudget = useCallback(async () => {
    const savedBudget = (await storage.getObject("budgetFormState")) as {
      id: number
      name: string
      amount: string
      color: CustomColorKeys
      emoji: string
      start: number
      end: number | null
      period: "daily" | "weekly" | "monthly" | "semesterly" | "yearly"
      linkedCategories: Category[]
    }

    const selectedCategoryId = params.selectedCategoryId
      ? Number(params.selectedCategoryId)
      : null

    let categoryColor: CustomColorKeys | null = null
    let categoryEmoji: string | null = null
    let categoryName: string | null = null

    if (selectedCategoryId) {
      const categoryResult = await getCategory({ id: selectedCategoryId })
      if (categoryResult) {
        const newCategory = {
          ...categoryResult,
          color: categoryResult.color as CustomColorKeys,
        }

        // Set budget color and emoji to category's if not yet set
        if (
          savedBudget &&
          savedBudget.color === "gray" &&
          savedBudget.emoji === " "
        ) {
          categoryColor = newCategory.color
          categoryEmoji = newCategory.emoji
        }

        // Set budget name to category's if budget name is empty
        if (savedBudget && savedBudget.name === "") {
          categoryName = newCategory.name
        }

        // Add category to saved list if not already present
        if (savedBudget) {
          const categoryExists = savedBudget.linkedCategories.find(
            (cat) => cat.id === newCategory.id
          )
          if (!categoryExists) {
            savedBudget.linkedCategories = [
              ...savedBudget.linkedCategories,
              newCategory,
            ]
          }
        }
      }
    }

    if (savedBudget) {
      setBudgetId(savedBudget.id)
      setBudgetName(categoryName ?? savedBudget.name)
      setBudgetAmount(savedBudget.amount)
      setBudgetColor(categoryColor ?? savedBudget.color)
      setBudgetEmoji(categoryEmoji ?? savedBudget.emoji)
      setBudgetStart(new Date(savedBudget.start))
      setBudgetEnd(savedBudget.end ? new Date(savedBudget.end) : null)
      setBudgetPeriod(savedBudget.period)
      setLinkedCategories(savedBudget.linkedCategories)
    }
  }, [params.selectedCategoryId, getCategory])

  useFocusEffect(
    useCallback(() => {
      if (source === "categorySelection") loadBudget()
      else fetchBudget()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [source, params.selectedCategoryId, params.budgetId])
  )

  const [colorModalOpen, setColorModalOpen] = useState(false)
  const [emojiModalOpen, setEmojiModalOpen] = useState(false)

  async function handleNameChange(value: string) {
    setBudgetName(value)
  }

  async function handleAmountChange(value: string) {
    // Only allow numbers and decimal point
    const numericValue = value.replace(/[^0-9.]/g, "")
    setBudgetAmount(numericValue)
  }

  async function handleAddCategory() {
    await storage.setObject("budgetFormState", {
      id: budgetId,
      name: budgetName,
      amount: budgetAmount,
      color: budgetColor,
      emoji: budgetEmoji,
      start: budgetStart.getTime(),
      end: budgetEnd?.getTime() ?? null,
      period: budgetPeriod,
      linkedCategories,
    })

    router.push({
      pathname: "/budget/categorySelector",
      params: {
        budgetId: budgetId?.toString(),
      },
    })
  }

  async function handleRemoveCategory(categoryId: number) {
    setLinkedCategories((prev) => prev.filter((cat) => cat.id !== categoryId))
  }

  async function handleSubmit() {
    if (!budgetName || budgetName.trim() === "") {
      alert(t("screens.budgetForm.alertNoName"))
      return
    }

    if (!budgetAmount || parseFloat(budgetAmount) <= 0) {
      alert(t("screens.budgetForm.alertNoAmount"))
      return
    }

    if (!budgetId) return

    if (budgetId === -1) {
      await createBudget({
        name: budgetName,
        amount: parseFloat(budgetAmount),
        start: budgetStart.getTime(),
        end: budgetEnd?.getTime() ?? null,
        period: budgetPeriod,
        color: budgetColor,
        emoji: budgetEmoji,
        categoryIds: linkedCategories.map((cat) => cat.id),
      })
    } else {
      await updateBudget({
        id: budgetId,
        name: budgetName,
        amount: parseFloat(budgetAmount),
        start: budgetStart.getTime(),
        end: budgetEnd?.getTime() ?? null,
        period: budgetPeriod,
        color: budgetColor,
        emoji: budgetEmoji,
        categoryIds: linkedCategories.map((cat) => cat.id),
      })
    }

    router.replace("/budget")
  }

  async function handleDelete() {
    Alert.alert(
      "Delete Budget",
      "Are you sure you want to delete this budget? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!budgetId || budgetId === -1) return

            const success = await removeBudget(budgetId)
            if (success) {
              router.back()
            } else {
              Alert.alert("Error", "Failed to delete budget. Please try again.")
            }
          },
        },
      ]
    )
  }

  return (
    <>
      <ColorModal
        visible={colorModalOpen}
        selected={budgetColor}
        onClose={() => setColorModalOpen(false)}
        onSelect={(c) => {
          setBudgetColor(c)
          setColorModalOpen(false)
        }}
      />
      <EmojiModal
        visible={emojiModalOpen}
        selected={budgetEmoji}
        onClose={() => setEmojiModalOpen(false)}
        onSelect={(e) => {
          setBudgetEmoji(e)
          setEmojiModalOpen(false)
        }}
      />

      <SafeAreaView className='flex-1 bg-primary-50 dark:bg-primary-950'>
        <ScrollView className='flex-col gap-4 px-4'>
          <View className='gap-4'>
            <ScreenTitle
              title={
                budgetId
                  ? budgetId === -1
                    ? t("screens.budgetForm.title.create")
                    : t("screens.budgetForm.title.update")
                  : t("screens.budget.title")
              }
              onBack={async () => router.back()}
            />
            <View className='items-center'>
              <View>
                <EmojiWithBackground
                  size='l'
                  emoji={budgetEmoji}
                  color={budgetColor}
                />
              </View>
            </View>

            <TextField
              title={t("screens.budgetForm.name")}
              value={budgetName}
              onChangeValue={handleNameChange}
            />

            <TextField
              title={t("screens.budgetForm.amount")}
              value={budgetAmount}
              onChangeValue={handleAmountChange}
            />

            <View className='flex-row gap-4'>
              <Button
                title={t("screens.budgetForm.color")}
                onPress={() => setColorModalOpen(true)}
                arrowRight
              />
              <Button
                title={t("screens.budgetForm.emoji")}
                onPress={() => setEmojiModalOpen(true)}
                arrowRight
              />
            </View>

            <DateField
              title={t("screens.budgetForm.start")}
              date={budgetStart}
              onChangeDate={(event: any, selectedDate?: Date) => {
                if (selectedDate) setBudgetStart(selectedDate)
              }}
            />

            {budgetEnd && (
              <DateField
                title={t("screens.budgetForm.end")}
                date={budgetEnd}
                onChangeDate={(event: any, selectedDate?: Date) => {
                  if (selectedDate) setBudgetEnd(selectedDate)
                }}
              />
            )}

            <View className='gap-1'>
              <FieldTitle title={t("screens.budgetForm.categories")} />
              {linkedCategories.length > 0 ? (
                <View className='gap-1'>
                  {linkedCategories.map((category) => (
                    <CategoryTouchable
                      key={category.id}
                      color={category.color}
                      emoji={category.emoji}
                      title={category.name}
                      onPress={() => handleRemoveCategory(category.id)}
                      showDelete
                    />
                  ))}
                </View>
              ) : (
                <Text className='text-gray-500 dark:text-gray-400 text-sm'>
                  {t("screens.budgetForm.noCategories")}
                </Text>
              )}
              <Button
                title={t("screens.budgetForm.addCategory")}
                onPress={handleAddCategory}
                arrowRight
              />
            </View>

            <Button
              title={
                mode === "create"
                  ? t("screens.budgetForm.create")
                  : t("common.save")
              }
              onPress={handleSubmit}
              functional='submit'
            />
            {mode === "update" && (
              <Button
                title=' Delete'
                onPress={handleDelete}
                functional='cancel'
              />
            )}
            <View className='h-2' />
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  )
}
