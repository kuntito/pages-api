import "./envConfig"; // validates environment variables
import express, { Express } from "express";
import cors from 'cors';

const app: Express = express();
const PORT = 5005;

// allows project to parse JSON in request body
app.use(express.json());

// any one can access API routes
app.use(cors());

app.listen(PORT, () => {
    console.log(`server started at http://localhost:${PORT}`);
})