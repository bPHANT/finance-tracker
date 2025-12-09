import { eq, inArray, sql } from "drizzle-orm"
import { useState } from "react"
import { useDb } from ".."
import {
  accountTable,
  categoryTable,
  categoryTermTable,
  transactionGroupTable,
  transactionTable,
} from "../schemas"

export default function useTransactionGroup() {
  const db = useDb()

  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(false)

  const create = async ({
    name,
    note,
    date,
    accountId,
    transactions,
  }: {
    name?: string
    note?: string
    date: Date
    accountId: number
    transactions: {
      amount: number
      term: string
      categoryId: number
    }[]
  }) => {
    setLoading(true)
    setError(null)
    try {
      if (!transactions || transactions.length === 0) {
        throw new Error("No transactions provided")
      }

      for (const transaction of transactions) {
        if (!transaction.categoryId) {
          throw new Error(
            `Missing categoryId for transaction: ${transaction.term}`
          )
        }
        if (!transaction.amount || isNaN(transaction.amount)) {
          throw new Error(`Invalid amount for transaction: ${transaction.term}`)
        }
      }

      return await db.transaction(async (tx) => {
        const transactionGroupResult = await tx
          .insert(transactionGroupTable)
          .values({
            name,
            note,
            date,
            accountId,
          })
          .returning()

        if (!transactionGroupResult || transactionGroupResult.length === 0) {
          throw new Error("Failed to create transaction group")
        }

        const categoryTermResults: {
          id: number
          categoryId: number
          term: string
        }[] = []

        for (const transaction of transactions) {
          let category = await tx
            .select()
            .from(categoryTable)
            .where(eq(categoryTable.id, transaction.categoryId))
            .limit(1)
            .then((res) => res[0])

          if (!category) {
            const categoryResult = await tx
              .insert(categoryTable)
              .values({
                id: transaction.categoryId,
                name: "Uncategorized",
                color: "gray",
                emoji: "❓",
              })
              .returning()
            category = categoryResult[0]
          }

          const categoryTermResult = await tx
            .insert(categoryTermTable)
            .values({
              term: transaction.term,
              categoryId: category.id,
            })
            .onConflictDoUpdate({
              target: [categoryTermTable.term, categoryTermTable.categoryId],
              set: {
                term: transaction.term,
                categoryId: category.id,
              },
            })
            .returning()

          if (!categoryTermResult || categoryTermResult.length === 0) {
            throw new Error(
              `Failed to create category term for: ${transaction.term}`
            )
          }
          categoryTermResults.push(categoryTermResult[0])
        }

        const transactionValues = transactions.map((transaction, index) => {
          const categoryTermResult = categoryTermResults[index]
          if (!categoryTermResult || !categoryTermResult.id) {
            throw new Error(
              `Missing category term for transaction at index ${index}`
            )
          }

          return {
            name: transaction.term,
            amount: transaction.amount,
            categoryTermId: categoryTermResult.id,
            transactionGroupId: transactionGroupResult[0].id,
          }
        })

        const result = await tx
          .insert(transactionTable)
          .values(transactionValues)
          .returning()

        // Update account balance
        const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0)
        await tx
          .update(accountTable)
          .set({
            balance: sql`${accountTable.balance} + ${totalAmount}`,
          })
          .where(eq(accountTable.id, accountId))

        return result
      })
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Unknown error occurred")
      setError(error)
      console.error("Error creating transaction group:", error)
      return null
    } finally {
      setLoading(false)
    }
  }

  const getMany = () => {
    return db
      .select({
        id: transactionGroupTable.id,
        name: transactionGroupTable.name,
        note: transactionGroupTable.note,
        date: transactionGroupTable.date,
        amount: transactionTable.amount,
        categoryId: categoryTable.id,
        topLevelCategoryId:
          sql<number>`COALESCE(${categoryTable.parentCategoryId}, ${categoryTable.id})`.as(
            "topLevelCategoryId"
          ),
      })
      .from(transactionGroupTable)
      .innerJoin(
        transactionTable,
        eq(transactionTable.transactionGroupId, transactionGroupTable.id)
      )
      .innerJoin(
        categoryTermTable,
        eq(transactionTable.categoryTermId, categoryTermTable.id)
      )
      .innerJoin(
        categoryTable,
        eq(categoryTermTable.categoryId, categoryTable.id)
      )
      .then((transactionGroupResult) => {
        const groupedResults = transactionGroupResult.reduce(
          (acc, row) => {
            const groupKey = row.id.toString()
            const categoryKey = `${row.id}-${row.topLevelCategoryId}`

            if (!acc.groups[groupKey]) {
              acc.groups[groupKey] = {
                id: row.id,
                name: row.name,
                note: row.note,
                date: row.date,
                totalAmount: 0,
              }
            }
            acc.groups[groupKey].totalAmount += row.amount

            if (!acc.categories[categoryKey]) {
              acc.categories[categoryKey] = {
                groupId: row.id,
                topLevelCategoryId: row.topLevelCategoryId,
                categoryAmount: 0,
              }
            }
            acc.categories[categoryKey].categoryAmount += row.amount

            return acc
          },
          {
            groups: {} as Record<
              string,
              {
                id: number
                name: string | null
                note: string | null
                date: Date
                totalAmount: number
              }
            >,
            categories: {} as Record<
              string,
              {
                groupId: number
                topLevelCategoryId: number
                categoryAmount: number
              }
            >,
          }
        )
        const dominantCategories = Object.values(
          groupedResults.categories
        ).reduce((acc, category) => {
          const groupId = category.groupId
          if (
            !acc[groupId] ||
            category.categoryAmount > acc[groupId].categoryAmount
          ) {
            acc[groupId] = category
          }
          return acc
        }, {} as Record<number, (typeof groupedResults.categories)[string]>)

        const transactionGroupsWithTopCategory = Object.values(
          groupedResults.groups
        ).map((group) => ({
          ...group,
          topLevelCategoryId:
            dominantCategories[group.id]?.topLevelCategoryId ?? 0,
        }))

        const topLevelCategoryIds = [
          ...new Set(
            transactionGroupsWithTopCategory.map((g) => g.topLevelCategoryId)
          ),
        ].filter((id) => id > 0) // Filter out any invalid IDs

        return db
          .select({
            id: categoryTable.id,
            name: categoryTable.name,
            color: categoryTable.color,
            emoji: categoryTable.emoji,
          })
          .from(categoryTable)
          .where(inArray(categoryTable.id, topLevelCategoryIds))
          .then((topLevelCategories) => {
            const categoryLookup = topLevelCategories.reduce((acc, cat) => {
              acc[cat.id] = cat
              return acc
            }, {} as Record<number, (typeof topLevelCategories)[0]>)

            const finalResults = transactionGroupsWithTopCategory.map(
              (group) => {
                const category = categoryLookup[group.topLevelCategoryId]

                if (!category) {
                  console.error(
                    `Category not found for ID ${group.topLevelCategoryId} in group ${group.id}`
                  )
                }

                return {
                  id: group.id,
                  name: group.name ?? category?.name ?? "Unknown",
                  note: group.note,
                  date: group.date,
                  totalAmount: group.totalAmount.toFixed(2),
                  categoryColor: category?.color ?? "gray",
                  categoryEmoji: category?.emoji ?? "❓",
                }
              }
            )

            const groupedByDay = finalResults.reduce((acc, group) => {
              const dayKey = group.date.toISOString().split("T")[0]
              if (!acc[dayKey]) {
                acc[dayKey] = []
              }
              acc[dayKey].push(group)
              return acc
            }, {} as Record<string, typeof finalResults>)

            const sortedResult = Object.entries(groupedByDay)
              .map(([date, groups]) => ({
                date,
                groups: groups.sort(
                  (a, b) => Number(b.totalAmount) - Number(a.totalAmount)
                ),
              }))
              .sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime()
              )

            setLoading(false)
            return Object.values(sortedResult)
          })
      })
      .catch((err) => {
        const error =
          err instanceof Error ? err : new Error("Unknown error occurred")
        setError(error)
        setLoading(false)
        return []
      })
  }

  const remove = async ({ id }: { id: number }) => {
    setLoading(true)
    setError(null)

    try {
      await db.transaction(async (tx) => {
        // Get transactions and account info before deletion
        const groupData = await tx
          .select({
            accountId: transactionGroupTable.accountId,
            amount: transactionTable.amount,
          })
          .from(transactionGroupTable)
          .innerJoin(
            transactionTable,
            eq(transactionTable.transactionGroupId, transactionGroupTable.id)
          )
          .where(eq(transactionGroupTable.id, id))

        if (groupData.length > 0) {
          const accountId = groupData[0].accountId
          const totalAmount = groupData.reduce((sum, t) => sum + t.amount, 0)

          // Delete transactions
          await tx
            .delete(transactionTable)
            .where(eq(transactionTable.transactionGroupId, id))

          // Delete transaction group
          await tx
            .delete(transactionGroupTable)
            .where(eq(transactionGroupTable.id, id))

          // Update account balance (subtract the amount)
          await tx
            .update(accountTable)
            .set({
              balance: sql`${accountTable.balance} - ${totalAmount}`,
            })
            .where(eq(accountTable.id, accountId))
        } else {
          // If no transactions found, just delete the group
          await tx
            .delete(transactionTable)
            .where(eq(transactionTable.transactionGroupId, id))

          await tx
            .delete(transactionGroupTable)
            .where(eq(transactionGroupTable.id, id))
        }
      })
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Unknown error occurred")
      setError(error)
      console.error("Error deleting transaction group:", error)
      throw new Error(
        `Failed to delete transaction group with id ${id}: ${error.message}`
      )
    } finally {
      setLoading(false)
    }
  }

  const get = async ({ id }: { id: number }) => {
    setLoading(true)
    setError(null)

    try {
      // Abfrage aus Datenbank
      const rows = await db
        .select({
          group: {
            id: transactionGroupTable.id,
            name: transactionGroupTable.name,
            note: transactionGroupTable.note,
            date: transactionGroupTable.date,
          },
          account: {
            id: accountTable.id,
            name: accountTable.name,
            balance: accountTable.balance,
            color: accountTable.color,
            emoji: accountTable.emoji,
          },
          transaction: {
            id: transactionTable.id,
            name: transactionTable.name,
            amount: transactionTable.amount,
            categoryTermId: categoryTermTable.id,
            categoryTerm: categoryTermTable.term,
            categoryId: categoryTable.id,
            categoryName: categoryTable.name,
            categoryEmoji: categoryTable.emoji,
            categoryColor: categoryTable.color,
          },
        })
        .from(transactionGroupTable)
        .innerJoin(
          //leftJoin damit TransactionsGroups ohne Einträge angezeigt werden können sinnvoll?
          transactionTable,
          eq(transactionTable.transactionGroupId, transactionGroupTable.id)
        )
        .innerJoin(
          categoryTermTable,
          eq(transactionTable.categoryTermId, categoryTermTable.id)
        )
        .innerJoin(
          categoryTable,
          eq(categoryTermTable.categoryId, categoryTable.id)
        )
        .innerJoin(
          accountTable,
          eq(transactionGroupTable.accountId, accountTable.id)
        )
        .where(eq(transactionGroupTable.id, id))

      // Edgecase falls keine Einträge gefunden werden (sollte igentlich nicht passieren)
      if (rows.length === 0) {
        setLoading(false)
        return null
      }

      // Mapped Liste der Transactions
      const transactions = rows.map((r) => ({
        id: r.transaction.id,
        name: r.transaction.name,
        amount: r.transaction.amount,
        categoryTerm: r.transaction.categoryTerm,
        categoryId: r.transaction.categoryId,
        categoryName: r.transaction.categoryName,
        categoryEmoji: r.transaction.categoryEmoji,
        categoryColor: r.transaction.categoryColor,
      }))

      // Bildet Summe amount aus Transactions
      const totalAmount = transactions.reduce((s, t) => s + t.amount, 0)

      return {
        ...rows[0].group,
        account: rows[0].account,
        totalAmount, // Summe
        transactions, // Transactions
      }
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Unknown error occurred")
      console.error("Error fetching transactionGroup:", error)
      setError(error)
      setLoading(false)
      return null
    } finally {
      setLoading(false)
    }
  }

  const update = async ({
    id,
    name,
    note,
    date,
    accountId,
    transactions,
  }: {
    id: number
    name?: string
    note?: string
    date: Date
    accountId: number
    transactions: {
      amount: number
      term: string
      categoryId: number
    }[]
  }) => {
    setLoading(true)
    setError(null)
    try {
      if (!transactions || transactions.length === 0) {
        throw new Error("No transactions provided")
      }

      for (const transaction of transactions) {
        if (!transaction.categoryId) {
          throw new Error(
            `Missing categoryId for transaction: ${transaction.term}`
          )
        }
        if (!transaction.amount || isNaN(transaction.amount)) {
          throw new Error(`Invalid amount for transaction: ${transaction.term}`)
        }
      }

      return await db.transaction(async (tx) => {
        // Get old transactions and account info
        const oldGroupData = await tx
          .select({
            accountId: transactionGroupTable.accountId,
            amount: transactionTable.amount,
          })
          .from(transactionGroupTable)
          .innerJoin(
            transactionTable,
            eq(transactionTable.transactionGroupId, transactionGroupTable.id)
          )
          .where(eq(transactionGroupTable.id, id))

        const oldAccountId =
          oldGroupData.length > 0 ? oldGroupData[0].accountId : null
        const oldTotalAmount = oldGroupData.reduce(
          (sum, t) => sum + t.amount,
          0
        )

        // Update transaction group
        await tx
          .update(transactionGroupTable)
          .set({ name, note, date, accountId })
          .where(eq(transactionGroupTable.id, id))

        // Delete all existing transactions for this group
        await tx
          .delete(transactionTable)
          .where(eq(transactionTable.transactionGroupId, id))

        // Create category terms and new transactions
        const categoryTermResults: {
          id: number
          categoryId: number
          term: string
        }[] = []

        for (const transaction of transactions) {
          let category = await tx
            .select()
            .from(categoryTable)
            .where(eq(categoryTable.id, transaction.categoryId))
            .limit(1)
            .then((res) => res[0])

          if (!category) {
            const categoryResult = await tx
              .insert(categoryTable)
              .values({
                id: transaction.categoryId,
                name: "Uncategorized",
                color: "gray",
                emoji: "❓",
              })
              .returning()
            category = categoryResult[0]
          }

          const categoryTermResult = await tx
            .insert(categoryTermTable)
            .values({
              term: transaction.term,
              categoryId: category.id,
            })
            .onConflictDoUpdate({
              target: [categoryTermTable.term, categoryTermTable.categoryId],
              set: {
                term: transaction.term,
                categoryId: category.id,
              },
            })
            .returning()

          if (!categoryTermResult || categoryTermResult.length === 0) {
            throw new Error(
              `Failed to create category term for: ${transaction.term}`
            )
          }
          categoryTermResults.push(categoryTermResult[0])
        }

        const transactionValues = transactions.map((transaction, index) => {
          const categoryTermResult = categoryTermResults[index]
          if (!categoryTermResult || !categoryTermResult.id) {
            throw new Error(
              `Missing category term for transaction at index ${index}`
            )
          }

          return {
            name: transaction.term,
            amount: transaction.amount,
            categoryTermId: categoryTermResult.id,
            transactionGroupId: id,
          }
        })

        const result = await tx
          .insert(transactionTable)
          .values(transactionValues)
          .returning()

        // Calculate new total amount
        const newTotalAmount = transactions.reduce(
          (sum, t) => sum + t.amount,
          0
        )

        // Update account balances
        if (oldAccountId && oldAccountId !== accountId) {
          // Account changed - remove from old account and add to new account
          await tx
            .update(accountTable)
            .set({
              balance: sql`${accountTable.balance} - ${oldTotalAmount}`,
            })
            .where(eq(accountTable.id, oldAccountId))

          await tx
            .update(accountTable)
            .set({
              balance: sql`${accountTable.balance} + ${newTotalAmount}`,
            })
            .where(eq(accountTable.id, accountId))
        } else if (oldAccountId === accountId) {
          // Same account - update with difference
          const difference = newTotalAmount - oldTotalAmount
          await tx
            .update(accountTable)
            .set({
              balance: sql`${accountTable.balance} + ${difference}`,
            })
            .where(eq(accountTable.id, accountId))
        } else {
          // No old account (shouldn't happen, but handle it)
          await tx
            .update(accountTable)
            .set({
              balance: sql`${accountTable.balance} + ${newTotalAmount}`,
            })
            .where(eq(accountTable.id, accountId))
        }

        return result
      })
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Unknown error occurred")
      setError(error)
      console.error("Error updating transaction group:", error)
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    create,
    update,
    getMany,
    remove,
    get,
    error,
    loading,
  }
}
