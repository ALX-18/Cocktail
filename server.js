const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
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
    connectionString: process.env.SUPABASE_DB_URL,
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
});


// 🔹 Test de connexion PostgreSQLs
pool.connect()
    .then(() => console.log("✅ Connecté à PostgreSQL"))
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

            CREATE TABLE IF NOT EXISTS ingredients (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL UNIQUE
            );
        `);

        console.log("✅ Tables 'cocktails' et 'ingredients' vérifiées/créées.");
        client.release();

        // Insérer les ingrédients après la création des tables
        await insertIngredients();
    } catch (error) {
        console.error("❌ Erreur lors de l'initialisation de la base de données :", error.message);
    }
};

// 🔹 Insérer les ingrédients depuis le fichier texte
const insertIngredients = async () => {
    try {
        const filePath = path.join(__dirname, 'ingredients_cocktail.txt');
        if (!fs.existsSync(filePath)) {
            console.error("❌ Fichier des ingrédients introuvable :", filePath);
            return;
        }

        console.log("📂 Fichier des ingrédients trouvé :", filePath);

        const data = fs.readFileSync(filePath, 'utf-8');

        // Extraction des ingrédients (on enlève les catégories et les tirets)
        const ingredients = data
            .split('\n')
            .map(line => line.trim())
            .filter(line => line && !line.includes(':') && !line.startsWith('-'))
            .map(ing => ing.replace(/^- /, ''));


        if (ingredients.length === 0) {
            console.error("⚠️ Aucun ingrédient extrait. Vérifiez le format du fichier.");
            return;
        }

        // Insertion dans PostgreSQL (en évitant les doublons)
        for (let ing of ingredients) {
            await pool.query(
                'INSERT INTO ingredients (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
                [ing]
            );
        }

        console.log("✅ Ingrédients insérés avec succès !");
    } catch (error) {
        console.error("❌ Erreur lors de l'insertion des ingrédients :", error.message);
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
// Endpoint API : Récupérer tous les ingrédients
app.get('/api/ingredients', async (req, res) => {
    try {
        const result = await pool.query('SELECT name FROM ingredients ORDER BY name ASC');
        res.json(result.rows.map(row => row.name));
    } catch (error) {
        console.error("❌ Erreur GET /api/ingredients :", error.message);
        res.status(500).json({ error: error.message });
    }
});

// 🔹 Lancer le serveur avec gestion du port dynamique
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.warn(`⚠️ Port ${PORT} déjà utilisé, tentative avec un autre port...`);
        const newPort = Math.floor(Math.random() * (4000 - 3001) + 3001);
        app.listen(newPort, () => {
            console.log(`🚀 Serveur redémarré sur le port ${newPort}`);
        });
    } else {
        console.error("❌ Erreur lors du démarrage du serveur :", err);
    }
});
