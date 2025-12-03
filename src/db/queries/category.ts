import { CustomColorKeys } from "@/assets/colors"
import { and, eq, inArray, isNull } from "drizzle-orm"
import { alias } from "drizzle-orm/sqlite-core"
import { useState } from "react"
import { useDb } from ".."
import { categoryTable } from "../schemas/categories"
import { categoryTermTable } from "../schemas/categoryTerms"


type CategoryWithChildren = {
  id: number
  name: string
  children?: CategoryWithChildren[]
}

export default function useCategory() {
  const db = useDb()

  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(false)

  const create = async ({
    name,
    color,
    emoji,
    parentCategoryId,
  }: {
    name: string
    color: CustomColorKeys
    emoji: string
    parentCategoryId?: number | null
  }) => {
    setLoading(true)
    setError(null)

    try {
      const categoryResult = await db
        .insert(categoryTable)
        .values({
          name,
          color,
          emoji,
          parentCategoryId,
        })
        .returning()
      await db.insert(categoryTermTable).values({
        term: name,
        categoryId: categoryResult[0].id,
      })
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Unknown error occurred")
      setError(error)
      console.error("Error creating category:", error)
      return "0"
    } finally {
      setLoading(false)
    }
  }

  const update = async ({
    id,
    name,
    color,
    emoji,
    parentCategoryId,
  }: {
    id: number
    name: string
    color: CustomColorKeys
    emoji: string
    parentCategoryId?: number | null
  }) => {
    setLoading(true)
    setError(null)

    try {
      const categoryResult = await db
        .update(categoryTable)
        .set({
          name,
          color,
          emoji,
          parentCategoryId,
        })
        .where(eq(categoryTable.id, id))
        .returning()

      const updatedCategory = categoryResult[0]
      const existing = await db
        .select()
        .from(categoryTermTable)
        .where(
          and(
            eq(categoryTermTable.term, name),
            eq(categoryTermTable.categoryId, updatedCategory.id)
          )
        )
        .limit(1)

      if (existing.length === 0) {
        await db.insert(categoryTermTable).values({
          term: name,
          categoryId: updatedCategory.id,
        })
      }
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Unknown error occurred")
      setError(error)
      console.error("Error updaing category:", error)
      return "0"
    } finally {
      setLoading(false)
    }
  }

  const get = async ({ id }: { id: number }) => {
    setLoading(true)
    setError(null)
    try {
      const result = await db
        .select({
          id: categoryTable.id,
          name: categoryTable.name,
          color: categoryTable.color,
          emoji: categoryTable.emoji,
        })
        .from(categoryTable)
        .where(eq(categoryTable.id, id))
        .limit(1)

      return result[0] ?? null
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Unknown error occurred")
      setError(error)
      console.error("Error fetching category:", error)
      return null
    } finally {
      setLoading(false)
    }
  }

  const getWithParent = async ({ id }: { id: number }) => {
    setLoading(true)
    setError(null)
    try {
      const parentCategory = alias(categoryTable, "parentCategory")
      const result = await db
        .select({
          id: categoryTable.id,
          name: categoryTable.name,
          color: categoryTable.color,
          emoji: categoryTable.emoji,
          parent: {
            id: parentCategory.id,
            name: parentCategory.name,
            color: parentCategory.color,
            emoji: parentCategory.emoji,
          },
        })
        .from(categoryTable)
        .leftJoin(
          parentCategory,
          eq(categoryTable.parentCategoryId, parentCategory.id)
        )
        .where(eq(categoryTable.id, id))
        .limit(1)

      return result[0] ?? null
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Unknown error occurred")
      setError(error)
      console.error("Error fetching category:", error)
      return null
    } finally {
      setLoading(false)
    }
  }

  const getMany = async ({ ids }: { ids: number[] }) => {
    setLoading(true)
    setError(null)
    try {
      if (!ids || ids.length === 0) {
        return []
      }

      const categoryResult = await db
        .select({
          id: categoryTable.id,
          name: categoryTable.name,
          color: categoryTable.color,
          emoji: categoryTable.emoji,
        })
        .from(categoryTable)
        .where(inArray(categoryTable.id, ids))
      return categoryResult ?? []
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Unknown error occurred")
      setError(error)
      console.error("Error fetching categories:", error)
      return []
    } finally {
      setLoading(false)
    }
  }

  const getManyAsJson = async () => {
    setLoading(true)
    setError(null)
    try {
      const allCategories = await db.select().from(categoryTable)
      const buildNestedStructure = (
        parentId: number | null
      ): CategoryWithChildren[] | undefined => {
        const children = allCategories.filter(
          (category) => category.parentCategoryId === parentId
        )

        if (children.length === 0) return

        return children.map((category) => {
          return {
            id: category.id,
            name: category.name,
            children: buildNestedStructure(category.id),
          }
        })
      }

      return allCategories
        .filter((category) => category.parentCategoryId === null)
        .map((category) => ({
          id: category.id,
          name: category.name,
          children: buildNestedStructure(category.id),
        }))
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Unknown error occurred")
      setError(error)
      console.error("Error fetching categories as json:", error)
      return null
    } finally {
      setLoading(false)
    }
  }

  const getByParentId = async ({ parentId }: { parentId?: number | null }) => {
    setLoading(true)
    setError(null)
    try {
      const categoryResult = await db
        .select({
          id: categoryTable.id,
          name: categoryTable.name,
          color: categoryTable.color,
          emoji: categoryTable.emoji,
          parentCategoryId: categoryTable.parentCategoryId,
        })
        .from(categoryTable)
        .where(
          parentId === null || parentId === undefined
            ? isNull(categoryTable.parentCategoryId)
            : eq(categoryTable.parentCategoryId, parentId)
        )

      return categoryResult ?? []
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Unknown error occurred")
      setError(error)
      console.error("Error fetching categories by parent ID:", error)
      return []
    } finally {
      setLoading(false)
    }
  }

  const hasChildren = async ({ categoryId }: { categoryId: number }) => {
    setLoading(true)
    setError(null)
    try {
      const children = await db
        .select({ id: categoryTable.id })
        .from(categoryTable)
        .where(eq(categoryTable.parentCategoryId, categoryId))
        .limit(1)

      return children.length > 0
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Unknown error occurred")
      setError(error)
      console.error("Error checking if category has children:", error)
      return false
    } finally {
      setLoading(false)
    }
  }


  const remove = async (categoryId: number) => {
    setLoading(true)
    setError(null)

    try {
      await db.transaction(async (tx) => {
        const [category] = await tx
          .select({
            id: categoryTable.id,
            parentCategoryId: categoryTable.parentCategoryId,
          })
          .from(categoryTable)
          .where(eq(categoryTable.id, categoryId))

        if (!category) {
          return
        }

        const parentId = category.parentCategoryId

        if (parentId == null) {
          throw new Error(
            "Cannot delete root category without a parent category"
          )
        }

        await tx
          .update(categoryTermTable)
          .set({ categoryId: parentId })
          .where(eq(categoryTermTable.categoryId, categoryId))

        await tx
          .update(categoryTable)
          .set({ parentCategoryId: parentId })
          .where(eq(categoryTable.parentCategoryId, categoryId))

        await tx
          .delete(categoryTable)
          .where(eq(categoryTable.id, categoryId))
      })
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Unknown error occurred")
      setError(error)
      console.error("Error deleting category:", error)
    } finally {
      setLoading(false)
    }
  }



  return {
    create,
    update,
    get,
    getWithParent,
    getMany,
    getManyAsJson,
    getByParentId,
    hasChildren,
    remove,
    error,
    loading,
  }
}
