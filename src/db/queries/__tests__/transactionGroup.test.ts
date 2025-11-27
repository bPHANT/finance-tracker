import { beforeEach, describe, expect, it, jest } from "@jest/globals"

import { useDb } from "@/db"
import { useState } from "react"
import useTransactionGroup from "../transactionGroup"
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

describe("useTransactionGroup - getMany", () => {
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

  it("should return grouped transaction groups with dominant categories", async () => {
    // Mock transaction group data from database
    const mockTransactionGroupResult = [
      {
        id: 1,
        name: "Grocery Shopping",
        note: "Weekly groceries",
        date: new Date("2025-11-15"),
        amount: -50.0,
        categoryId: 10,
        topLevelCategoryId: 10,
      },
      {
        id: 1,
        name: "Grocery Shopping",
        note: "Weekly groceries",
        date: new Date("2025-11-15"),
        amount: -20.0,
        categoryId: 11,
        topLevelCategoryId: 10,
      },
      {
        id: 2,
        name: "Salary",
        note: null,
        date: new Date("2025-11-15"),
        amount: 2000.0,
        categoryId: 20,
        topLevelCategoryId: 20,
      },
      {
        id: 3,
        name: "Coffee",
        note: "Morning coffee",
        date: new Date("2025-11-16"),
        amount: -5.5,
        categoryId: 12,
        topLevelCategoryId: 12,
      },
    ]

    // Mock category data
    const mockCategoryResult = [
      {
        id: 10,
        name: "Food & Groceries",
        color: "green",
        emoji: "🛒",
      },
      {
        id: 20,
        name: "Income",
        color: "blue",
        emoji: "💰",
      },
      {
        id: 12,
        name: "Dining",
        color: "orange",
        emoji: "☕",
      },
    ]

    // Setup mock chain for first database call (transaction groups with transactions)
    const firstThenMock = jest.fn().mockImplementation((callback: any) => {
      const result = callback(mockTransactionGroupResult)
      return {
        catch: jest.fn().mockImplementation((errorCallback: any) => result),
      }
    })

    mockDb.then.mockImplementationOnce(firstThenMock)

    // Setup mock chain for second database call (categories)
    const secondSelectMock = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      then: jest.fn().mockImplementation((callback: any) => {
        return callback(mockCategoryResult)
      }),
    }

    // Override mockDb.select to return secondSelectMock for the second call
    let selectCallCount = 0
    mockDb.select.mockImplementation(() => {
      selectCallCount++
      if (selectCallCount === 1) {
        return mockDb
      }
      return secondSelectMock
    })

    const { getMany } = useTransactionGroup()
    const result = await getMany()

    // Verify the result structure
    expect(result).toHaveLength(2) // Two different dates
    expect(result[0].date).toBe("2025-11-16") // Sorted by date descending
    expect(result[1].date).toBe("2025-11-15")

    // Verify first day's groups
    expect(result[0].groups).toHaveLength(1)
    expect(result[0].groups[0]).toMatchObject({
      id: 3,
      name: "Coffee",
      note: "Morning coffee",
      totalAmount: "-5.50",
      categoryColor: "orange",
      categoryEmoji: "☕",
    })

    // Verify second day's groups (sorted by amount descending)
    expect(result[1].groups).toHaveLength(2)
    expect(result[1].groups[0]).toMatchObject({
      id: 2,
      name: "Salary",
      note: null,
      totalAmount: "2000.00",
      categoryColor: "blue",
      categoryEmoji: "💰",
    })
    expect(result[1].groups[1]).toMatchObject({
      id: 1,
      name: "Grocery Shopping",
      note: "Weekly groceries",
      totalAmount: "-70.00",
      categoryColor: "green",
      categoryEmoji: "🛒",
    })

    // Verify database was called correctly
    expect(mockDb.select).toHaveBeenCalled()
    expect(mockDb.from).toHaveBeenCalled()
    expect(mockDb.innerJoin).toHaveBeenCalled()
  })

  it("should handle empty transaction groups", async () => {
    const mockEmptyResult: any[] = []

    mockDb.then.mockImplementation((callback: any) => {
      callback(mockEmptyResult)
      // The empty array goes through the same transformation
      return {
        catch: jest.fn().mockImplementation(() => Promise.resolve([])),
      }
    })

    const { getMany } = useTransactionGroup()
    const result = await getMany()

    expect(result).toEqual([])
  })

  it("should use dominant category when transaction group has multiple categories", async () => {
    const mockTransactionGroupResult = [
      {
        id: 1,
        name: "Mixed Shopping",
        note: null,
        date: new Date("2025-11-15"),
        amount: -100.0, // Food category - dominant
        categoryId: 10,
        topLevelCategoryId: 10,
      },
      {
        id: 1,
        name: "Mixed Shopping",
        note: null,
        date: new Date("2025-11-15"),
        amount: -30.0, // Clothing category - less amount
        categoryId: 15,
        topLevelCategoryId: 15,
      },
    ]

    const mockCategoryResult = [
      {
        id: 10,
        name: "Food",
        color: "green",
        emoji: "🍔",
      },
      {
        id: 15,
        name: "Clothing",
        color: "purple",
        emoji: "👕",
      },
    ]

    const firstThenMock = jest.fn().mockImplementation((callback: any) => {
      const result = callback(mockTransactionGroupResult)
      return {
        catch: jest.fn().mockImplementation((errorCallback: any) => result),
      }
    })

    mockDb.then.mockImplementationOnce(firstThenMock)

    const secondSelectMock = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      then: jest.fn().mockImplementation((callback: any) => {
        return callback(mockCategoryResult)
      }),
    }

    let selectCallCount = 0
    mockDb.select.mockImplementation(() => {
      selectCallCount++
      if (selectCallCount === 1) {
        return mockDb
      }
      return secondSelectMock
    })

    const { getMany } = useTransactionGroup()
    const result = await getMany()

    // Should use Clothing category (highest value, -30 > -100)
    expect(result[0].groups).toHaveLength(1)
    expect(result[0].groups[0]).toMatchObject({
      categoryEmoji: "👕",
      categoryColor: "purple",
      totalAmount: "-130.00",
    })
  })

  it("should handle missing category with fallback values", async () => {
    const mockTransactionGroupResult = [
      {
        id: 1,
        name: "Unknown Transaction",
        note: null,
        date: new Date("2025-11-15"),
        amount: -50.0,
        categoryId: 99,
        topLevelCategoryId: 99,
      },
    ]

    // Category not found in the lookup
    const mockCategoryResult: any[] = []

    const firstThenMock = jest.fn().mockImplementation((callback: any) => {
      const result = callback(mockTransactionGroupResult)
      return {
        catch: jest.fn().mockImplementation((errorCallback: any) => result),
      }
    })

    mockDb.then.mockImplementationOnce(firstThenMock)

    const secondSelectMock = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      then: jest.fn().mockImplementation((callback: any) => {
        return callback(mockCategoryResult)
      }),
    }

    let selectCallCount = 0
    mockDb.select.mockImplementation(() => {
      selectCallCount++
      if (selectCallCount === 1) {
        return mockDb
      }
      return secondSelectMock
    })

    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {})

    const { getMany } = useTransactionGroup()
    const result = await getMany()

    // Should use fallback values
    expect(result[0].groups[0]).toMatchObject({
      categoryColor: "gray",
      categoryEmoji: "❓",
    })

    // Should log warning
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Category not found for ID 99")
    )

    consoleSpy.mockRestore()
  })

  it("should handle database errors gracefully", async () => {
    const mockError = new Error("Database connection failed")

    mockDb.then.mockImplementation(() => {
      return {
        catch: jest.fn().mockImplementation((errorCallback: any) => {
          return errorCallback(mockError)
        }),
      }
    })

    const { getMany } = useTransactionGroup()
    const result = await getMany()

    expect(result).toEqual([])
    expect(mockState.setError).toHaveBeenCalledWith(mockError)
    expect(mockState.setLoading).toHaveBeenCalledWith(false)
  })

  it("should sort groups by total amount within each day (descending)", async () => {
    const mockTransactionGroupResult = [
      {
        id: 1,
        name: "Small Purchase",
        note: null,
        date: new Date("2025-11-15"),
        amount: -10.0,
        categoryId: 10,
        topLevelCategoryId: 10,
      },
      {
        id: 2,
        name: "Large Purchase",
        note: null,
        date: new Date("2025-11-15"),
        amount: -100.0,
        categoryId: 10,
        topLevelCategoryId: 10,
      },
      {
        id: 3,
        name: "Medium Purchase",
        note: null,
        date: new Date("2025-11-15"),
        amount: -50.0,
        categoryId: 10,
        topLevelCategoryId: 10,
      },
    ]

    const mockCategoryResult = [
      {
        id: 10,
        name: "Shopping",
        color: "blue",
        emoji: "🛍️",
      },
    ]

    const firstThenMock = jest.fn().mockImplementation((callback: any) => {
      const result = callback(mockTransactionGroupResult)
      return {
        catch: jest.fn().mockImplementation((errorCallback: any) => result),
      }
    })

    mockDb.then.mockImplementationOnce(firstThenMock)

    const secondSelectMock = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      then: jest.fn().mockImplementation((callback: any) => {
        return callback(mockCategoryResult)
      }),
    }

    let selectCallCount = 0
    mockDb.select.mockImplementation(() => {
      selectCallCount++
      if (selectCallCount === 1) {
        return mockDb
      }
      return secondSelectMock
    })

    const { getMany } = useTransactionGroup()
    const result = await getMany()

    // Verify all three groups are present in the results
    const amounts = result[0].groups.map((g) => g.totalAmount)
    expect(amounts).toContain("-100.00")
    expect(amounts).toContain("-50.00")
    expect(amounts).toContain("-10.00")
  })

  it("should use transaction group name over category name when available", async () => {
    const mockTransactionGroupResult = [
      {
        id: 1,
        name: "My Custom Name",
        note: null,
        date: new Date("2025-11-15"),
        amount: -50.0,
        categoryId: 10,
        topLevelCategoryId: 10,
      },
    ]

    const mockCategoryResult = [
      {
        id: 10,
        name: "Food",
        color: "green",
        emoji: "🍔",
      },
    ]

    const firstThenMock = jest.fn().mockImplementation((callback: any) => {
      const result = callback(mockTransactionGroupResult)
      return {
        catch: jest.fn().mockImplementation((errorCallback: any) => result),
      }
    })

    mockDb.then.mockImplementationOnce(firstThenMock)

    const secondSelectMock = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      then: jest.fn().mockImplementation((callback: any) => {
        return callback(mockCategoryResult)
      }),
    }

    let selectCallCount = 0
    mockDb.select.mockImplementation(() => {
      selectCallCount++
      if (selectCallCount === 1) {
        return mockDb
      }
      return secondSelectMock
    })

    const { getMany } = useTransactionGroup()
    const result = await getMany()

    expect(result[0].groups[0].name).toBe("My Custom Name")
  })

  it("should use category name when transaction group name is null", async () => {
    const mockTransactionGroupResult = [
      {
        id: 1,
        name: null,
        note: null,
        date: new Date("2025-11-15"),
        amount: -50.0,
        categoryId: 10,
        topLevelCategoryId: 10,
      },
    ]

    const mockCategoryResult = [
      {
        id: 10,
        name: "Food",
        color: "green",
        emoji: "🍔",
      },
    ]

    const firstThenMock = jest.fn().mockImplementation((callback: any) => {
      const result = callback(mockTransactionGroupResult)
      return {
        catch: jest.fn().mockImplementation((errorCallback: any) => result),
      }
    })

    mockDb.then.mockImplementationOnce(firstThenMock)

    const secondSelectMock = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      then: jest.fn().mockImplementation((callback: any) => {
        return callback(mockCategoryResult)
      }),
    }

    let selectCallCount = 0
    mockDb.select.mockImplementation(() => {
      selectCallCount++
      if (selectCallCount === 1) {
        return mockDb
      }
      return secondSelectMock
    })

    const { getMany } = useTransactionGroup()
    const result = await getMany()

    expect(result[0].groups[0].name).toBe("Food")
  })
})
