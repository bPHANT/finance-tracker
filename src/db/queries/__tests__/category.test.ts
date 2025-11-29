import { beforeEach, describe, expect, it, jest } from "@jest/globals"

import { useDb } from "@/db"
import { useState } from "react"
import useCategory from "../category"
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

describe("useCategory", () => {
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

  describe("get", () => {
    it("should retrieve a category by id", async () => {
      const mockCategory = {
        id: 1,
        name: "Food",
        color: "green",
        emoji: "🍔",
      }

      mockDb.then.mockImplementation((callback: any) => {
        return callback([mockCategory])
      })

      const { get } = useCategory()
      const result = await get({ id: 1 })

      expect(result).toEqual(mockCategory)
      expect(mockDb.select).toHaveBeenCalled()
      expect(mockDb.from).toHaveBeenCalled()
      expect(mockDb.where).toHaveBeenCalled()
      expect(mockDb.limit).toHaveBeenCalled()
    })

    it("should return null when category is not found", async () => {
      mockDb.then.mockImplementation((callback: any) => {
        return callback([])
      })

      const { get } = useCategory()
      const result = await get({ id: 999 })

      expect(result).toBeNull()
    })

    it("should handle database errors gracefully", async () => {
      const mockError = new Error("Database error")
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {})

      mockDb.then.mockImplementation(() => {
        throw mockError
      })

      const { get } = useCategory()
      const result = await get({ id: 1 })

      expect(result).toBeNull()
      expect(mockState.setError).toHaveBeenCalledWith(mockError)
      expect(mockState.setLoading).toHaveBeenCalledWith(false)
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error fetching category:",
        mockError
      )

      consoleSpy.mockRestore()
    })
  })

  describe("getWithParent", () => {
    it("should retrieve a category with its parent", async () => {
      const mockResult = {
        id: 2,
        name: "Groceries",
        color: "green",
        emoji: "🛒",
        parent: {
          id: 1,
          name: "Food",
          color: "green",
          emoji: "🍔",
        },
      }

      mockDb.then.mockImplementation((callback: any) => {
        return callback([mockResult])
      })

      const { getWithParent } = useCategory()
      const result = await getWithParent({ id: 2 })

      expect(result).toEqual(mockResult)
      expect(mockDb.select).toHaveBeenCalled()
      expect(mockDb.from).toHaveBeenCalled()
      expect(mockDb.leftJoin).toHaveBeenCalled()
      expect(mockDb.where).toHaveBeenCalled()
      expect(mockDb.limit).toHaveBeenCalled()
    })

    it("should return null when category is not found", async () => {
      mockDb.then.mockImplementation((callback: any) => {
        return callback([])
      })

      const { getWithParent } = useCategory()
      const result = await getWithParent({ id: 999 })

      expect(result).toBeNull()
    })

    it("should handle database errors gracefully", async () => {
      const mockError = new Error("Database error")
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {})

      mockDb.then.mockImplementation(() => {
        throw mockError
      })

      const { getWithParent } = useCategory()
      const result = await getWithParent({ id: 1 })

      expect(result).toBeNull()
      expect(mockState.setError).toHaveBeenCalledWith(mockError)
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error fetching category:",
        mockError
      )

      consoleSpy.mockRestore()
    })
  })

  describe("getMany", () => {
    it("should retrieve multiple categories by ids", async () => {
      const mockCategories = [
        { id: 1, name: "Food", color: "green", emoji: "🍔" },
        { id: 2, name: "Transport", color: "blue", emoji: "🚗" },
        { id: 3, name: "Entertainment", color: "purple", emoji: "🎮" },
      ]

      mockDb.then.mockImplementation((callback: any) => {
        return callback(mockCategories)
      })

      const { getMany } = useCategory()
      const result = await getMany({ ids: [1, 2, 3] })

      expect(result).toHaveLength(3)
      expect(result).toEqual(expect.arrayContaining(mockCategories))
    })

    it("should return empty array when ids array is empty", async () => {
      const { getMany } = useCategory()
      const result = await getMany({ ids: [] })

      expect(result).toEqual([])
      expect(mockDb.select).not.toHaveBeenCalled()
    })

    it("should handle database errors gracefully", async () => {
      const mockError = new Error("Database error")
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {})

      mockDb.then.mockImplementation(() => {
        throw mockError
      })

      const { getMany } = useCategory()
      const result = await getMany({ ids: [1, 2] })

      expect(result).toEqual([])
      expect(mockState.setError).toHaveBeenCalledWith(mockError)
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error fetching categories:",
        mockError
      )

      consoleSpy.mockRestore()
    })
  })

  describe("getManyAsJson", () => {
    it("should retrieve categories in nested JSON structure", async () => {
      const mockCategories = [
        { id: 1, name: "Food", parentCategoryId: null },
        { id: 2, name: "Groceries", parentCategoryId: 1 },
        { id: 3, name: "Dining", parentCategoryId: 1 },
        { id: 4, name: "Transport", parentCategoryId: null },
      ]

      mockDb.then.mockImplementation((callback: any) => {
        return callback(mockCategories)
      })

      const { getManyAsJson } = useCategory()
      const result = await getManyAsJson()

      expect(result).toHaveLength(2) // Two top-level categories

      const foodCategory = result?.find((c) => c.name === "Food")
      expect(foodCategory).toBeDefined()
      expect(foodCategory?.children).toHaveLength(2)
      expect(foodCategory?.children?.map((c) => c.name)).toContain("Groceries")
      expect(foodCategory?.children?.map((c) => c.name)).toContain("Dining")

      const transportCategory = result?.find((c) => c.name === "Transport")
      expect(transportCategory).toBeDefined()
      expect(transportCategory?.children).toBeUndefined()
    })

    it("should handle empty categories", async () => {
      mockDb.then.mockImplementation((callback: any) => {
        return callback([])
      })

      const { getManyAsJson } = useCategory()
      const result = await getManyAsJson()

      expect(result).toEqual([])
    })

    it("should handle database errors gracefully", async () => {
      const mockError = new Error("Database error")
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {})

      mockDb.then.mockImplementation(() => {
        throw mockError
      })

      const { getManyAsJson } = useCategory()
      const result = await getManyAsJson()

      expect(result).toBeNull()
      expect(mockState.setError).toHaveBeenCalledWith(mockError)
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error fetching categories as json:",
        mockError
      )

      consoleSpy.mockRestore()
    })
  })

  describe("getByParentId", () => {
    it("should retrieve categories by parent id", async () => {
      const mockCategories = [
        {
          id: 2,
          name: "Groceries",
          color: "green",
          emoji: "🛒",
          parentCategoryId: 1,
        },
        {
          id: 3,
          name: "Dining",
          color: "orange",
          emoji: "🍽️",
          parentCategoryId: 1,
        },
      ]

      mockDb.then.mockImplementation((callback: any) => {
        return callback(mockCategories)
      })

      const { getByParentId } = useCategory()
      const result = await getByParentId({ parentId: 1 })

      expect(result).toHaveLength(2)
      expect(result).toEqual(expect.arrayContaining(mockCategories))
    })

    it("should retrieve top-level categories when parentId is null", async () => {
      const mockCategories = [
        {
          id: 1,
          name: "Food",
          color: "green",
          emoji: "🍔",
          parentCategoryId: null,
        },
        {
          id: 4,
          name: "Transport",
          color: "blue",
          emoji: "🚗",
          parentCategoryId: null,
        },
      ]

      mockDb.then.mockImplementation((callback: any) => {
        return callback(mockCategories)
      })

      const { getByParentId } = useCategory()
      const result = await getByParentId({ parentId: null })

      expect(result).toHaveLength(2)
      expect(result.map((c) => c.name)).toContain("Food")
      expect(result.map((c) => c.name)).toContain("Transport")
    })

    it("should handle database errors gracefully", async () => {
      const mockError = new Error("Database error")
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {})

      mockDb.then.mockImplementation(() => {
        throw mockError
      })

      const { getByParentId } = useCategory()
      const result = await getByParentId({ parentId: 1 })

      expect(result).toEqual([])
      expect(mockState.setError).toHaveBeenCalledWith(mockError)
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error fetching categories by parent ID:",
        mockError
      )

      consoleSpy.mockRestore()
    })
  })

  describe("hasChildren", () => {
    it("should return true when category has children", async () => {
      mockDb.then.mockImplementation((callback: any) => {
        return callback([{ id: 2 }])
      })

      const { hasChildren } = useCategory()
      const result = await hasChildren({ categoryId: 1 })

      expect(result).toBe(true)
      expect(mockDb.select).toHaveBeenCalled()
      expect(mockDb.from).toHaveBeenCalled()
      expect(mockDb.where).toHaveBeenCalled()
      expect(mockDb.limit).toHaveBeenCalled()
    })

    it("should return false when category has no children", async () => {
      mockDb.then.mockImplementation((callback: any) => {
        return callback([])
      })

      const { hasChildren } = useCategory()
      const result = await hasChildren({ categoryId: 1 })

      expect(result).toBe(false)
    })

    it("should handle database errors gracefully", async () => {
      const mockError = new Error("Database error")
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {})

      mockDb.then.mockImplementation(() => {
        throw mockError
      })

      const { hasChildren } = useCategory()
      const result = await hasChildren({ categoryId: 1 })

      expect(result).toBe(false)
      expect(mockState.setError).toHaveBeenCalledWith(mockError)
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error checking if category has children:",
        mockError
      )

      consoleSpy.mockRestore()
    })
  })
})
