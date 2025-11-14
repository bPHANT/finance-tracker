import SecondTabs from "@/components/tabs/SecondTabs"
import { useTranslation } from "react-i18next"

export default function TransactionLayout() {
  const { t } = useTranslation()

  return (
    <SecondTabs
      leftTab={{
        title: t("screens.transactions.title"),
        name: "index",
        activeIcon: "list",
        inactiveIcon: "list-outline",
      }}
      rightTab={{
        title: t("screens.bubbles.title"),
        name: "bubbles",
        activeIcon: "color-filter",
        inactiveIcon: "color-filter-outline",
      }}
      invisibleTabs={["transactionGroupForm"]}
    />
  )
}
