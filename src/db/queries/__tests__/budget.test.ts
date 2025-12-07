import { useDb } from "@/db"
import { beforeEach, describe, expect, it, jest } from "@jest/globals"
import { useState } from "react"
import useBudget from "../budget"
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

describe("useBudget", () => {
  let mockDb: MockDb
  let mockState: MockState

  beforeEach(() => {
    jest.clearAllMocks()
    mockState = createMockState()
    mockUseState(useState, mockState)
    mockDb = createMockDb()
    ;(useDb as jest.MockedFunction<typeof useDb>).mockReturnValue(mockDb as any)
  })

  describe("create", () => {
    it("should create a budget successfully", async () => {
      const mockBudget: any = {
        id: 1,
        name: "Food Budget",
        amount: 500,
        start: Date.now(),
        end: null,
        period: "monthly",
        color: "#FF5733",
        emoji: "🍔",
      }

      const mockTx = createMockDb()
      const mockInsertChain: any = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockReturnValue(Promise.resolve([mockBudget])),
      }
      mockTx.insert.mockReturnValue(mockInsertChain)

      mockDb.transaction.mockImplementation(async (callback: any) => {
        return await callback(mockTx)
      })

      const { create } = useBudget()
      const result = await create({
        name: "Food Budget",
        amount: 500,
        start: mockBudget.start,
        end: null,
        period: "monthly",
        color: "#FF5733",
        emoji: "🍔",
        categoryIds: [1, 2],
      })

      expect(result).toEqual(mockBudget)
      expect(mockDb.transaction).toHaveBeenCalled()
      expect(mockState.setLoading).toHaveBeenCalledWith(true)
      expect(mockState.setLoading).toHaveBeenCalledWith(false)
    })

    it("should handle errors during creation", async () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {})
      ;(mockDb.transaction as any).mockRejectedValue(
        new Error("Database error")
      )

      const { create } = useBudget()
      const result = await create({
        name: "Test Budget",
        amount: 100,
        start: Date.now(),
        end: null,
        period: "monthly",
        color: "#000000",
        emoji: "💰",
        categoryIds: [],
      })

      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error creating budget:",
        expect.any(Error)
      )
      expect(mockState.setError).toHaveBeenCalledWith(expect.any(Error))
      consoleSpy.mockRestore()
    })

    it("should create budget with category links", async () => {
      const mockBudget: any = {
        id: 1,
        name: "Test",
        amount: 100,
        start: Date.now(),
        end: null,
        period: "monthly",
        color: "#000000",
        emoji: "💰",
      }

      const mockTx = createMockDb()
      const mockInsertChain: any = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockReturnValue(Promise.resolve([mockBudget])),
      }
      mockTx.insert.mockReturnValue(mockInsertChain)

      mockDb.transaction.mockImplementation(async (callback: any) => {
        return await callback(mockTx)
      })

      const { create } = useBudget()
      await create({
        name: "Test",
        amount: 100,
        start: mockBudget.start,
        end: null,
        period: "monthly",
        color: "#000000",
        emoji: "💰",
        categoryIds: [1, 2, 3],
      })

      expect(mockTx.insert).toHaveBeenCalledTimes(2)
    })
  })

  describe("get", () => {
    it("should return null if budget not found", async () => {
      mockDb.then.mockImplementation((callback: any) => {
        return callback([])
      })

      const { get } = useBudget()
      const result = await get(999)

      expect(result).toBeNull()
    })

    it("should handle errors during fetch", async () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {})
      mockDb.then.mockImplementation(() => {
        throw new Error("Database error")
      })

      const { get } = useBudget()
      const result = await get(1)

      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error fetching budget:",
        expect.any(Error)
      )
      consoleSpy.mockRestore()
    })
  })

  describe("getMany", () => {
    it("should return empty array when no budgets found", async () => {
      mockDb.then.mockImplementation((callback: any) => {
        return callback([])
      })

      const { getMany } = useBudget()
      const result = await getMany({ year: 2024, month: 1 })

      expect(result).toEqual([])
    })

    it("should handle errors during getMany", async () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {})
      mockDb.then.mockImplementation(() => {
        throw new Error("Database error")
      })

      const { getMany } = useBudget()
      const result = await getMany({ year: 2024, month: 1 })

      expect(result).toEqual([])
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error fetching budgets:",
        expect.any(Error)
      )
      consoleSpy.mockRestore()
    })
  })

  describe("remove", () => {
    it("should delete a budget successfully", async () => {
      const mockTx = createMockDb()
      const mockDeleteChain: any = {
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockReturnValue(Promise.resolve([{ id: 1 }])),
      }
      mockTx.delete.mockReturnValue(mockDeleteChain)

      mockDb.transaction.mockImplementation(async (callback: any) => {
        return await callback(mockTx)
      })

      const { remove } = useBudget()
      const result = await remove(1)

      expect(result).toBe(true)
      expect(mockTx.delete).toHaveBeenCalledTimes(2)
    })

    it("should return false if budget not found", async () => {
      const mockTx = createMockDb()
      const mockDeleteChain: any = {
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockReturnValue(Promise.resolve([])),
      }
      mockTx.delete.mockReturnValue(mockDeleteChain)

      mockDb.transaction.mockImplementation(async (callback: any) => {
        return await callback(mockTx)
      })

      const { remove } = useBudget()
      const result = await remove(999)

      expect(result).toBe(false)
    })

    it("should handle errors during deletion", async () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {})
      ;(mockDb.transaction as any).mockRejectedValue(
        new Error("Database error")
      )

      const { remove } = useBudget()
      const result = await remove(1)

      expect(result).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error deleting budget:",
        expect.any(Error)
      )
      consoleSpy.mockRestore()
    })
  })

  describe("update", () => {
    it("should update a budget successfully", async () => {
      const mockUpdatedBudget: any = {
        id: 1,
        name: "Updated Budget",
        amount: 600,
        start: Date.now(),
        end: null,
        period: "monthly",
        color: "#0000FF",
        emoji: "💸",
      }

      const mockTx = createMockDb()

      // Mock the update chain
      const mockUpdateChain: any = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest
          .fn()
          .mockReturnValue(Promise.resolve([mockUpdatedBudget])),
      }
      mockTx.update.mockReturnValue(mockUpdateChain as any)

      // Mock the delete chain
      const mockDeleteChain: any = {
        where: jest.fn().mockReturnValue(Promise.resolve()),
      }
      mockTx.delete.mockReturnValue(mockDeleteChain as any)

      // Mock the insert chain
      const mockInsertChain: any = {
        values: jest.fn().mockReturnValue(Promise.resolve()),
      }
      mockTx.insert.mockReturnValue(mockInsertChain as any)

      mockDb.transaction.mockImplementation(async (callback: any) => {
        return await callback(mockTx)
      })

      const { update } = useBudget()
      const result = await update({
        id: 1,
        name: "Updated Budget",
        amount: 600,
        start: mockUpdatedBudget.start,
        end: null,
        period: "monthly",
        color: "#0000FF",
        emoji: "💸",
        categoryIds: [1, 2],
      })

      expect(result).toEqual(mockUpdatedBudget)
      expect(mockTx.update).toHaveBeenCalled()
      expect(mockTx.delete).toHaveBeenCalled()
      expect(mockTx.insert).toHaveBeenCalled()
    })

    it("should handle errors during update", async () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {})
      ;(mockDb.transaction as any).mockRejectedValue(
        new Error("Database error")
      )

      const { update } = useBudget()
      const result = await update({
        id: 1,
        name: "Test",
        amount: 100,
        start: Date.now(),
        end: null,
        period: "monthly",
        color: "#000000",
        emoji: "💰",
        categoryIds: [],
      })

      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error updating budget:",
        expect.any(Error)
      )
      consoleSpy.mockRestore()
    })
  })
})
