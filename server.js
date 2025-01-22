const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Configuration PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Création de la base de données et des tables
const initDb = async () => {
    try {
        const client = await pool.connect();

        // Création de la table des cocktails
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
    }
};

initDb();

// Endpoints
app.get('/api/cocktails', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM cocktails');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Autres endpoints ici (ajout, modification, suppression, etc.)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
