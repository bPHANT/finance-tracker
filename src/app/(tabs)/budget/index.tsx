import CircularButton from "@/components/buttons/CircularButton"
import BudgetContainer from "@/components/containers/BudgetContainer"
import ScreenTitle from "@/components/tabs/ScreenTitle"
import useBudget from "@/db/queries/budget"
import { useTypedTranslation } from "@/language/useTypedTranslation"
import { router, useFocusEffect } from "expo-router"
import { useCallback, useState } from "react"
import { ScrollView, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function BudgetScreen() {
  const { t } = useTypedTranslation()
  const { getMany: getBudgets } = useBudget()

  const [budgets, setBudgets] = useState<
    {
      id: number
      name: string
      amount: string
      paidAmount: number
      color: string
      emoji: string
    }[]
  >([])

  const fetchBudgets = useCallback(async () => {
    const now = new Date()
    const result = await getBudgets({
      year: now.getFullYear(),
      month: now.getMonth() + 1,
    })

    setBudgets(
      result.map((b) => ({
        id: b.id,
        name: b.name,
        amount: b.amount.toString(),
        paidAmount: b.paidAmount,
        color: b.color,
        emoji: b.emoji,
      }))
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useFocusEffect(
    useCallback(() => {
      fetchBudgets()
    }, [fetchBudgets])
  )

  return (
    <SafeAreaView className='flex-1 bg-gray-100 dark:bg-primary-950'>
      <View className='flex-row items-center justify-between px-4 mb-4'>
        <ScreenTitle title={t("screens.budget.title")} />
        <CircularButton
          icon='add'
          onPress={() =>
            router.push({
              pathname: "/(tabs)/budget/budgetForm",
              params: { budgetId: "-1" },
            })
          }
        />
      </View>

      <ScrollView
        className='flex-1 px-4'
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24, gap: 2 }}
      >
        {budgets.map((budget) => (
          <BudgetContainer
            key={budget.id}
            name={budget.name}
            amount={budget.amount}
            paidAmount={budget.paidAmount.toString()}
            color={budget.color as any}
            emoji={budget.emoji}
            onPress={() =>
              router.push({
                pathname: "/(tabs)/budget/budgetForm",
                params: { budgetId: budget.id.toString() },
              })
            }
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}
