import { useCallback } from "react"
import useTransactionGroup from "@/db/queries/transactionGroup"

export function useTransactionFilter() {
  const { getMany } = useTransactionGroup()

  /**
   * Loads all transaction groups from DB
   */
  const loadAll = useCallback(async () => {
    const result = await getMany()

    return result.map((item) => ({
      date: new Date(item.date),
      groups: item.groups,
    }))
  }, [getMany])

  /**
   * Returns all available month-year combinations based on DB entries.
   * Example output:
   *   [{ year: 2024, month: 0 }, { year: 2024, month: 2 }, { year: 2025, month: 1 }]
   */
  const getAvailableMonthsYears = useCallback(async () => {
    const all = await loadAll()

    const set = new Set<string>() // Format: "2024-02"

    all.forEach((item) => {
      const d = item.date
      const year = d.getFullYear()
      const month = d.getMonth() // 0–11
      set.add(`${year}-${month}`)
    })

    return Array.from(set)
      .map((entry) => {
        const [y, m] = entry.split("-").map(Number)
        return { year: y, month: m }
      })
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year
        return a.month - b.month
      })
  }, [loadAll])

  /**
   * Filters allData by selected year+month
   */
  const applyFilter = useCallback(
    (allData: any[], year: number | null, month: number | null) => {
      return allData.filter((item) => {
        const d = item.date
        const y = d.getFullYear()
        const m = d.getMonth()

        if (year !== null && y !== year) return false
        if (month !== null && m !== month) return false

        return true
      })
    },
    []
  )

  return {
    loadAll,
    getAvailableMonthsYears,
    applyFilter,
  }
}
