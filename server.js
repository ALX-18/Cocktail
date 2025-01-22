// server.js
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Configuration PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Création de la table
const initDb = async () => {
    const client = await pool.connect();
    try {
        await client.query(`
      CREATE TABLE IF NOT EXISTS cocktails (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        ingredients TEXT[],
        instructions TEXT
      );
    `);
        console.log('Table créée avec succès');
    } catch (error) {
        console.error('Erreur création table:', error);
    } finally {
        client.release();
    }
};

initDb();

// Récupérer tous les cocktails
app.get('/api/cocktails', async (req, res) => {
    try {
        const { search } = req.query;
        let query = 'SELECT * FROM cocktails';
        const values = [];

        if (search) {
            query += ` WHERE name ILIKE $1 OR $1 = ANY(ingredients)`;
            values.push(`%${search}%`);
        }

        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Récupérer un cocktail par ID
app.get('/api/cocktails/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM cocktails WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Cocktail non trouvé' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Créer un cocktail
app.post('/api/cocktails', async (req, res) => {
    try {
        const { name, description, ingredients, instructions } = req.body;
        const result = await pool.query(
            'INSERT INTO cocktails (name, description, ingredients, instructions) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, description, ingredients, instructions]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Modifier un cocktail
app.put('/api/cocktails/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, ingredients, instructions } = req.body;

        const result = await pool.query(
            'UPDATE cocktails SET name = $1, description = $2, ingredients = $3, instructions = $4 WHERE id = $5 RETURNING *',
            [name, description, ingredients, instructions, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Cocktail non trouvé' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Supprimer un cocktail
app.delete('/api/cocktails/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM cocktails WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Cocktail non trouvé' });
        }

        res.json({ message: 'Cocktail supprimé' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
const jwtSecret = process.env.JWT_SECRET;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});