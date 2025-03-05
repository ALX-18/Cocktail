const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Vérifier si DATABASE_URL est bien défini
if (!process.env.DATABASE_URL) {
    console.error("❌ Erreur : DATABASE_URL n'est pas défini dans .env !");
    process.exit(1);
}

// 🔹 Configuration de la connexion PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes("localhost") ? false : { rejectUnauthorized: false }
});

// 🔹 Test de connexion PostgreSQL
pool.connect()
    .then(() => console.log("✅ Connecté à PostgreSQL sur Railway"))
    .catch(err => {
        console.error("❌ Erreur de connexion PostgreSQL :", err.message);
        process.exit(1);
    });

// 🔹 Initialisation de la base de données
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

        console.log("✅ Table 'cocktails' vérifiée/créée.");
        client.release();
    } catch (error) {
        console.error("❌ Erreur lors de l'initialisation de la base de données :", error.message);
    }
};

initDb();

// 🔹 Servir les fichiers statiques du dossier "public"
app.use(express.static(path.join(__dirname, 'public')));

// 🔹 Endpoint API : Récupérer tous les cocktails
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
        console.error("❌ Erreur GET /api/cocktails :", error.message);
        res.status(500).json({ error: error.message });
    }
});

// 🔹 Endpoint API : Ajouter un cocktail
app.post('/api/cocktails', async (req, res) => {
    try {
        console.log("📥 Données reçues :", req.body);
        const { name, description, ingredients, instructions } = req.body;

        if (!name || !ingredients || !instructions) {
            return res.status(400).json({ error: "Tous les champs sont obligatoires !" });
        }

        const result = await pool.query(
            'INSERT INTO cocktails (name, description, ingredients, instructions) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, description, ingredients, instructions]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("❌ Erreur POST /api/cocktails :", error.message);
        res.status(500).json({ error: error.message });
    }
});

// 🔹 Lancer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
