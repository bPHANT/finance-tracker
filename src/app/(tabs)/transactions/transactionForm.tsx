import TransactionFormScreen from "@/components/screens/transactionForm"
import { useLocalSearchParams } from "expo-router"

export default function TransactionFormScreenFromTransactions() {
  const params = useLocalSearchParams()

  return (
    <TransactionFormScreen
      source='transactions'
      transactionIndex={params.transactionIndex}
    />
  )
}
