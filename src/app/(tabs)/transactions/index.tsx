import { CustomColorKeys } from "@/assets/colors"
import TransactionGroupList from "@/components/containers/TransactionGroupList"
import ScreenTitle from "@/components/tabs/ScreenTitle"
import MonthYearSelector from "@/components/widgets/MonthYearSelector"

import useTransactionGroup from "@/db/queries/transactionGroup"
import { useTransactionFilter } from "@/db/queries/transactionFilter"

import { useTypedTranslation } from "@/language/useTypedTranslation"
import { router, useFocusEffect } from "expo-router"
import { useCallback, useState } from "react"
import { BackHandler, ScrollView, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function TransactionsScreen() {
  const { t, i18n } = useTypedTranslation()

  const { remove: deleteGroup } = useTransactionGroup()
  const {
    loadAll,
    getAvailableMonthsYears,
    applyFilter,
  } = useTransactionFilter()

  const [available, setAvailable] = useState<{ year: number; month: number }[]>([])
  const [year, setYear] = useState<number | null>(null)
  const [month, setMonth] = useState<number | null>(null)

  const [groups, setGroups] = useState<any[]>([])

  // Prevent Android back navigation closing the entire app
  useFocusEffect(
    useCallback(() => {
      const handler = () => true
      const subscription = BackHandler.addEventListener("hardwareBackPress", handler)
      return () => subscription.remove()
    }, [])
  )

  /**
   * Load available months/years + filtered groups
   */
  const loadData = useCallback(async () => {
    const all = await loadAll()

    const availableList = await getAvailableMonthsYears()
    setAvailable(availableList)

    // If no filter selected, default to newest available entry
    if (year === null || month === null) {
      const last = availableList[availableList.length - 1]
      if (last) {
        setYear(last.year)
        setMonth(last.month)
      }
    }

    const filtered = applyFilter(all, year, month)

    setGroups(
      filtered.map((g: any) => ({
        date: new Date(g.date),
        groups: g.groups.map((x: any) => ({
          id: x.id,
          name: x.name!,
          amount: x.totalAmount!,
          color: x.categoryColor as CustomColorKeys,
          emoji: x.categoryEmoji,
        })),
      }))
    )
  }, [year, month])

  useFocusEffect(
    useCallback(() => {
      loadData()
    }, [loadData])
  )

  return (
    <SafeAreaView className="flex-1 bg-gray-100 dark:bg-primary-950">
      <View className="mx-4">

        <ScreenTitle title={t("screens.transactions.title")} />

        {/* Month & Year Selector */}
        {available.length > 0 && (
          <MonthYearSelector
            month={month}
            year={year}
            available={available}
            onChange={(y, m) => {
              setYear(y)
              setMonth(m)
            }}
          />
        )}

        <ScrollView>
          {groups.map((g, idx) => (
            <View key={idx} className="gap-2 mb-6">
              <Text className="text-subtitle text-gray-950 dark:text-gray-100">
                {g.date.toLocaleDateString(
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
                groups={g.groups}
                onDelete={(id) => deleteGroup({ id }).then(loadData)}
                onPress={(id) =>
                  router.push({
                    pathname: "/transactions/transactionGroupForm",
                    params: { transactionGroupId: id },
                  })
                }
              />
            </View>
          ))}
        </ScrollView>

      </View>
    </SafeAreaView>
  )
}
