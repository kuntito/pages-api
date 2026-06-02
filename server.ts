import "./envConfig"; // validates environment variables
import express, { Express } from "express";
import cors from 'cors';
import pagesRouter from "./routes/pagesRoutes";

const app: Express = express();
const PORT = 5005;

// allows project to parse JSON in request body
app.use(express.json());

// any one can access API routes
app.use(cors());

app.use("/api/pages", pagesRouter);

app.listen(PORT, () => {
    console.log(`server started at http://localhost:${PORT}`);
})