import { eq } from "drizzle-orm"
import { useState } from "react"
import { useDb } from ".."
import { accountTable } from "../schemas"

export default function useAccounts() {
  const db = useDb()

  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(false)

  const get = async () => {
    setLoading(true)
    setError(null)
    try {
      return db
        .select()
        .from(accountTable)
        .where(eq(accountTable.name, "Default"))
        .limit(1)
        .then((result) => result[0].name)
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Unknown error occurred")
      setError(error)
      console.error("Error fetching categories:", error)
      return null
    } finally {
      setLoading(false)
    }
  }
  return {
    get,
    error,
    loading,
  }
}
