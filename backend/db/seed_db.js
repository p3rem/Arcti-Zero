const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const seedPath = path.join(__dirname, 'seed.sql');
const seedSql = fs.readFileSync(seedPath, 'utf8');

async function seedDb() {
    try {
        console.log('Seeding database...');
        const client = await pool.connect();
        await client.query(seedSql);
        console.log('Seed data inserted successfully.');
        client.release();
    } catch (err) {
        console.error('Error seeding database:', err);
    } finally {
        await pool.end();
    }
}

seedDb();
