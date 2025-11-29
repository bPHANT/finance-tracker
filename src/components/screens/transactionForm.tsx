import { CustomColorKeys } from "@/assets/colors"
import Button from "@/components/buttons/Button"
import DuoSwitch from "@/components/buttons/DuoSwitch"
import EmojiWithBackground from "@/components/display/EmojiWithBackground"
import TextField from "@/components/input/TextField"
import ScreenTitle from "@/components/tabs/ScreenTitle"
import useCategory from "@/db/queries/category"
import { useTypedTranslation } from "@/language/useTypedTranslation"
import { storage } from "@/utils/storage"
import { Ionicons } from "@expo/vector-icons"
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router"
import React, { useCallback, useEffect, useRef, useState } from "react"
import {
  Alert,
  BackHandler,
  Keyboard,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

type Category = {
  id: number
  name: string
  color: CustomColorKeys
  emoji: string
}

type TransactionFormData = {
  name: string
  amount: string
  categoryId: number
  type: "expense" | "income"
}

type TransactionFormScreenProps = {
  source: "scan" | "settings" | "transactions"
  transactionIndex?: string | string[]
}

export default function TransactionFormScreen(
  props: TransactionFormScreenProps
) {
  const { t } = useTypedTranslation()
  const router = useRouter()
  const params = useLocalSearchParams()

  const source =
    props.source || (params.source as "scan" | "settings" | "transactions")

  const transactionIndex = params.transactionIndex
    ? Number(params.transactionIndex)
    : params.editIndex
    ? Number(params.editIndex)
    : -1

  const isEditMode =
    ((params.transactionIndex !== undefined &&
      params.transactionIndex !== null &&
      params.transactionIndex !== "") ||
      (params.editIndex !== undefined &&
        params.editIndex !== null &&
        params.editIndex !== "")) &&
    transactionIndex >= 0

  const [formData, setFormData] = useState<TransactionFormData>({
    name: "",
    amount: "",
    categoryId: 0,
    type: "expense",
  })

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  )
  const [categories, setCategories] = useState<Category[]>([])
  const isNavigatingToCategoryRef = useRef(false)
  const processedEditDataRef = useRef<boolean>(false)

  const { getMany: getCategories } = useCategory()

  const resetForm = useCallback(() => {
    setFormData({
      name: "",
      amount: "",
      categoryId: 0,
      type: "expense",
    })
    setSelectedCategory(null)
    processedEditDataRef.current = false
  }, [])

  useFocusEffect(
    useCallback(() => {
      isNavigatingToCategoryRef.current = false

      return () => {
        if (!isEditMode && !isNavigatingToCategoryRef.current) {
          resetForm()
        }
      }
    }, [resetForm, isEditMode])
  )

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (source === "scan") {
          router.replace({
            pathname: "/scan/transactionGroupForm",
            params: {
              loadFromStorage: "2",
              refresh: Date.now().toString(),
            },
          })
        } else {
          router.back()
        }
        resetForm()
        return true
      }

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      )

      return () => subscription.remove()
    }, [resetForm, router, source])
  )

  useEffect(() => {
    let isMounted = true

    const loadCategories = async () => {
      try {
        const allCategoryIds = Array.from({ length: 100 }, (_, i) => i + 1)
        const categoryResult = await getCategories({ ids: allCategoryIds })

        if (isMounted) {
          setCategories(categoryResult as Category[])
        }
      } catch (error) {
        console.error("Error loading categories:", error)
      }
    }

    loadCategories()

    return () => {
      isMounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useFocusEffect(
    useCallback(() => {
      const loadFormData = async () => {
        const savedFormData = (await storage.getObject(
          "transactionFormData"
        )) as any
        const editData = (await storage.getObject("inputTransaction")) as any
        const selectedCategoryData = (await storage.getObject(
          "inputCategory"
        )) as any

        // For transactions tab: check URL params first
        if (
          source === "transactions" &&
          params.editData &&
          !processedEditDataRef.current
        ) {
          try {
            const txData = JSON.parse(params.editData as string)
            setFormData({
              name: txData.name,
              amount: Math.abs(parseFloat(txData.amount)).toString(),
              categoryId: txData.category.id,
              type: parseFloat(txData.amount) < 0 ? "expense" : "income",
            })
            setSelectedCategory(txData.category)
            processedEditDataRef.current = true
          } catch (e) {
            console.error("Error parsing editData:", e)
          }
        } else if (savedFormData) {
          setFormData(savedFormData.formData)
          if (savedFormData.selectedCategory) {
            setSelectedCategory(savedFormData.selectedCategory)
          }
          await storage.remove("transactionFormData")
        } else if (isEditMode && editData && !processedEditDataRef.current) {
          setFormData({
            name: editData.name,
            amount: Math.abs(parseFloat(editData.amount)).toString(),
            categoryId: editData.category.id,
            type: parseFloat(editData.amount) < 0 ? "expense" : "income",
          })
          setSelectedCategory(editData.category)
          processedEditDataRef.current = true
        }

        if (selectedCategoryData) {
          setSelectedCategory(selectedCategoryData)
          setFormData((prev) => ({
            ...prev,
            categoryId: selectedCategoryData.id,
          }))
          await storage.remove("inputCategory")
        }
      }

      loadFormData()
    }, [isEditMode, params.editData, source])
  )

  const handleCategoryPress = async () => {
    isNavigatingToCategoryRef.current = true

    if (source === "transactions") {
      // For transactions, store form data with URL params info
      await storage.setObject("transactionFormData", {
        formData,
        selectedCategory,
        isEditing: isEditMode,
        transactionIndex,
        editData: params.editData,
        editIndex: params.editIndex,
      })
    } else {
      await storage.setObject("transactionFormData", {
        formData,
        selectedCategory,
        isEditing: isEditMode,
        transactionIndex,
      })
    }

    router.push({
      pathname: `/${source}/categorySelector`,
      params: {
        currentCategoryId: formData.categoryId.toString(),
        source: source,
        transactionIndex: isEditMode ? transactionIndex.toString() : undefined,
      },
    })
  }

  const handleSubmit = async () => {
    Keyboard.dismiss()

    if (
      !formData.name.trim() ||
      !formData.amount.trim() ||
      formData.categoryId === 0
    ) {
      Alert.alert(t("common.error"), t("screens.transactionForm.fillAllFields"))
      return
    }

    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      Alert.alert(t("common.error"), "Please enter a valid positive amount")
      return
    }

    const selectedCat =
      selectedCategory ||
      categories.find((cat) => cat.id === formData.categoryId)
    if (!selectedCat) {
      Alert.alert(t("common.error"), t("screens.transactionForm.validCategory"))
      return
    }

    const finalAmount =
      formData.type === "expense" ? -Math.abs(amount) : Math.abs(amount)

    const transactionData = {
      name: formData.name,
      amount: finalAmount.toString(),
      category: selectedCat,
      type: formData.type,
    }

    if (source === "transactions") {
      // For transactions tab: return via URL params
      if (isEditMode || params.editIndex !== undefined) {
        // Edit existing transaction
        const editIdx = params.editIndex
          ? Number(params.editIndex)
          : transactionIndex
        router.replace({
          pathname: "/transactions/transactionGroupForm",
          params: {
            transactionGroupId: params.addToGroup || params.transactionGroupId,
            updatedTransaction: JSON.stringify({
              index: editIdx,
              data: transactionData,
            }),
          },
        })
      } else {
        // Add new transaction
        router.replace({
          pathname: "/transactions/transactionGroupForm",
          params: {
            transactionGroupId: params.addToGroup || params.transactionGroupId,
            newTransaction: JSON.stringify(transactionData),
          },
        })
      }
    } else {
      // For scan/settings: use storage
      if (isEditMode) {
        await storage.setObject("inputTransaction", {
          ...transactionData,
          idx: transactionIndex,
        })
      } else {
        await storage.setObject("inputTransaction", transactionData)
      }

      if (source === "scan") {
        router.replace({
          pathname: "/scan/transactionGroupForm",
          params: {
            loadFromStorage: "2",
            refresh: Date.now().toString(),
          },
        })
      } else {
        router.back()
      }
    }
    resetForm()
  }

  const handleCancel = async () => {
    Keyboard.dismiss()
    await storage.remove("inputTransaction")
    if (source === "scan") {
      router.dismissTo({
        pathname: "/scan/transactionGroupForm",
        params: {
          loadFromStorage: "2",
          refresh: Date.now().toString(),
        },
      })
    } else {
      router.dismissTo({
        pathname: "/transactions/transactionGroupForm",
      })
    }
    resetForm()
  }

  return (
    <SafeAreaView className='bg-gray-100 dark:bg-primary-950 flex-1'>
      <ScrollView className='mx-4' keyboardShouldPersistTaps='handled'>
        <ScreenTitle
          title={
            isEditMode
              ? t("screens.transactionForm.titleEdit")
              : t("screens.transactionForm.titleAdd")
          }
        />

        <View className='gap-4 mb-6'>
          <TextField
            title={t("screens.transactionForm.name")}
            value={formData.name}
            onChangeValue={(value) =>
              setFormData((prev) => ({ ...prev, name: value }))
            }
            placeholder={t("screens.transactionForm.namePlaceholder")}
          />

          <View className='flex-row justify-between items-center'>
            <Text className='text-base font-semibold mb-2 text-gray-950 dark:text-gray-100'>
              {t("screens.transactionForm.transactionType")}
            </Text>
            <DuoSwitch
              value={formData.type === "income"}
              onChange={() =>
                setFormData((prev) => ({
                  ...prev,
                  type: prev.type === "expense" ? "income" : "expense",
                }))
              }
              options={[
                t("screens.transactionForm.expense"),
                t("screens.transactionForm.income"),
              ]}
            />
          </View>

          <View>
            <TextField
              title={t("screens.transactionForm.amount")}
              value={formData.amount}
              onChangeValue={(value) =>
                setFormData((prev) => ({ ...prev, amount: value }))
              }
              placeholder={t("screens.transactionForm.amountPlaceholder")}
            />
          </View>

          <View className='gap-1'>
            <Text className='text-base font-semibold text-gray-950 dark:text-gray-100'>
              {t("screens.transactionForm.category")}
            </Text>

            <TouchableOpacity
              onPress={handleCategoryPress}
              className={`flex-row items-center p-4 rounded-xl border-2 ${
                selectedCategory
                  ? "bg-primary-50 dark:bg-primary-900 border-primary-200 dark:border-primary-700"
                  : "bg-gray-50 dark:bg-primary-800 border-gray-200 dark:border-primary-700"
              }`}
            >
              {selectedCategory ? (
                <>
                  <EmojiWithBackground
                    color={selectedCategory.color}
                    emoji={selectedCategory.emoji}
                    size='s'
                  />
                  <Text className='text-base ml-3 text-gray-900 dark:text-gray-100 font-medium'>
                    {selectedCategory.name}
                  </Text>
                </>
              ) : (
                <Text className='text-base text-gray-500 dark:text-gray-100'>
                  {t("screens.transactionForm.selectCategory")}
                </Text>
              )}
              <View className='ml-auto'>
                <Ionicons name='chevron-forward' size={24} color='gray' />
              </View>
            </TouchableOpacity>
          </View>

          <View className='flex-row gap-4 mt-4'>
            <View className='flex-1'>
              <Button title={t("common.cancel")} onPress={handleCancel} />
            </View>
            <View className='flex-1'>
              <Button
                title={
                  isEditMode
                    ? t("screens.transactionForm.updateTransaction")
                    : t("screens.transactionForm.addTransaction")
                }
                onPress={handleSubmit}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
