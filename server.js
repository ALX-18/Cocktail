const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


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
app.get('/profil', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'profil.html'));
});

app.get('/moderation', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'moderation', 'moderation.html'));
});

// Vérifier si DATABASE_URL est bien défini


// Configuration de la connexion PostgreSQL
const pool = new Pool({
    connectionString: process.env.SUPABASE_DB_URL,
    ssl: {
        require: true,
        rejectUnauthorized: false
    }
});

// Test de connexion PostgreSQL
pool.connect()
    .then(() => console.log("✅ Connecté à PostgreSQL"))
    .catch(err => {
        console.error("❌ Erreur de connexion PostgreSQL :", err.message);
        process.exit(1);
    });

// Initialisation de la base de données
const initDb = async () => {
    try {
        const client = await pool.connect();

        await client.query(`

            CREATE TABLE IF NOT EXISTS cocktails (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                ingredients TEXT[],
                instructions TEXT,
                user_id INTEGER REFERENCES users(id) ON DELETE SET NULL
            );

            CREATE TABLE IF NOT EXISTS ingredients (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL UNIQUE
            );

            CREATE TABLE IF NOT EXISTS ratings (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                cocktail_id INTEGER NOT NULL,
                rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (cocktail_id) REFERENCES cocktails(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS favorites (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                cocktail_id INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (cocktail_id) REFERENCES cocktails(id) ON DELETE CASCADE
            );
            -- La contrainte UNIQUE (user_id, cocktail_id) doit être ajoutée manuellement si besoin.
        `);

        console.log("✅ Tables 'cocktails', 'ingredients', 'ratings' et 'favorites' vérifiées/créées.");

        // Vérification de la présence de la contrainte UNIQUE sur favorites
        const uniqueConstraintCheck = await client.query(`
            SELECT 1 FROM information_schema.table_constraints
            WHERE table_name='favorites' AND constraint_type='UNIQUE' AND constraint_name='unique_favorite'
        `);
        if (uniqueConstraintCheck.rowCount === 0) {
            console.warn("⚠️ La contrainte UNIQUE (user_id, cocktail_id) n'est PAS présente sur la table 'favorites'. Pensez à l'ajouter manuellement :\nALTER TABLE favorites ADD CONSTRAINT unique_favorite UNIQUE (user_id, cocktail_id);");
        } else {
            console.log("✅ Contrainte UNIQUE (user_id, cocktail_id) présente sur la table 'favorites'.");
        }

        // Ajout automatique de la contrainte UNIQUE (user_id, cocktail_id) sur favorites
        try {
            await client.query(`ALTER TABLE favorites ADD CONSTRAINT unique_favorite UNIQUE (user_id, cocktail_id);`);
            console.log("✅ Contrainte UNIQUE (user_id, cocktail_id) ajoutée sur la table 'favorites'.");
        } catch (err) {
            if (err.code === '42710') {
                // 42710 = duplicate_object (contrainte déjà existante)
                console.log("ℹ️ La contrainte UNIQUE (user_id, cocktail_id) existe déjà sur la table 'favorites'.");
            } else if (err.code === '23505') {
                // 23505 = unique_violation (doublons présents)
                console.warn("⚠️ Doublons détectés dans 'favorites'. Nettoyez la table avant d'ajouter la contrainte UNIQUE.");
            } else {
                console.error("❌ Erreur lors de l'ajout de la contrainte UNIQUE sur 'favorites':", err.message);
            }
        }

        // Ajout automatique de la contrainte UNIQUE (user_id, cocktail_id) sur ratings
        try {
            await client.query(`ALTER TABLE ratings ADD CONSTRAINT unique_rating UNIQUE (user_id, cocktail_id);`);
            console.log("✅ Contrainte UNIQUE (user_id, cocktail_id) ajoutée sur la table 'ratings'.");
        } catch (err) {
            if (err.code === '42710') {
                // 42710 = duplicate_object (contrainte déjà existante)
                console.log("ℹ️ La contrainte UNIQUE (user_id, cocktail_id) existe déjà sur la table 'ratings'.");
            } else if (err.code === '23505') {
                // 23505 = unique_violation (doublons présents)
                console.warn("⚠️ Doublons détectés dans 'ratings'. Nettoyez la table avant d'ajouter la contrainte UNIQUE.");
            } else {
                console.error("❌ Erreur lors de l'ajout de la contrainte UNIQUE sur 'ratings':", err.message);
            }
        }

        // Ajout de la colonne user_id à cocktails si elle n'existe pas déjà
        try {
            await client.query(`ALTER TABLE cocktails ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL`);
            console.log("✅ Colonne user_id ajoutée à la table cocktails (si besoin).");
        } catch (err) {
            if (err.code === '42701') {
                // 42701 = duplicate_column
              } else {
              console.log("ℹ️ La colonne user_id existe déjà dans la table cocktails.");
                console.error("❌ Erreur lors de l'ajout de la colonne user_id à cocktails:", err.message);
            }
        }

        client.release();

        // Insérer les ingrédients après la création des tables
        await insertIngredientsToTable('solid_ingredient', 'solid_ingredients.txt');
        await insertIngredientsToTable('liquid_ingredient', 'liquid_ingredients.txt');

    } catch (error) {
        console.error("❌ Erreur lors de l'initialisation de la base de données :", error.message);
    }
};

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']; // Bearer TOKEN
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token manquant' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Token invalide' });
        req.user = user; // données du token (id, email, username)
        next();
    });
}
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: "Trop de tentatives de connexion, veuillez réessayer plus tard."
});
// Insérer les ingrédients depuis le fichier texte
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

