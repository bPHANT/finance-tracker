import SecondTabs from "@/components/tabs/SecondTabs"
import { useTypedTranslation } from "@/language/useTypedTranslation"

export default function BudgetLayout() {
  const { t } = useTypedTranslation()

  return (
    <SecondTabs
      leftTab={{
        title: t("screens.budget.title"),
        name: "index",
        activeIcon: "caret-down-circle",
        inactiveIcon: "caret-down-circle-outline",
      }}
      rightTab={{
        title: t("screens.goals.title"),
        name: "goal",
        activeIcon: "flag",
        inactiveIcon: "flag-outline",
      }}
    />
  )
}
