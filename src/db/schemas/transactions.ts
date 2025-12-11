import { relations, sql } from "drizzle-orm"
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { categoryTermTable } from "./categoryTerms"
import { transactionGroupTable } from "./transactionGroups"

export const transactionTable = sqliteTable("transactions", {
  id: integer().primaryKey({
    autoIncrement: true,
  }),
  createdAt: integer({ mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer({ mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  name: text().notNull(),
  amount: real().notNull(),
  categoryTermId: integer()
    .notNull()
    .references(() => categoryTermTable.id),

  transactionGroupId: integer()
    .notNull()
    .references(() => transactionGroupTable.id, { onDelete: "cascade" }),
})

export const transactionRelations = relations(transactionTable, ({ one }) => ({
  categoryTerm: one(categoryTermTable, {
    fields: [transactionTable.categoryTermId],
    references: [categoryTermTable.id],
  }),
  transactionGroup: one(transactionGroupTable, {
    fields: [transactionTable.transactionGroupId],
    references: [transactionGroupTable.id],
  }),
}))

export type Transaction = typeof transactionTable.$inferSelect
