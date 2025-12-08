import { calculateTotalAmount, dateFromString } from "../helper"

describe("Helper Functions", () => {
  describe("calculateTotalAmount", () => {
    it("calculates total for positive amounts", () => {
      const transactions = [
        { name: "Lunch", amount: 10.5, category: null },
        { name: "Bus", amount: 20.75, category: null },
        { name: "Snack", amount: 5.25, category: null },
      ]

      const total = calculateTotalAmount(transactions)
      expect(total).toBe("36.50")
    })

    it("calculates total for negative amounts", () => {
      const transactions = [
        { name: "Refund", amount: -10.5, category: null },
        { name: "Cashback", amount: -20.75, category: null },
      ]

      const total = calculateTotalAmount(transactions)
      expect(total).toBe("-31.25")
    })

    it("calculates total for mixed positive and negative amounts", () => {
      const transactions = [
        { name: "Groceries", amount: 50.0, category: null },
        { name: "Refund", amount: -10.0, category: null },
        { name: "Transport", amount: 25.5, category: null },
      ]

      const total = calculateTotalAmount(transactions)
      expect(total).toBe("65.50")
    })

    it("returns 0.00 for empty transactions array", () => {
      const total = calculateTotalAmount([])
      expect(total).toBe("0.00")
    })

    it("formats result with 2 decimal places", () => {
      const transactions = [
        { name: "Food", amount: 10.1, category: null },
        { name: "Transport", amount: 20, category: null },
      ]

      const total = calculateTotalAmount(transactions)
      expect(total).toBe("30.10")
    })
  })

  describe("dateFromString", () => {
    it("converts valid date string to Date object", async () => {
      const dateString = "2025-12-07"
      const result = await dateFromString(dateString)

      expect(result).toBeInstanceOf(Date)
      expect(result.getFullYear()).toBe(2025)
      expect(result.getMonth()).toBe(11) // December is month 11
      expect(result.getDate()).toBe(7)
    })

    it("returns current date when no value provided", async () => {
      const before = new Date()
      const result = await dateFromString()
      const after = new Date()

      expect(result).toBeInstanceOf(Date)
      expect(result.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(result.getTime()).toBeLessThanOrEqual(after.getTime())
    })

    it("returns current date when undefined is passed", async () => {
      const before = new Date()
      const result = await dateFromString(undefined)
      const after = new Date()

      expect(result).toBeInstanceOf(Date)
      expect(result.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(result.getTime()).toBeLessThanOrEqual(after.getTime())
    })

    it("handles ISO date strings", async () => {
      const isoString = "2025-12-07T10:30:00.000Z"
      const result = await dateFromString(isoString)

      expect(result).toBeInstanceOf(Date)
      expect(result.toISOString()).toBe(isoString)
    })
  })
})
