import { and, eq, gte, lt, sql, sum } from "drizzle-orm"
import { useState } from "react"
import { useDb } from ".."
import {
  budgetTable,
  categoryTable,
  categoryTermTable,
  categoryToBudgetTable,
  transactionGroupTable,
  transactionTable,
} from "../schemas"

export default function useBudget() {
  const db = useDb()

  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(false)

  const create = async ({
    name,
    amount,
    start,
    end,
    period,
    color,
    emoji,
    categoryIds,
  }: {
    name: string
    amount: number
    start: number
    end?: number | null
    period: "daily" | "weekly" | "monthly" | "semesterly" | "yearly"
    color: string
    emoji: string
    categoryIds: number[]
  }) => {
    setLoading(true)
    setError(null)

    try {
      return await db.transaction(async (tx) => {
        const budgetResult = await tx
          .insert(budgetTable)
          .values({
            name,
            amount,
            start,
            end,
            period,
            color,
            emoji,
          })
          .returning()

        if (!budgetResult || budgetResult.length === 0) {
          throw new Error("Failed to create budget")
        }

        const budget = budgetResult[0]

        if (categoryIds.length > 0) {
          await tx.insert(categoryToBudgetTable).values(
            categoryIds.map((categoryId) => ({
              budgetId: budget.id,
              categoryId,
            }))
          )
        }

        return budget
      })
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Unknown error occurred")
      setError(error)
      console.error("Error creating budget:", error)
      return null
    } finally {
      setLoading(false)
    }
  }

  const get = async (id: number) => {
    setLoading(true)
    setError(null)

    try {
      const budgetResult = await db
        .select({
          id: budgetTable.id,
          name: budgetTable.name,
          amount: budgetTable.amount,
          start: budgetTable.start,
          end: budgetTable.end,
          period: budgetTable.period,
          color: budgetTable.color,
          emoji: budgetTable.emoji,
        })
        .from(budgetTable)
        .where(eq(budgetTable.id, id))

      if (!budgetResult || budgetResult.length === 0) {
        return null
      }

      const budget = budgetResult[0]

      const categoriesResult = await db
        .select({
          id: categoryTable.id,
          name: categoryTable.name,
          color: categoryTable.color,
          emoji: categoryTable.emoji,
        })
        .from(categoryTable)
        .innerJoin(
          categoryToBudgetTable,
          eq(categoryTable.id, categoryToBudgetTable.categoryId)
        )
        .where(eq(categoryToBudgetTable.budgetId, id))

      return {
        ...budget,
        categories: categoriesResult,
      }
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Unknown error occurred")
      setError(error)
      console.error("Error fetching budget:", error)
      return null
    } finally {
      setLoading(false)
    }
  }

  const getMany = async (date: { year: number; month: number }) => {
    setLoading(true)
    setError(null)

    try {
      const monthStart = new Date(date.year, date.month - 1, 1)
      const monthEnd = new Date(date.year, date.month, 1)

      const budgetResult = await db
        .select({
          id: budgetTable.id,
          name: budgetTable.name,
          amount: budgetTable.amount,
          period: budgetTable.period,
          color: budgetTable.color,
          emoji: budgetTable.emoji,
        })
        .from(budgetTable)
        .where(
          and(
            lt(budgetTable.start, monthEnd.getTime()),
            sql`${budgetTable.end} IS NULL OR ${
              budgetTable.end
            } >= ${monthStart.getTime()}`
          )
        )

      const budgetsWithPaidAmount = await Promise.all(
        budgetResult.map(async (budget) => {
          const categoryLinks = await db
            .select({ categoryId: categoryToBudgetTable.categoryId })
            .from(categoryToBudgetTable)
            .where(eq(categoryToBudgetTable.budgetId, budget.id))

          const categoryIds = categoryLinks.map((link) => link.categoryId)

          if (categoryIds.length === 0) {
            return { ...budget, paidAmount: 0 }
          }

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

          const allCategoryIds = categoryIds.flatMap((id) =>
            getCategoryWithChildren(id)
          )

          const transactionSum = await db
            .select({
              total: sum(transactionTable.amount),
            })
            .from(transactionTable)
            .innerJoin(
              categoryTermTable,
              eq(transactionTable.categoryTermId, categoryTermTable.id)
            )
            .innerJoin(
              transactionGroupTable,
              eq(transactionTable.transactionGroupId, transactionGroupTable.id)
            )
            .where(
              and(
                sql`${categoryTermTable.categoryId} IN ${allCategoryIds}`,
                gte(transactionGroupTable.date, monthStart),
                lt(transactionGroupTable.date, monthEnd)
              )
            )

          const paidAmount = Math.abs(
            parseFloat(transactionSum[0]?.total ?? "0")
          )

          return { ...budget, paidAmount }
        })
      )

      return budgetsWithPaidAmount
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Unknown error occurred")
      setError(error)
      console.error("Error fetching budgets:", error)
      return []
    } finally {
      setLoading(false)
    }
  }

  return {
    create,
    get,
    getMany,
    error,
    loading,
  }
}
