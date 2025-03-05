const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const initDb = async () => {
    try {
        const client = await pool.connect();

        await client.query(`
        CREATE TABLE IF NOT EXISTS cocktails (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            ingredients TEXT[],
            instructions TEXT
        );
        `);

        console.log('Tables créées avec succès.');
        client.release();
    } catch (error) {
        console.error('Erreur lors de l\'initialisation de la base de données :', error.message);
    } finally {
        pool.end();
    }
};

initDb();
