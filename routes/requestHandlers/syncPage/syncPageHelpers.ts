import { eq } from "drizzle-orm"
import { pagesDb } from "../../../clients/neonDbClient"
import { logDbError } from "../../../helpers/miscHelpers"
import { BookEntity, booksTable } from "../../../schemas/book-schema"

/**
 * returns the book entity if book id is valid
 * else returns null
 */
export const validateBookId = async (
    bookIdStr: string,
): Promise<BookEntity | null> => {

    const bookId = parseInt(bookIdStr);
    if (isNaN(bookId)) return null;

    try {
        const resultRows = await pagesDb
            .select()
            .from(booksTable)
            .where(
                eq(
                    booksTable.bookId,
                    bookId
                )
            )

        return resultRows[0] ?? null;
    } catch (e) {
        logDbError(
            "couldn't validate book id",
            e
        )
    }
    return null;
}

/**
 * checks the page number against the books page count.
 * 
 * if valid, returns the page number, else returns null.
 */
export const validatePage = (
    pageStr: string,
    bookEntity: BookEntity,
): number | null => {
    const page = parseInt(pageStr);
    if (isNaN(page)) return null;

    const isValidPage = page > 0 && page <= bookEntity.bookPageCount;
    return isValidPage? page : null;
}


export const updateBookPage = async (
    bookId: number,
    currentPage: number,
): Promise<boolean> => {
    try {
        await pagesDb
            .update(booksTable)
            .set({
                bookCurrentPage: currentPage,
            })
            .where(
                eq(
                    booksTable.bookId,
                    bookId,
                )
            );
        return true;
    } catch (e) {
        logDbError(
            `couldn't update page for book id=${bookId}`,
            e
        );
    }
    return false;
}