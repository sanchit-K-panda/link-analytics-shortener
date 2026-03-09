import { neon } from '@neondatabase/serverless';

const databaseUrl = import.meta.env.VITE_NEON_DATABASE_URL;

// Ensure we don't crash the entire app if the user hasn't set the env var yet
export const sql = databaseUrl
    ? neon(databaseUrl)
    : async () => {
        throw new Error("Missing VITE_NEON_DATABASE_URL in .env file. Please add your Neon connection string to continue.");
    };
