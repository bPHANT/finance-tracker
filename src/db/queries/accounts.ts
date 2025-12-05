import type { CustomColorKeys } from "@/assets/colors"
import { eq } from "drizzle-orm"
import { useState } from "react"
import { useDb } from ".."
import { accountTable } from "../schemas"

export default function useAccounts() {
  const db = useDb()

  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(false)

  const get = async ({ id }: { id: number }) => {
    setLoading(true)
    setError(null)
    try {
      return db
        .select({
          id: accountTable.id,
          name: accountTable.name,
          color: accountTable.color,
          emoji: accountTable.emoji,
          balance: accountTable.balance,
        })
        .from(accountTable)
        .where(eq(accountTable.id, id))
        .limit(1)
        .then((result) => result[0])
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Unknown error occurred")
      setError(error)
      console.error("Error fetching account:", error)
      return null
    } finally {
      setLoading(false)
    }
  }

  const getMany = async () => {
    setLoading(true)
    setError(null)
    try {
      return db
        .select({
          id: accountTable.id,
          name: accountTable.name,
          color: accountTable.color,
          emoji: accountTable.emoji,
          balance: accountTable.balance,
        })
        .from(accountTable)
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Unknown error occurred")
      setError(error)
      console.error("Error fetching accounts:", error)
      return []
    } finally {
      setLoading(false)
    }
  }

  const create = async ({
    name,
    color,
    emoji,
    balance,
    currencyId = 1,
  }: {
    name: string
    color: CustomColorKeys
    emoji: string
    balance: number
    currencyId?: number
  }) => {
    setLoading(true)
    setError(null)
    try {
      const result = await db
        .insert(accountTable)
        .values({
          name,
          color,
          emoji,
          balance,
          currencyId,
        })
        .returning()

      return result[0]
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Unknown error occurred")
      setError(error)
      console.error("Error creating account:", error)
      return null
    } finally {
      setLoading(false)
    }
  }

  const update = async ({
    id,
    name,
    color,
    emoji,
    balance,
  }: {
    id: number
    name: string
    color: CustomColorKeys
    emoji: string
    balance: number
  }) => {
    setLoading(true)
    setError(null)
    try {
      const result = await db
        .update(accountTable)
        .set({
          name,
          color,
          emoji,
          balance,
        })
        .where(eq(accountTable.id, id))
        .returning()

      return result[0]
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Unknown error occurred")
      setError(error)
      console.error("Error updating account:", error)
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    get,
    getMany,
    create,
    update,
    error,
    loading,
  }
}
