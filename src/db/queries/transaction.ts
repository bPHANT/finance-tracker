import { eq, inArray, sum } from "drizzle-orm"
import { useState } from "react"
import { useDb } from ".."
import {
  categoryTable,
  categoryTermTable,
  transactionGroupTable,
  transactionTable,
} from "../schemas"

export default function useTransaction() {
  const db = useDb()

  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(false)

  const getTotalAmount = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await db
        .select({
          totalAmount: sum(transactionTable.amount),
        })
        .from(transactionTable)

      const total = parseFloat(result[0]?.totalAmount ?? "0")
      return total.toFixed(2)
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Unknown error occurred")
      setError(error)
      return "0"
    } finally {
      setLoading(false)
    }
  }

  const getMany = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await db
        .select({
          name: transactionTable.name,
          amount: transactionTable.amount,
        })
        .from(transactionTable)
      return result
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Unknown error occurred")
      setError(error)
      return []
    } finally {
      setLoading(false)
    }
  }

  const getByCategoryId = async ({ categoryId }: { categoryId: number }) => {
    setLoading(true)
    setError(null)
    try {
      // Get all category IDs including children
      const allCategories = await db.select().from(categoryTable)
      const getCategoryWithChildren = (id: number): number[] => {
        const children = allCategories.filter(
          (cat) => cat.parentCategoryId === id
        )
        return [
          id,
          ...children.flatMap((child) => getCategoryWithChildren(child.id)),
        ]
      }
      const categoryIds = getCategoryWithChildren(categoryId)

      const result = await db
        .select({
          id: transactionTable.id,
          name: transactionTable.name,
          amount: transactionTable.amount,
          groupName: transactionGroupTable.name,
          groupDate: transactionGroupTable.date,
        })
        .from(transactionTable)
        .innerJoin(
          transactionGroupTable,
          eq(transactionTable.transactionGroupId, transactionGroupTable.id)
        )
        .innerJoin(
          categoryTermTable,
          eq(transactionTable.categoryTermId, categoryTermTable.id)
        )
        .where(inArray(categoryTermTable.categoryId, categoryIds))

      return result
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Unknown error occurred")
      setError(error)
      return []
    } finally {
      setLoading(false)
    }
  }

  return {
    getTotalAmount,
    getMany,
    getByCategoryId,
    error,
    loading,
  }
}
