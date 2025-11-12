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
    transactions,
  }: {
    name?: string
    note?: string
    date: Date
    //TODO add account id
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

        const accountResult = await tx
          .select()
          .from(accountTable)
          .where(eq(accountTable.name, "Default"))
          .limit(1)

        if (accountResult.length === 0) {
          throw new Error(
            "Default account not found. Please ensure the database is properly initialized."
          )
        }

        const account = accountResult[0]

        if (!account.id) {
          throw new Error("Default account ID is null")
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
            accountId: account.id,
          }
        })

        return tx.insert(transactionTable).values(transactionValues).returning()
      })
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Unknown error occurred")
      setError(error)
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
                  console.log(
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
        await tx
          .delete(transactionTable)
          .where(eq(transactionTable.transactionGroupId, id))

        await tx
          .delete(transactionGroupTable)
          .where(eq(transactionGroupTable.id, id))
      })
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Unknown error occurred")
      setError(error)
      throw new Error(
        `Failed to delete transaction group with id ${id}: ${error.message}`
      )
    } finally {
      setLoading(false)
    }
  }


  const get = async ({ id }: { id: number}) => {
    setLoading(true)
    setError(null)

    try
    {
      // Abfrage aus Datenbank
      const rows = await db
          .select({
            group: {
              id: transactionGroupTable.id,
              name: transactionGroupTable.name,
              note: transactionGroupTable.note,
              date: transactionGroupTable.date,
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
          .innerJoin( //leftJoin damit TransactionsGroups ohne Einträge angezeigt werden können sinnvoll?
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
            eq(transactionTable.accountId, accountTable.id)
          )
          .where(eq(transactionGroupTable.id, id))


      // Edgecase falls keine Einträge gefunden werden (sollte igentlich nicht passieren)
      if(rows.length == 0)
      {
        setLoading(false)
        return null
      }

      // Mapped Liste der Transactions
      const transactions = rows
        .map(r => ({
          id: r.tx.id,
          name: r.tx.name,
          amount: r.tx.amount,
          categoryTerm: r.term.id,
          categoryId: r.category.id,
          categoryName: r.category.name,
          categoryEmoji: r.category.emoji,
          categoryColor: r.category.color,
              
        }))

        // Bildet Summe amount aus Transactions
        const totalAmount = transactions.reduce((s, t) => s + t.amount, 0)


      return {
        ...rows[0].group,
        totalAmount, // Summe
        transactions // Transactions
      }


    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error occurred")
      console.error("Error fetching transactionGroup:", error)
      setError(error)
      setLoading(false)
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    create,
    getMany,
    remove,
    getTransactionsByGroupId,
    error,
    loading,
  }
}
