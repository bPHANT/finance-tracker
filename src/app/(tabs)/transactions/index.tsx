import { CustomColorKeys } from "@/assets/colors"
import TransactionGroupList, {
  TransactionGroupListProps,
} from "@/components/containers/TransactionGroupList"
import ScreenTitle from "@/components/tabs/ScreenTitle"
import useTransactionGroup from "@/db/queries/transactionGroup"
import { useTypedTranslation } from "@/language/useTypedTranslation"
import { router, useFocusEffect } from "expo-router"
import { useCallback, useState, useMemo } from "react"
import { BackHandler, ScrollView, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Picker } from "@react-native-picker/picker"

type TransactionGroups = {
  date: Date
  groups: TransactionGroupListProps["groups"]
}[]

export default function TransactionsScreen() {
  const { t, i18n } = useTypedTranslation()

  const { getMany: getTransactionGroups, remove: deleteTransactionGroup } =
    useTransactionGroup()

  // All unfiltered data
  const [allTransactionGroups, setAllTransactionGroups] = useState<TransactionGroups>([])

  // Filtered data
  const [transactionGroups, setTransactionGroups] = useState<TransactionGroups>([])

  const [selectedMonth, setSelectedMonth] = useState("all")
  const [selectedYear, setSelectedYear] = useState("all")

  // Extract all years from ALL data
  const availableYears = useMemo(() => {
    const years = new Set<string>()
    allTransactionGroups.forEach((g) => {
      years.add(g.date.getFullYear().toString())
    })
    return Array.from(years).sort()
  }, [allTransactionGroups])

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener("hardwareBackPress", () => true)
      return () => subscription.remove()
    }, [])
  )

  // Load data and apply filters
  const fetchTransactionGroups = useCallback(async () => {
    const result = await getTransactionGroups()

    // Save unfiltered data
    const mappedAll = result.map((grouped) => ({
      date: new Date(grouped.date),
      groups: grouped.groups.map((g) => ({
        id: g.id,
        name: g.name!,
        amount: g.totalAmount!,
        color: g.categoryColor as CustomColorKeys,
        emoji: g.categoryEmoji,
      })),
    }))
    setAllTransactionGroups(mappedAll)

    // Apply filter
    const filtered = mappedAll.filter((grouped) => {
      const date = grouped.date
      const month = date.getMonth().toString()
      const year = date.getFullYear().toString()

      const monthMatch = selectedMonth === "all" || selectedMonth === month
      const yearMatch = selectedYear === "all" || selectedYear === year

      return monthMatch && yearMatch
    })

    setTransactionGroups(filtered)
  }, [getTransactionGroups, selectedMonth, selectedYear])

  useFocusEffect(
    useCallback(() => {
      fetchTransactionGroups()
    }, [fetchTransactionGroups])
  )

  // Delete transaction group
  const handleDeleteTransactionGroup = async (id: number) => {
    await deleteTransactionGroup({ id })
    await fetchTransactionGroups()
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100 dark:bg-primary-950">
      <View className="mx-4">

        <ScreenTitle title={t("screens.transactions.title")} />

        {/* Year filter */}
        <Picker
          selectedValue={selectedYear}
          onValueChange={(value) => setSelectedYear(value)}
          style={{ backgroundColor: "white", marginBottom: 15, borderRadius: 10 }}
        >
          <Picker.Item label="All Years" value="all" />
          {availableYears.map((year) => (
            <Picker.Item key={year} label={year} value={year} />
          ))}
        </Picker>

        {/* Month filter */}
        <Picker
          selectedValue={selectedMonth}
          onValueChange={(value) => setSelectedMonth(value)}
          style={{ backgroundColor: "white", marginBottom: 10, borderRadius: 10 }}
        >
          <Picker.Item label="All Months" value="all" />
          <Picker.Item label="January" value="0" />
          <Picker.Item label="February" value="1" />
          <Picker.Item label="March" value="2" />
          <Picker.Item label="April" value="3" />
          <Picker.Item label="May" value="4" />
          <Picker.Item label="June" value="5" />
          <Picker.Item label="July" value="6" />
          <Picker.Item label="August" value="7" />
          <Picker.Item label="September" value="8" />
          <Picker.Item label="October" value="9" />
          <Picker.Item label="November" value="10" />
          <Picker.Item label="December" value="11" />
        </Picker>

        <ScrollView>
          <View className="gap-6">
            {transactionGroups.map((grouped, index) => (
              <View key={index} className="gap-2">
                <Text className="text-subtitle text-gray-950 dark:text-gray-100">
                  {grouped.date.toLocaleDateString(
                    i18n.language === "en" ? "en-US" : "de-DE",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </Text>

                <TransactionGroupList
                  groups={grouped.groups}
                  onDelete={handleDeleteTransactionGroup}
                  onPress={(id) =>
                    router.push({
                      pathname: "/transactions/transactionGroupForm",
                      params: { transactionGroupId: id },
                    })
                  }
                />
              </View>
            ))}
          </View>
        </ScrollView>

      </View>
    </SafeAreaView>
  )
}
