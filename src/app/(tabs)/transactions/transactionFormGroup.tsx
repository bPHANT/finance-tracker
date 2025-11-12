import { CustomColorKeys } from "@/assets/colors"
import useTransactionGroup from "@/db/queries/transactionGroup"
import { useFocusEffect, useLocalSearchParams } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import { Text, View } from "react-native"

type Transaction = {
  id: number
  name: string
  amount: number
  categoryId: number
  categoryName: string
  categoryEmoji: string | null
  categoryColor: CustomColorKeys
}

type Group = {
  id: number
  name: string
  note: string | null
  date: Date
  totalAmount: number
  transactions: Transaction[]
}

export default function TransactionFormGroupScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>()
  const groupId = Number(id)

  const { get } = useTransactionGroup()
  const [group, setGroup] = useState<Group | null>(null)

  const fetchGroup = useCallback(async () => {
    const res = await get({ id: groupId })
    const mapped: Group | null = res
      ? {
          id: res.id,
          name: res.name ?? "",
          note: res.note ?? "",
          date: new Date(res.date),
          totalAmount: res.totalAmount,
          transactions: res.transactions.map(t => ({
            id: t.id,
            name: t.name ?? "",
            amount: t.amount,
            categoryId: t.categoryId,
            categoryName: t.categoryName,
            categoryEmoji: t.categoryEmoji,
            categoryColor: t.categoryColor as CustomColorKeys,
          })),
        }
      : null
    setGroup(mapped)
  }, [get, groupId])


useFocusEffect(useCallback(() => {fetchGroup()}, [groupId]));
useEffect(() => { console.log(group)}, [group]);

  return (
    <View className='flex-1 items-center justify-center bg-background'>
      <Text className='text-primary-600 text-3xl'>
        {"WIP: HIER KOMMEN DIE TRANSAKTIONEN HIN"}
      </Text>
    </View>
  )
}
