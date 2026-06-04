import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Book } from "../../../models/Book"
import { BookEntity, booksTable } from "../../../schemas/book-schema"
import { pagesDb } from "../../../clients/neonDbClient";
import { asc, eq } from "drizzle-orm";
import { getSignedObjectUrlS3, logDbError } from "../../../helpers/miscHelpers";


export const toBook = (
    bookEntity: BookEntity,
    bookUrl: string,
): Book => {
    return {
        id: bookEntity.bookId,
        title: bookEntity.bookTitle,
        author_str: bookEntity.bookAuthorStr,
        page_stopped_at: bookEntity.bookCurrentPage,
        book_url: bookUrl,
    };
}

/**
 * returns today's timestamp at midnight 00:00
 */
const getTodaysTimestamp = (

): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.getTime();
}


const getBookWithTimestamp = async (
    timestamp: number
): Promise<BookEntity | null> => {
    try {
        const resultRows = await pagesDb
            .select()
            .from(booksTable)
            .where(
                eq(
                    booksTable.lastReadDay,
                    timestamp,
                )
            )
            .limit(1);
    
        return resultRows[0] ?? null;
    } catch(e) {
        logDbError(
            `couldn't fetch book with timestamp ${timestamp}`,
            e
        )
    }

    return null;
}


const updateLastReadDay = async (
    bookId: number,
    lastReadDay: number,
) => {
    try {
        await pagesDb
            .update(booksTable)
            .set({
                lastReadDay: lastReadDay,
            })
            .where(
                eq(
                    booksTable.bookId,
                    bookId
                )
            );
    } catch (e) {
        logDbError(
            `couldn't update last read day for book id=${bookId}`,
            e
        );
    }
}


const getLeastRecentlyReadBook = async (
    todaysTimestamp: number,
): Promise<BookEntity | null> => {
    try {
        const resultRows = await pagesDb
            .select()
            .from(booksTable)
            .orderBy(
                asc(booksTable.lastReadDay)
            )
            .limit(1);

        if (resultRows.length === 0) return null;

        const bookEntity = resultRows[0];
        await updateLastReadDay(
            bookEntity.bookId,
            todaysTimestamp,
        );

        return bookEntity;
    } catch(e) {
        logDbError(
            "couldn't fetch least recently read book",
            e
        )
    }
    return null;
}


const pickBookEntity = async (

): Promise<BookEntity | null> => {
    const todaysTimestamp = getTodaysTimestamp();

    try {
        let bookEntity = await getBookWithTimestamp(todaysTimestamp);

        if (!bookEntity) {
            bookEntity = await getLeastRecentlyReadBook(
                todaysTimestamp
            );
            if (!bookEntity) {
                return null;
            }
        }

        return bookEntity;
    } catch (e) {
        logDbError(
            "couldn't pick a book",
            e
        )
    }

    return null;
}


export const pickBook = async (

): Promise<Book | null> => {
    try {
        const bookEntity = await pickBookEntity()
        if (!bookEntity) return null;
    
        const bookUrl = await getSignedObjectUrlS3(
            bookEntity.bookS3Key
        );
    
        return toBook(
            bookEntity,
            bookUrl
        );
    } catch (e) {
        console.log("could not pick book");
        console.log(e, "\n");
    }

    return null;
}