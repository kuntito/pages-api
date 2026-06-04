import { Request, Response, RequestHandler } from "express";
import { Book } from "../../../models/Book";
import { pickBook } from "./pickBookHelpers";

type PickBookResponse = 
    | {
        success: true;
        book: Book;
    } 
    | {
        success: false;
        debug: object;
    }

    
const pickBookReqHandler = async (
    req: Request,
    res: Response<PickBookResponse>
) => {
    // tells the client not to cache the response, some browsers do.
    res.setHeader('Cache-Control', 'no-store');

    const book = await pickBook();
    if (book == null) {
        return res
            .status(500)
            .json({
                success: false,
                debug: {
                    message: "couldn't pick book"
                }
            })
    }

    return res
        .status(200)
        .json({
            success: true,
            book: book,
        });
}

export { pickBookReqHandler };