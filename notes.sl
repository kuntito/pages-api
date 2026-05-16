** PROJECT-SETUP **

+   to setup the project in cwd:
    `npm init -y`

    this creates a `package.json` file

+   to setup repo:
    `git init`

+   create `/.gitignore`

    add:
    `
    node_modules
    .env
    .cursorrules
    .vscode/settings.json
    tg.ts
    dist/*
    `

+   in project root, create `tsconfig.json`
    copy content from my google drive `G:\My Drive\0\tsconfig.json`

+   create `envConfig.ts`

    see `"G:\My Drive\0\envConfig.ts"` for details.

+   enables cross-origin requests, allows you specify what hosts can access this API:
    `npm install cors`
    `npm install -D @types/cors`

+   to enable `npm run dev`,
    in `package.json`, go to the `scripts` tag and add:

    `
    {
        ...,
        "scripts": {
            ...,
            "dev": "nodemon server.ts"
        },
        ...
    }
    `

    `nodemon` is the command.
    `server.ts` is the relative file path

+   in project root, create `server.ts`

+   in `server.ts`, add:

`
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
`