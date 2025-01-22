const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
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

// Servir les fichiers statiques du dossier "public"
app.use(express.static(path.join(__dirname, 'public')));

// Endpoints API
app.get('/api/cocktails', async (req, res) => {
    try {
        const search = req.query.search || '';
        let query = 'SELECT * FROM cocktails';
        const values = [];

        if (search) {
            query += ' WHERE name ILIKE $1 OR $1 = ANY(ingredients)';
            values.push(`%${search}%`);
        }

        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.post('/api/cocktails', async (req, res) => {
    try {
        console.log('Données reçues :', req.body); // Ajout du log
        const { name, description, ingredients, instructions } = req.body;

        const result = await pool.query(
            'INSERT INTO cocktails (name, description, ingredients, instructions) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, description, ingredients, instructions]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error); // Log des erreurs
        res.status(500).json({ error: error.message });
    }
});


// Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
