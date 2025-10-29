import { CustomColors } from "@/assets/colors"
import Button from "@/components/buttons/Button"
import FunctionalButton from "@/components/buttons/FunctionalButton"
import TransactionContainer from "@/components/containers/TransactionContainer"
import DateField from "@/components/input/DateField"
import TextField from "@/components/input/TextField"
import ScreenTitle from "@/components/tabs/ScreenTitle"
import useCategory from "@/db/queries/category"
import useTransactionGroup from "@/db/queries/transactionGroup"
import { useTypedTranslation } from "@/language/useTypedTranslation"
import { useRoute } from "@react-navigation/native"
import { useLocalSearchParams, useRouter } from "expo-router"
import React, { useEffect, useRef, useState } from "react"
import { Alert, Keyboard, ScrollView, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

type TransactionResponse = {
  specific: string
  amount: number
  term: string
  categoryId: number
}

type Category = {
  id: number
  name: string
  color: CustomColors
  emoji: string
}

type Transaction = {
  name: string
  specific?: string
  amount: string
  category: Category
}

export default function TransactionScreen() {
  const { t } = useTypedTranslation()
  const router = useRouter()
  const params = useLocalSearchParams()

  const route = useRoute()
  const { geminiResponse } = (route.params as { geminiResponse: string }) || {
    geminiResponse: "",
  }

  const [title, setTitle] = useState("")
  const [note, setNote] = useState("")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [date, setDate] = useState(new Date())
  const processedResponse = useRef<string>("")

  const { getMany: getCategories } = useCategory()
  const { create: createTransactionGroup } = useTransactionGroup()

  useEffect(() => {
    if (params.newTransaction) {
      try {
        const newTransaction = JSON.parse(params.newTransaction as string)
        setTransactions((prev) => [...prev, newTransaction])
        router.setParams({ newTransaction: undefined })
      } catch (error) {
        console.error("Error parsing new transaction:", error)
        Alert.alert(t("common.error"), t("screens.input.errors.parsingError"))
      }
    }
  }, [params.newTransaction, router, t])

  useEffect(() => {
    if (params.updatedTransaction) {
      try {
        const { index, data } = JSON.parse(params.updatedTransaction as string)
        setTransactions((prev) =>
          prev.map((transaction, i) => (i === index ? data : transaction))
        )
        router.setParams({ updatedTransaction: undefined })
      } catch (error) {
        console.error("Error parsing updated transaction:", error)
        Alert.alert(t("common.error"), t("screens.input.errors.parsingError"))
      }
    }
  }, [params.updatedTransaction, router, t])

  useEffect(() => {
    const processGeminiResponse = async () => {
      console.log("Processing geminiResponse:", geminiResponse)
      processedResponse.current = geminiResponse

      if (geminiResponse && geminiResponse !== "") {
        try {
          const cleaned = geminiResponse.replace(/```|json/g, "").trim()
          const parsed = JSON.parse(cleaned)

          const categoryIds = parsed.map(
            (transaction: TransactionResponse) => transaction.categoryId
          )

          if (!categoryIds || categoryIds.length === 0) {
            Alert.alert(
              t("common.error"),
              t("screens.input.errors.noCategoryIds")
            )
            setTransactions([])
            return
          }

          console.log(categoryIds)
          const categories = await getCategories({
            ids: categoryIds,
          })

          if (!categories || categories.length === 0) {
            Alert.alert(
              t("common.error"),
              t("screens.input.errors.categoryNotFound")
            )
            return
          }

          setTransactions(
            parsed.map((transaction: TransactionResponse) => {
              const category = categories.find(
                (category: any) => category.id === transaction.categoryId
              )
              return {
                name: transaction.term,
                specific: transaction.specific || "",
                amount: transaction.amount.toString(),
                category: category,
              }
            })
          )
        } catch (error) {
          console.error("Error while parsing: ", error)
          Alert.alert(t("common.error"), t("screens.input.errors.parsingError"))
        }
      } else {
        setTransactions([])
      }
    }

    processGeminiResponse()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geminiResponse])

  const onChangeDate = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setDate(selectedDate)
    }
  }

  const handleSubmit = async () => {
    if (title.trim() === "" || transactions.length === 0) {
      Alert.alert(t("common.error"), t("screens.input.errors.missingData"))
      return
    }

    const transactionData = transactions.map((transaction) => ({
      amount: parseFloat(transaction.amount),
      term: transaction.name,
      categoryId: transaction.category.id,
    }))

    await createTransactionGroup({
      name: title,
      note,
      date,
      transactions: transactionData,
    })

    Keyboard.dismiss()
    router.push("/transactions")

    setTitle("")
    setNote("")
    setTransactions([])
  }

  const handleAddTransaction = () => {
    router.push("/scan/transactionForm")
  }

  const handleEditTransaction = (index: number) => {
    const transaction = transactions[index]
    router.push({
      pathname: "/scan/transactionForm",
      params: {
        transactionIndex: index.toString(),
        editData: JSON.stringify(transaction),
      },
    })
  }

  const total = transactions
    .reduce(
      (sum, transaction: Transaction) =>
        sum + parseFloat(transaction.amount || "0"),
      0
    )
    .toFixed(2)

  return (
    <SafeAreaView className='bg-gray-100 dark:bg-primary-950 flex-1'>
      <ScrollView
        className='mx-4'
        keyboardShouldPersistTaps='handled'
        showsVerticalScrollIndicator={false}
      >
        <ScreenTitle title={t("screens.input.title")} />

        <View className='gap-4 mb-6'>
          <TextField
            title={t("screens.input.name")}
            value={title}
            onChangeValue={(value) => {
              setTitle(value)
            }}
          />
          <DateField
            title={t("screens.input.date")}
            date={date}
            onChangeDate={onChangeDate}
          />
          <TextField
            title={t("screens.input.note")}
            value={note}
            onChangeValue={(value) => setNote(value)}
          />
          <TextField
            title={t("screens.input.sum")}
            value={total}
            balance={true}
          />
          <Button
            title={t("screens.input.submit")}
            onPress={() => {
              handleSubmit()
            }}
          />
        </View>

        <View className='flex-row gap-1 mb-4 justify-between items-center'>
          <Text className='text-subtitle font-semibold text-gray-950 dark:text-gray-100'>
            {t("screens.input.transactions")}
          </Text>
          <FunctionalButton
            title={t("screens.input.add")}
            onPress={handleAddTransaction}
          />
        </View>

        <View className='gap-2'>
          {transactions.length === 0 && (
            <Text className='text-gray-950 dark:text-gray-100'>
              {t("screens.input.noTransactions")}
            </Text>
          )}
          {transactions.map((transaction, index) => (
            <View key={index}>
              {/* Amount */}
              <TransactionContainer
                name={transaction.name}
                amount={transaction.amount}
                specific={transaction.specific}
                category={transaction.category}
                onEdit={() => handleEditTransaction(index)}
                onDelete={() => {
                  setTransactions((prev) => prev.filter((_, i) => i !== index))
                }}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
