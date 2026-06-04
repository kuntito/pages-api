import { randomUUID } from "crypto";
import path from "path";
import { s3BookPrefix } from "../../../util/constants";
import { pagesS3Client } from "../../../clients/pagesS3Client";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { envConfig } from "../../../envConfig";
import { BookInsertEntity, booksTable } from "../../../schemas/book-schema";
import { pagesDb } from "../../../clients/neonDbClient";
import { logDbError } from "../../../helpers/miscHelpers";
import { PDFDocument } from "pdf-lib";


export const isBookPdf = (
    file: Express.Multer.File
): boolean => {
    const bookFileExt = path.extname(file.originalname).toLowerCase();
    return bookFileExt === ".pdf";
};


export const getPageCount = async (
    buffer: Buffer,
): Promise<number | null> => {
    try {
        const pdfDoc = await PDFDocument.load(buffer);
        return pdfDoc.getPageCount();
    } catch (e) {
        console.log("couldn't read page count from PDF");
        console.log(`error: ${(e as Error).message}`);
        console.log();
    }
    return null;
}


const generateS3Key = (
    fileExt: string,
    fileStem: string,
) => {
    const uuid = randomUUID();
    const fileName = fileStem + "-" + uuid + "." + fileExt;
    const s3Key = s3BookPrefix + fileName;
    return s3Key;
}


const getFileExtFileStem = (
    file: Express.Multer.File
): {
    fileExt: string,
    fileStem: string,
} => {
    const fileExt = path.extname(file.originalname);
    const fileStem = path.basename(file.originalname, fileExt);

    return { fileExt, fileStem };
}


/**
 * uploads the book file to S3.
 * 
 * if success, returns S3 key
 * else, null.
 */
export const uploadBookToS3 = async (
    file: Express.Multer.File,
): Promise<string | null> => {
    const { fileExt, fileStem } = getFileExtFileStem(file);
    const s3Key = generateS3Key(fileExt, fileStem);

    try {
        await pagesS3Client.send(
            new PutObjectCommand({
                Bucket: envConfig.AWS_BUCKET_NAME,
                Key: s3Key,
                Body: file.buffer,
                ContentType: file.mimetype,
            })
        )

        return s3Key;
    } catch (e) {
        console.log("s3 file upload failed");
        console.log(`s3Key: ${s3Key}`);
        console.log(`errorMessage: ${(e as Error).message}`);
        console.log();
    }

    return null;
}


export const insertBookInDb = async (
    s3Key: string,
    bookTitle: string,
    bookAuthorStr: string,
    bookPageCount: number,
): Promise<boolean> => {
    
    const bookEntity: BookInsertEntity = {
        bookS3Key: s3Key,
        bookTitle: bookTitle,
        bookAuthorStr: bookAuthorStr,
        bookPageCount: bookPageCount,
    };

    try {
        await pagesDb
            .insert(booksTable)
            .values(bookEntity);

        return true;
    } catch (e) {
        logDbError(
            "db insert failed, booksTable",
            e,
        )
    }

    return false;
}