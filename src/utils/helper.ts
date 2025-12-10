import { Transaction } from "@/components/screens/transactionGroupForm"

export function calculateTotalAmount(transactions: Transaction[]) {
  return transactions
    .reduce((sum, transaction: Transaction) => sum + transaction.amount, 0)
    .toFixed(2)
}

export async function dateFromString(value?: string) {
  if (value) return new Date(value)
  else return new Date()
}
