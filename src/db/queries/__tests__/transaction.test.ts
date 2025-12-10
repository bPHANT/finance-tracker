import { beforeEach, describe, expect, it, jest } from "@jest/globals"

import { useDb } from "@/db"
import { useState } from "react"
import useTransaction from "../transaction"
import {
  createMockDb,
  createMockState,
  mockUseState,
  type MockDb,
  type MockState,
} from "./testUtils"

// Mock the dependencies
jest.mock("react", () => ({
  useState: jest.fn(),
}))

jest.mock("@/db", () => ({
  useDb: jest.fn(),
}))

describe("useTransaction", () => {
  let mockDb: MockDb
  let mockState: MockState

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()

    mockState = createMockState()
    mockUseState(useState, mockState)

    mockDb = createMockDb()
    ;(useDb as jest.MockedFunction<typeof useDb>).mockReturnValue(mockDb as any)
  })

  describe("getTotalAmount", () => {
    it("should calculate and return the total amount of all transactions", async () => {
      const mockResult = [{ totalAmount: "1234.56" }]

      mockDb.then.mockImplementation((callback: any) => {
        return callback(mockResult)
      })

      const { getTotalAmount } = useTransaction()
      const result = await getTotalAmount()

      expect(result).toBe("1234.56")
      expect(mockDb.select).toHaveBeenCalled()
      expect(mockDb.from).toHaveBeenCalled()
    })

    it("should return 0.00 when there are no transactions", async () => {
      const mockResult = [{ totalAmount: null }]

      mockDb.then.mockImplementation((callback: any) => {
        return callback(mockResult)
      })

      const { getTotalAmount } = useTransaction()
      const result = await getTotalAmount()

      expect(result).toBe("0.00")
    })

    it("should return 0.00 when result is empty", async () => {
      mockDb.then.mockImplementation((callback: any) => {
        return callback([])
      })

      const { getTotalAmount } = useTransaction()
      const result = await getTotalAmount()

      expect(result).toBe("0.00")
    })

    it("should handle negative total amounts correctly", async () => {
      const mockResult = [{ totalAmount: "-543.21" }]

      mockDb.then.mockImplementation((callback: any) => {
        return callback(mockResult)
      })

      const { getTotalAmount } = useTransaction()
      const result = await getTotalAmount()

      expect(result).toBe("-543.21")
    })

    it("should format amounts with two decimal places", async () => {
      const mockResult = [{ totalAmount: "100" }]

      mockDb.then.mockImplementation((callback: any) => {
        return callback(mockResult)
      })

      const { getTotalAmount } = useTransaction()
      const result = await getTotalAmount()

      expect(result).toBe("100.00")
    })

    it("should handle database errors gracefully", async () => {
      const mockError = new Error("Database error")

      mockDb.then.mockImplementation(() => {
        throw mockError
      })

      const { getTotalAmount } = useTransaction()
      const result = await getTotalAmount()

      expect(result).toBe("0")
      expect(mockState.setError).toHaveBeenCalledWith(mockError)
      expect(mockState.setLoading).toHaveBeenCalledWith(false)
    })
  })

  describe("getMany", () => {
    it("should retrieve all transactions with name and amount", async () => {
      const mockTransactions = [
        { name: "Grocery Shopping", amount: -50.25 },
        { name: "Salary", amount: 2000.0 },
        { name: "Coffee", amount: -4.5 },
      ]

      mockDb.then.mockImplementation((callback: any) => {
        return callback(mockTransactions)
      })

      const { getMany } = useTransaction()
      const result = await getMany()

      expect(result).toHaveLength(3)
      expect(result).toEqual(expect.arrayContaining(mockTransactions))
      expect(mockDb.select).toHaveBeenCalled()
      expect(mockDb.from).toHaveBeenCalled()
    })

    it("should return empty array when there are no transactions", async () => {
      mockDb.then.mockImplementation((callback: any) => {
        return callback([])
      })

      const { getMany } = useTransaction()
      const result = await getMany()

      expect(result).toEqual([])
    })

    it("should handle transactions with various amounts", async () => {
      const mockTransactions = [
        { name: "Zero amount", amount: 0 },
        { name: "Positive", amount: 100.5 },
        { name: "Negative", amount: -75.25 },
      ]

      mockDb.then.mockImplementation((callback: any) => {
        return callback(mockTransactions)
      })

      const { getMany } = useTransaction()
      const result = await getMany()

      expect(result).toHaveLength(3)
      const amounts = result.map((t) => t.amount)
      expect(amounts).toContain(0)
      expect(amounts).toContain(100.5)
      expect(amounts).toContain(-75.25)
    })

    it("should handle database errors gracefully", async () => {
      const mockError = new Error("Database connection failed")

      mockDb.then.mockImplementation(() => {
        throw mockError
      })

      const { getMany } = useTransaction()
      const result = await getMany()

      expect(result).toEqual([])
      expect(mockState.setError).toHaveBeenCalledWith(mockError)
      expect(mockState.setLoading).toHaveBeenCalledWith(false)
    })
  })

  describe("loading and error state", () => {
    it("should set loading state during getTotalAmount", async () => {
      const mockResult = [{ totalAmount: "100" }]

      mockDb.then.mockImplementation((callback: any) => {
        expect(mockState.setLoading).toHaveBeenCalledWith(true)
        return callback(mockResult)
      })

      const { getTotalAmount } = useTransaction()
      await getTotalAmount()

      expect(mockState.setLoading).toHaveBeenCalledWith(true)
      expect(mockState.setLoading).toHaveBeenCalledWith(false)
    })

    it("should set loading state during getMany", async () => {
      const mockTransactions = [{ name: "Test", amount: 100 }]

      mockDb.then.mockImplementation((callback: any) => {
        expect(mockState.setLoading).toHaveBeenCalledWith(true)
        return callback(mockTransactions)
      })

      const { getMany } = useTransaction()
      await getMany()

      expect(mockState.setLoading).toHaveBeenCalledWith(true)
      expect(mockState.setLoading).toHaveBeenCalledWith(false)
    })
  })
})
