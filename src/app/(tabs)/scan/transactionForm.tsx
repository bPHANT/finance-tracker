import TransactionFormScreen from "@/components/screens/transactionForm"
import { useLocalSearchParams } from "expo-router"

export default function TransactionFormScreenFromScan() {
  const params = useLocalSearchParams()

  return (
    <TransactionFormScreen
      source='scan'
      transactionIndex={params.transactionIndex}
    />
  )
}
