import { Request, Response, RequestHandler } from "express";
import { updateBookPage, validateBookId, validatePage } from "./syncPageHelpers";

type SyncPageResponse = 
    | {
        success: true;
    }
    | {
        success: false;
        debug: object;
    }


const syncPageReqHandler = async (
    req: Request,
    res: Response<SyncPageResponse>
) => {
    const { bookId: bookIdStr, currentPage: currentPageStr } = req.body;

    const bookEntity = await validateBookId(bookIdStr);
    if (bookEntity == null) {
        return res
            .status(400)
            .json({
                success: false,
                debug: {
                    errorMessage: `book id, ${bookIdStr}, is invalid.`
                }
            })
    }

    const curPageNum = validatePage(
        currentPageStr,
        bookEntity
    );
    if (!curPageNum) {
        return res
            .status(400)
            .json({
                success: false,
                debug: {
                    errorMessage: `current page, ${currentPageStr}, is invalid`
                }
            });
    }

    const isUpdated = await updateBookPage(bookEntity.bookId, curPageNum)
    if (isUpdated) {
        return res
            .status(200)
            .json({
                success: true
            })
    } else {
        return res
            .status(500)
            .json({
                success: false,
                debug: {
                    errorMessage: "couldn't update page",
                }
            })
    }
}

export { syncPageReqHandler };