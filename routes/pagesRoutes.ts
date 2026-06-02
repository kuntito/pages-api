import express from "express"; 
import multer from "multer";
import { uploadBookReqHandler } from "./requestHandlers/uploadBook/uploadBookReqHandler";

const pagesRouter = express.Router();

const fileUploadMiddleware = multer(
    { storage: multer.memoryStorage()}
);
pagesRouter.post(
    "/book",
    fileUploadMiddleware.single("book"),
    uploadBookReqHandler
);

export default pagesRouter;