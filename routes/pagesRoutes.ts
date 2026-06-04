import express from "express"; 
import multer from "multer";
import { uploadBookReqHandler } from "./requestHandlers/uploadBook/uploadBookReqHandler";
import { pickBookReqHandler } from "./requestHandlers/pickBook/pickBookRh";
import { syncPageReqHandler } from "./requestHandlers/syncPage/syncPageRh";

const pagesRouter = express.Router();

const fileUploadMiddleware = multer(
    { storage: multer.memoryStorage()}
);
pagesRouter.post(
    "/book",
    fileUploadMiddleware.single("book"),
    uploadBookReqHandler
);

pagesRouter.get('/pickBook', pickBookReqHandler);
pagesRouter.patch('/book/page', syncPageReqHandler);

export default pagesRouter;