import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';

const databaseUrl = 'postgresql://neondb_owner:npg_2KQnChYsebu6@ep-winter-wildflower-akhb5oqe.c-3.us-west-2.aws.neon.tech/neondb?sslmode=require';

async function main() {
    const client = new Client({ connectionString: databaseUrl });
    await client.connect();

    try {
        const schema = fs.readFileSync('neon-setup.sql', 'utf8');
        console.log('Running Neon SQL schema setup...');
        await client.query(schema);
        console.log('Database schema created successfully.');
    } catch (err) {
        console.error('Schema setup failed:', err);
    } finally {
        await client.end();
    }
}

main().catch(console.error);
