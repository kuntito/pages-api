import express from "express"; 
import multer from "multer";
import { uploadBookReqHandler } from "./requestHandlers/uploadBook/uploadBookReqHandler";
import { pickBookReqHandler } from "./requestHandlers/pickBook/pickBookRh";

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

export default pagesRouter;