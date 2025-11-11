import { CustomColorKeys } from "@/assets/colors"
import TransactionGroupList, {
  TransactionGroupListProps,
} from "@/components/containers/TransactionGroupList"
import ScreenTitle from "@/components/tabs/ScreenTitle"
import useTransactionGroup from "@/db/queries/transactionGroup"
import { useTypedTranslation } from "@/language/useTypedTranslation"
import { router, useFocusEffect } from "expo-router"
import { useCallback, useState } from "react"
import { ScrollView, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

type TransactionGroups = {
  date: Date
  groups: TransactionGroupListProps["groups"]
}[]

export default function TransactionsScreen() {
  const { t, i18n } = useTypedTranslation()

  const { getMany: getTransactionGroups, remove: deleteTransactionGroup } =
    useTransactionGroup()
  const [transactionGroups, setTransactionGroups] = useState<TransactionGroups>(
    []
  )

  const fetchTransactionGroups = useCallback(async () => {
    const transactionGroupsResult = await getTransactionGroups()
    setTransactionGroups(
      transactionGroupsResult.map((grouped) => ({
        date: new Date(grouped.date),
        groups: grouped.groups.map((group) => ({
          id: group.id,
          name: group.name!,
          amount: group.totalAmount!,
          color: group.categoryColor as CustomColorKeys,
          emoji: group.categoryEmoji,
        })),
      }))
    )
  }, [getTransactionGroups])

  useFocusEffect(
    useCallback(() => {
      fetchTransactionGroups()
    }, [fetchTransactionGroups])
  )

  const handleDeleteTransactionGroup = async (id: number) => {
    try {
      await deleteTransactionGroup({ id })
      // Refresh the transaction groups after deletion
      await fetchTransactionGroups()
    } catch (error) {
      console.error("Failed to delete transaction group:", error)
    }
  }

  return (
    <SafeAreaView className='flex-1 bg-gray-100 dark:bg-primary-950'>
      <View className='mx-4'>
        <ScreenTitle title={t("screens.transactions.title")} />
        <ScrollView>
          <View className='gap-6'>
            {transactionGroups.map((grouped, index) => (
              <View key={index} className='gap-2'>
                <Text className='text-subtitle text-gray-950 dark:text-gray-100'>
                  {i18n.language === "en"
                    ? grouped.date.toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : grouped.date.toLocaleDateString("de-DE", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                </Text>
                <TransactionGroupList
                  groups={grouped.groups}
                  onDelete={handleDeleteTransactionGroup}
                  onPress={(id) => {
                    console.log("PRESSED", id)
                    router.push({
                      pathname: "/transactions/group",
                      params: { id },
                    })
                  }}
                />
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}
