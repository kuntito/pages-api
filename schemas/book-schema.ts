import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";

export const booksTN = "books";
export const booksTable = pgTable(booksTN, {
    bookId: serial("id")
        .primaryKey(),
    bookS3Key: text("s3Key")
        .notNull()
        .unique(),
    bookTitle: text("title")
        .notNull(),
    bookAuthorStr: text("authorStr")
        .notNull(),
    bookCurrentPage: integer("currentPage")
        .notNull()
        .default(1),
});

export type BookEntity = typeof booksTable.$inferSelect;
export type BookInsertEntity = typeof booksTable.$inferInsert;