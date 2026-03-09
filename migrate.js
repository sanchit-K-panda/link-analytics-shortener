import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Very basic .env parser purely for this script
let dbUrl = process.env.VITE_NEON_DATABASE_URL;

if (!dbUrl) {
    try {
        const envFile = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
        const match = envFile.match(/VITE_NEON_DATABASE_URL=(.+)/);
        if (match && match[1]) {
            // Strip any quotes that might be there
            dbUrl = match[1].trim().replace(/^["']|["']$/g, '');
        }
    } catch (e) {
        console.log("No .env file found or couldn't read it.");
    }
}

if (!dbUrl || dbUrl.includes('endpoint.neon.tech/dbname')) {
    console.error("❌ ERROR: You haven't added your actual Neon Database URL to the .env file yet!");
    console.error("Please edit the .env file and set VITE_NEON_DATABASE_URL to your real Neon connection string.");
    process.exit(1);
}

const sql = neon(dbUrl);

async function runMigration() {
    console.log("🚀 Connecting to Neon Database...");
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS links (
                id SERIAL PRIMARY KEY,
                original_url TEXT NOT NULL,
                short_code TEXT UNIQUE NOT NULL,
                clicks INTEGER NOT NULL DEFAULT 0,
                max_clicks INTEGER DEFAULT NULL,
                enabled BOOLEAN NOT NULL DEFAULT TRUE,
                owner TEXT NOT NULL,
                last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;
        console.log("✅ Success! The 'links' table has been created successfully!");
        console.log("You can now go back to http://localhost:5174 and refresh the page.");
    } catch (err) {
        console.error("❌ Failed to create table:", err.message);
    }
}

runMigration();
