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

  // -------------------------------------------------------------
  // CREATE GROUP
  // -------------------------------------------------------------
  const create = async ({
    name,
    note,
    date,
    transactions,
  }: {
    name?: string
    note?: string
    date: Date
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

      return await db.transaction(async (tx) => {
        const group = await tx
          .insert(transactionGroupTable)
          .values({ name, note, date })
          .returning()

        const groupId = group[0].id

        for (const t of transactions) {
          await tx.insert(transactionTable).values({
            name: t.term,
            amount: t.amount,
            categoryTermId: t.categoryId,
            transactionGroupId: groupId,
            accountId: 1, // TODO dynamic
          })
        }

        return groupId
      })
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"))
      return null
    } finally {
      setLoading(false)
    }
  }

  // -------------------------------------------------------------
  // UPDATE GROUP (NEU)
  // -------------------------------------------------------------
  const update = async ({
    id,
    name,
    note,
    date,
    transactions,
  }: {
    id: number
    name?: string
    note?: string
    date: Date
    transactions: {
      amount: number
      term: string
      categoryId: number
    }[]
  }) => {
    setLoading(true)
    setError(null)

    try {
      return await db.transaction(async (tx) => {
        // 1) Gruppe selbst updaten
        await tx
          .update(transactionGroupTable)
          .set({ name, note, date })
          .where(eq(transactionGroupTable.id, id))

        // 2) Alte Transaktionen löschen
        await tx
          .delete(transactionTable)
          .where(eq(transactionTable.transactionGroupId, id))

        // 3) Neue Transaktionen anlegen
        for (const t of transactions) {
          await tx.insert(transactionTable).values({
            name: t.term,
            amount: t.amount,
            categoryTermId: t.categoryId,
            transactionGroupId: id,
            accountId: 1,
          })
        }
      })
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"))
      return null
    } finally {
      setLoading(false)
    }
  }

  // -------------------------------------------------------------
  // GET ONE GROUP
  // -------------------------------------------------------------
  const get = async ({ id }: { id: number }) => {
    setLoading(true)
    setError(null)

    try {
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
        .where(eq(transactionGroupTable.id, id))

      if (rows.length === 0) return null

      const transactions = rows.map((r) => ({
        id: r.transaction.id,
        name: r.transaction.name,
        amount: r.transaction.amount,
        categoryId: r.transaction.categoryId,
        categoryName: r.transaction.categoryName,
        categoryEmoji: r.transaction.categoryEmoji,
        categoryColor: r.transaction.categoryColor,
      }))

      return {
        ...rows[0].group,
        totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
        transactions,
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"))
      return null
    } finally {
      setLoading(false)
    }
  }

  // -------------------------------------------------------------
  // GET MANY (LIST)
  // -------------------------------------------------------------
  const getMany = async () => {
    setLoading(true)
    setError(null)

    try {
      const rows = await db
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

      if (!rows) return []

      // Grouping by date
      const grouped: Record<string, any[]> = {}

      rows.forEach((row) => {
        const dateKey = row.date.toISOString().split("T")[0]
        if (!grouped[dateKey]) grouped[dateKey] = []
        grouped[dateKey].push(row)
      })

      const result = Object.entries(grouped).map(([date, items]) => ({
        date,
        groups: items.map((it) => ({
          id: it.id,
          name: it.name,
          totalAmount: items.reduce((s, i) => s + i.amount, 0).toFixed(2),
          categoryColor: "gray",
          categoryEmoji: "❓",
        })),
      }))

      return result
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"))
      return []
    } finally {
      setLoading(false)
    }
  }

  // -------------------------------------------------------------
  // REMOVE GROUP
  // -------------------------------------------------------------
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
      setError(err instanceof Error ? err : new Error("Unknown error"))
    } finally {
      setLoading(false)
    }
  }

  return {
    create,
    update, 
    get,
    getMany,
    remove,
    error,
    loading,
  }
}
