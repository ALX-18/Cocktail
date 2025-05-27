const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

// Servir le dossier 'register' sous l'URL '/register'
app.use('/register', express.static(path.join(__dirname, 'public', 'register')));

// Servir le dossier 'login' sous l'URL '/login'
app.use('/login', express.static(path.join(__dirname, 'public', 'login')));

// (Optionnel) Route pour accéder explicitement à la page principale de register (ex: register.html)
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register', 'register.html'));
});

// (Optionnel) Route pour accéder explicitement à la page principale de login (ex: login.html)
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login', 'login.html'));
});



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
        await insertIngredientsToTable('solid_ingredient', 'solid_ingredients.txt');
        await insertIngredientsToTable('liquid_ingredient', 'liquid_ingredients.txt');

    } catch (error) {
        console.error("❌ Erreur lors de l'initialisation de la base de données :", error.message);
    }
};

// 🔹 Insérer les ingrédients depuis le fichier texte
const insertIngredientsToTable = async (tableName, fileName) => {
    try {
        const filePath = path.join(__dirname, fileName);
        if (!fs.existsSync(filePath)) {
            console.error(`❌ Fichier des ingrédients introuvable : ${filePath}`);
            return;
        }

        console.log(`📂 Fichier des ingrédients trouvé : ${filePath}`);

        const data = fs.readFileSync(filePath, 'utf-8');

        // Extraction des ingrédients (sans catégories ni tirets)
        const ingredients = data
            .split('\n')
            .map(line => line.trim())
            .filter(line => line && !line.includes(':') && !line.startsWith('-'))
            .map(ing => ing.replace(/^- /, ''));

        if (ingredients.length === 0) {
            console.error("⚠️ Aucun ingrédient extrait. Vérifiez le format du fichier.");
            return;
        }

        for (let ing of ingredients) {
            await pool.query(
                `INSERT INTO ${tableName} (name) VALUES ($1) ON CONFLICT (name) DO NOTHING`,
                [ing]
            );
        }

        console.log(`✅ Ingrédients insérés dans la table ${tableName} avec succès !`);
    } catch (error) {
        console.error(`❌ Erreur lors de l'insertion dans la table ${tableName} :`, error.message);
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
// Route pour récupérer les ingrédients solides
app.get('/api/solid_ingredients', async (req, res) => {
    try {
        const result = await pool.query('SELECT name FROM solid_ingredient ORDER BY name ASC');
        res.json(result.rows.map(row => row.name));
    } catch (error) {
        console.error("❌ Erreur GET /api/solid_ingredients :", error.message);
        res.status(500).json({ error: error.message });
    }
});

// Route pour récupérer les ingrédients liquides
app.get('/api/liquid_ingredients', async (req, res) => {
    try {
        const result = await pool.query('SELECT name FROM liquid_ingredient ORDER BY name ASC');
        res.json(result.rows.map(row => row.name));
    } catch (error) {
        console.error("❌ Erreur GET /api/liquid_ingredients :", error.message);
        res.status(500).json({ error: error.message });
    }
});

// Register
app.post('/api/users/register', async (req, res) => {
  const { email, username, password, urlavatar } = req.body;
  if (!email || !username || !password) return res.status(400).json({ error: 'Champs requis manquants.' });
  try {
    const userExists = await pool.query('SELECT 1 FROM users WHERE email = $1 OR username = $2', [email, username]);
    if (userExists.rowCount > 0) return res.status(409).json({ error: "Email ou nom d'utilisateur déjà utilisé." });
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, username, password, urlavatar) VALUES ($1, $2, $3, $4) RETURNING id, email, username, urlavatar',
      [email, username, hash, urlavatar || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// Login
app.post('/api/users/login', async (req, res) => {
  const { mailOrUsername, password } = req.body;
  if (!mailOrUsername || !password) return res.status(400).json({ error: 'Champs requis manquants.' });
  try {
    const userRes = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $1',
      [mailOrUsername]
    );
    if (userRes.rowCount === 0) return res.status(401).json({ error: 'Identifiants invalides.' });
    const user = userRes.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Identifiants invalides.' });
    // Ne pas renvoyer le hash !
    const { id, email, username, urlavatar } = user;
    res.json({ id, email, username, urlavatar });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
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

