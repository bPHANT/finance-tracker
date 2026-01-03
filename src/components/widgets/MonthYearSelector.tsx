import React, { useMemo } from "react"
import { View, Text, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTypedTranslation } from "@/language/useTypedTranslation"

type Props = {
  year: number | null
  month: number | null
  available: { year: number; month: number }[]
  onChange: (year: number, month: number) => void
}

export default function MonthYearSelector({
  year,
  month,
  available,
  onChange,
}: Props) {
  const { t } = useTypedTranslation()

  // Month names from translation JSON
  const monthNames = [
    t("screens.transactions.months.january"),
    t("screens.transactions.months.february"),
    t("screens.transactions.months.march"),
    t("screens.transactions.months.april"),
    t("screens.transactions.months.may"),
    t("screens.transactions.months.june"),
    t("screens.transactions.months.july"),
    t("screens.transactions.months.august"),
    t("screens.transactions.months.september"),
    t("screens.transactions.months.october"),
    t("screens.transactions.months.november"),
    t("screens.transactions.months.december"),
  ]

  // Create a sorted list like: [{ year: 2024, month: 10 }, { year: 2025, month: 1 }]
  const sorted = useMemo(() => {
    return [...available].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      return a.month - b.month
    })
  }, [available])

  // Determine current index
  const currentIndex = sorted.findIndex(
    (x) => x.year === year && x.month === month
  )

  // Default to last (newest) entry
  const safeIndex = currentIndex >= 0 ? currentIndex : sorted.length - 1

  const current = sorted[safeIndex]

  function move(direction: number) {
    const nextIndex = safeIndex + direction
    if (nextIndex < 0 || nextIndex >= sorted.length) return

    const next = sorted[nextIndex]
    onChange(next.year, next.month)
  }

  return (
    <View className="my-3 p-3 rounded-xl bg-white dark:bg-primary-900 flex-row items-center justify-between">

      {/* LEFT ARROW */}
      <TouchableOpacity onPress={() => move(-1)}>
        <Ionicons name="chevron-back" size={28} color="#999" />
      </TouchableOpacity>

      {/* LABEL */}
      <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {monthNames[current.month]} {current.year}
      </Text>

      {/* RIGHT ARROW */}
      <TouchableOpacity onPress={() => move(1)}>
        <Ionicons name="chevron-forward" size={28} color="#999" />
      </TouchableOpacity>
    </View>
  )
}
