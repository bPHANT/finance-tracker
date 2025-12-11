import { relations, sql } from "drizzle-orm"
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { accountTable } from "./accounts"

export const transactionGroupTable = sqliteTable("transactionGroups", {
  id: integer().primaryKey({
    autoIncrement: true,
  }),
  createdAt: integer({ mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer({ mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  name: text(),
  note: text(),
  date: integer({ mode: "timestamp" }).notNull(),
  accountId: integer()
    .notNull()
    .references(() => accountTable.id),
  imagePath: text(),
})

export const transactionGroupRelations = relations(
  transactionGroupTable,
  ({ one }) => ({
    account: one(accountTable, {
      fields: [transactionGroupTable.accountId],
      references: [accountTable.id],
    }),
  })
)

export type TransactionGroup = typeof transactionGroupTable.$inferSelect
