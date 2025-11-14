import SecondTabs from "@/components/tabs/SecondTabs"
import { useTranslation } from "react-i18next"

export default function BudgetLayout() {
  const { t } = useTranslation()

  return (
    <SecondTabs
      leftTab={{
        title: t("screens.camera.title"),
        name: "camera",
        activeIcon: "camera",
        inactiveIcon: "camera-outline",
      }}
      rightTab={{
        title: t("screens.input.title"),
        name: "transactionGroupForm",
        activeIcon: "pencil",
        inactiveIcon: "pencil-outline",
      }}
      invisibleTabs={["categorySelector", "transactionForm"]}
    />
  )
}
