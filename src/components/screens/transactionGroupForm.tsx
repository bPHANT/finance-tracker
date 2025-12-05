import { CustomColorKeys } from "@/assets/colors"
import Button from "@/components/buttons/Button"
import FunctionalButton from "@/components/buttons/FunctionalButton"
import TransactionContainer from "@/components/containers/TransactionContainer"
import AccountTouchable from "@/components/input/AccountTouchable"
import DateField from "@/components/input/DateField"
import FieldTitle from "@/components/input/FieldTitle"
import TextField from "@/components/input/TextField"
import ScreenTitle from "@/components/tabs/ScreenTitle"
import { useTypedTranslation } from "@/language/useTypedTranslation"
import React from "react"
import { ScrollView, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

type Category = {
  id: number
  name: string
  color: CustomColorKeys
  emoji: string
}

type Account = {
  id: number
  name: string
  color: CustomColorKeys
  emoji: string
}

export type Transaction = {
  name: string
  specific?: string
  amount: number
  category: Category | null
}

type TransactionGroupFormProps = {
  title: string
  name: string
  onTitleChange: (value: string) => Promise<void>
  date: Date
  onDateChange: (value: string) => Promise<void>
  account?: Account | null
  onAccountPress: () => Promise<void>
  note: string
  onNoteChange: (value: string) => Promise<void>
  amount: string
  transactions: Transaction[]
  submitText: string
  onEdit: (idx: number) => Promise<void>
  onDelete: (idx: number) => Promise<void>
  onAdd: () => Promise<void>
  onSubmit: () => Promise<void>
  onBack?: () => Promise<void>
}

export default function TransactionGroupFormScreen(
  props: TransactionGroupFormProps
) {
  const { t } = useTypedTranslation()

  return (
    <SafeAreaView className='bg-gray-100 dark:bg-primary-950 flex-1 mb-6'>
      <ScrollView
        className='mx-4'
        keyboardShouldPersistTaps='handled'
        showsVerticalScrollIndicator={false}
      >
        <ScreenTitle title={props.title} onBack={props.onBack} />

        <View className='gap-4 mb-6'>
          <TextField
            title={t("screens.input.name")}
            value={props.name}
            onChangeValue={props.onTitleChange}
          />

          <DateField
            title={t("screens.input.date")}
            date={props.date}
            onChangeDate={props.onDateChange}
          />

          <View>
            <FieldTitle title={t("screens.input.account")} />
            <AccountTouchable
              title={props.account?.name ?? t("screens.input.selectAccount")}
              onPress={props.onAccountPress}
            />
          </View>

          <TextField
            title={t("screens.input.note")}
            value={props.note}
            onChangeValue={props.onNoteChange} // ✅ BUG FIXED
          />

          <TextField
            title={t("screens.input.sum")}
            value={props.amount}
            balance={true}
          />

          <Button title={props.submitText} onPress={props.onSubmit} />
        </View>

        <View className='flex-row gap-1 mb-4 justify-between items-center'>
          <Text className='text-subtitle font-semibold text-gray-950 dark:text-gray-100'>
            {t("screens.input.transactions")}
          </Text>

          <FunctionalButton
            title={t("screens.input.add")}
            onPress={props.onAdd}
          />
        </View>

        <View className='gap-2'>
          {props.transactions.length === 0 && (
            <Text className='text-gray-950 dark:text-gray-100'>
              {t("screens.input.noTransactions")}
            </Text>
          )}

          {props.transactions.map((transaction, index) => (
            <View key={index}>
              <TransactionContainer
                name={transaction.name}
                amount={transaction.amount.toString()}
                specific={transaction.specific}
                category={transaction.category}
                onEdit={async () => props.onEdit(index)}
                onDelete={async () => props.onDelete(index)}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
