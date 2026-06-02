import { Request, RequestHandler, Response } from "express";
import { insertBookInDb, isBookPdf, uploadBookToS3 } from "./uploadBookHelpers";
import { deleteFileFromS3 } from "../../../helpers/miscHelpers";

type UploadBookResponse = 
    | {
        success: true;
        bookFileName: string;
    }
    | {
        success: false;
        clientErrorMessage?: string;
        debug?: object;
    };


const uploadBookReqHandler: RequestHandler = async(
    req: Request,
    res: Response<UploadBookResponse>
) => {
    const uploadedBookFile = req.file;

    if (!uploadedBookFile) {
        return res
            .status(400)
            .json({
                success: false,
                clientErrorMessage: "the books isn't in the upload",
            });
    }

    const { 
        bookTitle,
        bookAuthorStr
    } = req.body;

    if (!bookTitle) {
        return res
            .status(400)
            .json({
                success: false,
                clientErrorMessage: "the book needs a title",
            });
    }


    if (!bookAuthorStr) {
        return res
            .status(400)
            .json({
                success: false,
                clientErrorMessage: "the book needs an author",
            })
    }
    const bookFileName = `${bookTitle}-${bookAuthorStr}`;

    const isPdf = isBookPdf(uploadedBookFile);
    if (!isPdf) {
        return res
            .status(400)
            .json({
                success: false,
                clientErrorMessage: "only PDF allowed"
            });
    }


    const maybeS3Key = await uploadBookToS3(uploadedBookFile);
    if (maybeS3Key == null) {
        return res
            .status(500)
            .json({
                success: false,
                clientErrorMessage: "error occurred",
                debug: {
                    errorMessage: `s3 upload failed for '${bookFileName}'`
                }
            })
    }

    // renaming for clarity, at this point, the above check ensures it's not a null
    const bookS3Key = maybeS3Key;
    const isBookInsertedDb = await insertBookInDb(
        bookS3Key,
        bookTitle,
        bookAuthorStr
    );
    if (!isBookInsertedDb) {
        await deleteFileFromS3(bookS3Key);

        return res
            .status(500)
            .json({
                success: false,
                clientErrorMessage: "error occurred",
                debug: {
                    errorMessage: "db insert for uploaded book failed"
                }
            });
    }


    return res
        .status(201)
        .json({
            success: true,
            bookFileName: bookFileName
        })
}

export { uploadBookReqHandler };