app.use(express.static(path.join(__dirname, 'public')));

// Endpoint API : Récupérer tous les cocktails
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

// Endpoint API : Ajouter un cocktail
app.post('/api/cocktails', authenticateToken,
    [
        body('name').notEmpty().withMessage('Nom du cocktail requis').trim().escape(),
        body('description').optional().trim().escape(),
        body('ingredients').isArray({ min: 1 }).withMessage('Au moins un ingrédient requis'),
        body('ingredients.*').isString().trim().escape(),
        body('instructions').notEmpty().withMessage('Instructions requises').trim().escape(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { name, description, ingredients, instructions } = req.body;
            const user_id = req.user.id;
        const result = await pool.query(
            'INSERT INTO cocktails (name, description, ingredients, instructions, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, description, ingredients, instructions, user_id || null]
        );

            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error("❌ Erreur POST /api/cocktails :", error.message);
            res.status(500).json({ error: error.message });
        }
    }
);

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
app.post('/api/users/register',
    [
        body('email').isEmail().withMessage('Email invalide').normalizeEmail(),
        body('username').isLength({ min: 3 }).withMessage('Nom d\'utilisateur trop court').trim().escape(),
        body('password').isLength({ min: 6 }).withMessage('Mot de passe trop court'),
        body('urlavatar').optional().isURL().withMessage('URL d\'avatar invalide'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, username, password, urlavatar } = req.body;
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
    }
);

// Login
app.post('/api/users/login',loginLimiter,
    [
        body('mailOrUsername').notEmpty().withMessage('Email ou nom d\'utilisateur requis').trim().escape(),
        body('password').notEmpty().withMessage('Mot de passe requis')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { mailOrUsername, password } = req.body;

        try {
            const userRes = await pool.query(
                'SELECT * FROM users WHERE email = $1 OR username = $1',
                [mailOrUsername]
            );

            if (userRes.rowCount === 0) {
                return res.status(401).json({ error: 'Identifiants invalides.' });
            }

            const user = userRes.rows[0];
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return res.status(401).json({ error: 'Identifiants invalides.' });
            }

            const token = jwt.sign(
                { id: user.id, email: user.email, username: user.username, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            const { id, email, username, urlavatar,role } = user;
            res.json({
                token,
                user: { id, email, username, urlavatar, role } // inclus le rôle ici
            });

        } catch (err) {
            res.status(500).json({ error: 'Erreur serveur.' });
        }
    });

// Get ratings for a user
app.get('/api/ratings', authenticateToken, async (req, res) => {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: 'user_id requis' });
    try {
        const result = await pool.query('SELECT * FROM ratings WHERE user_id = $1', [user_id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Add or update a rating
app.post('/api/ratings', authenticateToken,
    [
        body('user_id').isInt().withMessage('user_id invalide'),
        body('cocktail_id').isInt().withMessage('cocktail_id invalide'),
        body('rating').isInt({ min: 1, max: 5 }).withMessage('rating doit être entre 1 et 5')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { user_id, cocktail_id, rating } = req.body;
        try {
            // Upsert
            const result = await pool.query(
                `INSERT INTO ratings (user_id, cocktail_id, rating) VALUES ($1, $2, $3)
         ON CONFLICT (user_id, cocktail_id) DO UPDATE SET rating = $3 RETURNING *`,
                [user_id, cocktail_id, rating]
            );
            res.json(result.rows[0]);
        } catch (err) {
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }
);

// Get favorites for a user
app.get('/api/favorites', authenticateToken, async (req, res) => {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: 'user_id requis' });
    try {
        const result = await pool.query('SELECT * FROM favorites WHERE user_id = $1', [user_id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Add a favorite
app.post('/api/favorites', authenticateToken,
    [
        body('user_id').isInt().withMessage('user_id invalide'),
        body('cocktail_id').isInt().withMessage('cocktail_id invalide')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { user_id, cocktail_id } = req.body;
        try {
            const result = await pool.query(
                `INSERT INTO favorites (user_id, cocktail_id) VALUES ($1, $2)
         ON CONFLICT (user_id, cocktail_id) DO NOTHING RETURNING *`,
                [user_id, cocktail_id]
            );
            res.json(result.rows[0] || {});
        } catch (err) {
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }
);

// Remove a favorite
app.delete('/api/favorites', authenticateToken, async (req, res) => {
    // Récupère depuis req.query au lieu de req.body
    const { user_id, cocktail_id } = req.query;
    if (!user_id || !cocktail_id) return res.status(400).json({ error: 'Champs requis manquants' });
    try {
        await pool.query('DELETE FROM favorites WHERE user_id = $1 AND cocktail_id = $2', [user_id, cocktail_id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Lancer le serveur avec gestion du port dynamique
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
function isAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Accès refusé : Admin uniquement' });
    }
    next();
}

// Route pour récupérer tous les utilisateurs (admin only)
app.get('/api/admin/users', authenticateToken, isAdmin, async (req, res) => {
    try {
        const result = await pool.query('SELECT id, email, username, role FROM users ORDER BY username ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Route pour modifier le rôle d'un utilisateur (admin only)
app.patch('/api/admin/users/:id/role', authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) return res.status(400).json({ error: 'Rôle invalide' });

    try {
        const result = await pool.query('UPDATE users SET role = $1 WHERE id = $2 RETURNING id, username, role', [role, id]);
        if (result.rowCount === 0) return res.status(404).json({ error: 'Utilisateur non trouvé' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Route pour supprimer un cocktail (admin only)
app.delete('/api/admin/cocktails/:id', authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM cocktails WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});