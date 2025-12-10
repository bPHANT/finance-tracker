import { colors } from "@/assets/colors"
import { useTypedTranslation } from "@/language/useTypedTranslation"
import { Ionicons } from "@expo/vector-icons"
import { useColorScheme } from "nativewind"
import { FlatList, Modal, Text, TouchableOpacity, View } from "react-native"

export type TransactionItem = {
  id: number
  name: string
  amount: number
  groupName: string | null
  groupDate: Date
}

type TransactionListModalProps = {
  visible: boolean
  onClose: () => void
  transactions: TransactionItem[]
  categoryName: string
  categoryEmoji: string
}

export default function TransactionListModal({
  visible,
  onClose,
  transactions,
  categoryName,
  categoryEmoji,
}: TransactionListModalProps) {
  const { colorScheme } = useColorScheme()
  const { t } = useTypedTranslation()

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatAmount = (amount: number) => {
    const formatted = Math.abs(amount).toFixed(2)
    return amount < 0 ? `-${formatted} €` : `${formatted} €`
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType='slide'
      onRequestClose={onClose}
    >
      <View className='flex-1 bg-black/50'>
        <View className='flex-1 mt-20 bg-gray-50 dark:bg-primary-900 rounded-t-3xl'>
          {/* Header */}
          <View className='flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-primary-800'>
            <View className='flex-row items-center gap-2'>
              <Text className='text-3xl'>{categoryEmoji}</Text>
              <View>
                <Text className='text-lg font-bold text-gray-900 dark:text-gray-100'>
                  {categoryName}
                </Text>
                <Text className='text-sm text-gray-600 dark:text-gray-400'>
                  {transactions.length}{" "}
                  {transactions.length === 1
                    ? t("screens.input.transactionCount")
                    : t("screens.input.transactionCountPlural")}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className='p-2 bg-gray-200 dark:bg-primary-800 rounded-lg'
            >
              <Ionicons
                name='close'
                size={24}
                color={
                  colorScheme === "dark" ? colors.gray[200] : colors.gray[600]
                }
              />
            </TouchableOpacity>
          </View>

          {/* Transaction List */}
          <FlatList
            data={transactions}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => (
              <View className='mb-3 p-4 bg-gray-50 dark:bg-primary-800 rounded-lg border border-gray-200 dark:border-primary-700'>
                <View className='flex-row justify-between items-start mb-2'>
                  <Text className='flex-1 text-base font-semibold text-gray-900 dark:text-gray-100'>
                    {item.name}
                  </Text>
                  <Text
                    className={`text-base font-bold ${
                      item.amount < 0
                        ? "text-balance-red dark:balance-red-dark"
                        : "text-balance-green dark:balance-green-dark"
                    }`}
                  >
                    {formatAmount(item.amount)}
                  </Text>
                </View>
                <View className='flex-row items-center gap-2'>
                  <Text className='text-sm text-gray-600 dark:text-gray-400'>
                    {item.groupName ?? t("screens.input.unnamedGroup")}
                  </Text>
                  <Text className='text-sm text-gray-500 dark:text-gray-500'>
                    •
                  </Text>
                  <Text className='text-sm text-gray-600 dark:text-gray-400'>
                    {formatDate(item.groupDate)}
                  </Text>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View className='items-center justify-center py-12'>
                <Ionicons
                  name='file-tray-outline'
                  size={48}
                  color={
                    colorScheme === "dark" ? colors.gray[600] : colors.gray[400]
                  }
                />
                <Text className='mt-4 text-gray-600 dark:text-gray-400'>
                  {t("screens.input.noTransactionsFound")}
                </Text>
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  )
}
