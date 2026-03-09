import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dbUrl = process.env.VITE_NEON_DATABASE_URL;
if (!dbUrl) {
    try {
        const envFile = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
        const match = envFile.match(/VITE_NEON_DATABASE_URL=(.+)/);
        if (match && match[1]) {
            dbUrl = match[1].trim().replace(/^["']|["']$/g, '');
        }
    } catch (e) { }
}

const sql = neon(dbUrl);

async function check() {
    try {
        const links = await sql`SELECT * FROM links`;
        console.log(`Found ${links.length} links in the database!`);
        if (links.length > 0) {
            console.log(links[0]);
        }
    } catch (err) {
        console.error(err);
    }
}
check();
