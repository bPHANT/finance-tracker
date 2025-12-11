import { CustomColorKeys } from "@/assets/colors"
import Button from "@/components/buttons/Button"
import DuoSwitch from "@/components/buttons/DuoSwitch"
import EmojiWithBackground from "@/components/display/EmojiWithBackground"
import TextField from "@/components/input/TextField"
import ScreenTitle from "@/components/tabs/ScreenTitle"
import { useTypedTranslation } from "@/language/useTypedTranslation"
import { Ionicons } from "@expo/vector-icons"
import { useFocusEffect } from "expo-router"
import React, { useCallback, useEffect, useState } from "react"
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

export type Transaction = {
  idx: number
  name: string
  amount: number
  category: {
    id: number
    name: string
    color: CustomColorKeys
    emoji: string
  } | null
}

export type TransactionFormCategory = {
  id: number
  name: string
  color: CustomColorKeys
  emoji: string
}

export type TransactionFormData = {
  idx: number
  name: string
  amount: string
  category: TransactionFormCategory | null
  type: "expense" | "income"
} | null

type TransactionFormScreenProps = {
  transaction: TransactionFormData
  isUpdate: boolean
  onSelectCategory: (currentFormData: TransactionFormData) => Promise<void>
  onSubmit: (transactionData: Transaction) => Promise<void>
  onCancel: () => Promise<void>
}

export default function TransactionFormScreen(
  props: TransactionFormScreenProps
) {
  const { t } = useTypedTranslation()

  const [formData, setFormData] = useState<TransactionFormData>(
    props.transaction
  )

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        props.onCancel()
        return true
      }

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      )

      return () => subscription.remove()
    }, [props])
  )

  useEffect(() => {
    setFormData(props.transaction)
  }, [props.transaction])

  const handleSubmit = async () => {
    Keyboard.dismiss()

    if (!formData?.name.trim() || formData?.category?.id === -1) {
      Alert.alert(t("common.error"), t("screens.transactionForm.fillAllFields"))
      return
    }

    const absoluteAmount = parseFloat(formData.amount)
    if (isNaN(absoluteAmount) || absoluteAmount <= 0) {
      Alert.alert(t("common.error"), "Please enter a valid positive amount")
      return
    }
    const amount =
      formData.type === "expense"
        ? -Math.abs(absoluteAmount)
        : Math.abs(absoluteAmount)

    const transactionData = {
      ...formData,
      amount,
    }

    props.onSubmit(transactionData)
  }

  return (
    <SafeAreaView className='bg-gray-100 dark:bg-primary-950 flex-1'>
      <ScrollView className='mx-4' keyboardShouldPersistTaps='handled'>
        <ScreenTitle
          title={
            props.isUpdate
              ? t("screens.transactionForm.titleEdit")
              : t("screens.transactionForm.titleAdd")
          }
          onBack={props.onCancel}
        />

        <View className='gap-4 mb-6'>
          <TextField
            title={t("screens.transactionForm.name")}
            value={formData?.name}
            onChangeValue={(value) =>
              setFormData((prev) => (prev ? { ...prev, name: value } : prev))
            }
            placeholder={t("screens.transactionForm.namePlaceholder")}
          />

          <View className='flex-row justify-between items-center'>
            <Text className='text-base font-semibold mb-2 text-gray-950 dark:text-gray-100'>
              {t("screens.transactionForm.transactionType")}
            </Text>
            <DuoSwitch
              value={formData?.type === "income"}
              onChange={() =>
                setFormData((prev) =>
                  prev
                    ? {
                        ...prev,
                        type: prev.type === "expense" ? "income" : "expense",
                      }
                    : prev
                )
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
              value={formData?.amount}
              onChangeValue={(value) =>
                setFormData((prev) =>
                  prev ? { ...prev, amount: value } : prev
                )
              }
              placeholder={t("screens.transactionForm.amountPlaceholder")}
            />
          </View>

          <View className='gap-1'>
            <Text className='text-base font-semibold text-gray-950 dark:text-gray-100'>
              {t("screens.transactionForm.category")}
            </Text>

            <TouchableOpacity
              onPress={() => props.onSelectCategory(formData)}
              className={`flex-row items-center p-4 rounded-xl border-2 ${
                formData?.category
                  ? "bg-primary-50 dark:bg-primary-900 border-primary-200 dark:border-primary-700"
                  : "bg-gray-50 dark:bg-primary-800 border-gray-200 dark:border-primary-700"
              }`}
            >
              {formData?.category ? (
                <>
                  <EmojiWithBackground
                    color={formData.category.color}
                    emoji={formData.category.emoji}
                    size='s'
                  />
                  <Text className='text-base ml-3 text-gray-900 dark:text-gray-100 font-medium'>
                    {formData.category.name}
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
              <Button title={t("common.cancel")} onPress={props.onCancel} />
            </View>
            <View className='flex-1'>
              <Button
                title={
                  props.isUpdate
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
