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
            "dev": "nodemon server.ts",
            "build": "tsc"
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

** NEON SETUP (POSTGRES) **
+   create acount:
    `https://neon.tech`

+   create new project:
    - postgres version: 17 (default)
    - cloud service: AWS
    - region: default

+   you'd need an env variable, `connection string`.
    to get this,
    click "Connect" (top right corner at time of writing)

    a dialog would appear.

    with a text like:
    `psql 'postgresql://...some other things...'`

    `delete the 'psql'`, everything within the single quotes is the connection string.

    add to env variables, `.env`.
    `NEON_CONN_STR=postgre...`

+   postgres client for node.js:
    `npm i pg`

+   ts type definitions for `pg`:
    `npm i -D @types/pg`

+   next, setup drizzle.
    it serves a single source of truth for the SQL schema
    and TS types.

    you define the schema once, drizzle infers the types.

    `npm install drizzle-orm`
    `npm install -D drizzle-kit`

+   to create a table see:

`
import { pgTable, integer, serial, text } from "drizzle-orm/pg-core";

export const songsTable = pgTable("songs", {
    songId: serial("id").primaryKey(),
    songS3Key: text("s3Key").notNull().unique(),
    songTitle: text("title").notNull(),
    songArtistName: text("artist").notNull(),
    songAlbumArtUrl: text("albumArtUrl").notNull(),
    songDurationMillis: integer("durationMillis").notNull(),
});

export type SongEntity = typeof songsTable.$inferSelect; 
`

+   table blueprints are called schema.
    all schemas are typically kept in the same directory.

    to tell drizzle where the schemas are,
    you'd need a config file in project root i.e. `drizzle.config.ts`

`
import { defineConfig } from 'drizzle-kit';
import { envConfig } from './envConfig';

export default defineConfig({
    schema: "./schemas/*.ts",
    dialect: "postgresql",
    dbCredentials: {
        url: envConfig.NEON_CONN_STR
    }
});
`

    where this, `schema: "./schemas/*.ts"`, is telling drizzle,
    the project schemas are in a root directory called `schemas`.
    
    `*.ts` says all TypeScript files within `schemas`.


** DEPENDENCIES **
+   handles file uploads
    `npm install multer`
    `npm install -D @types/multer`

+   aws S3 client for bucket operations:
    `npm install @aws-sdk/client-s3`

    generates signed urls for private S3 objects:
    `npm install @aws-sdk/s3-request-presigner`


+   converts time strings to milliseconds, allows me do ms("10s"):
    `npm i ms@2.1.3`
    `npm i -D @types/ms`, `-D` means it's only available in the development environment

+   reads PDF metadata, used to extract page count
    `npm install pdf-lib`