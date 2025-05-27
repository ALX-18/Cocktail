// /api/users.js
// Handler serverless Vercel pour l'inscription et la connexion utilisateur
// Remplace la logique in-memory par une vraie connexion PostgreSQL Supabase

import { Pool } from 'pg';
const pool = new Pool({ connectionString: process.env.SUPABASE_DB_URL });

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    if (req.url.endsWith('/register')) {
      // Inscription
      const { email, username, password, urlavatar } = req.body;
      if (!email || !username || !password) {
        return res.status(400).json({ error: 'Champs requis manquants.' });
      }
      try {
        const exists = await pool.query('SELECT 1 FROM users WHERE email = $1 OR username = $2', [email, username]);
        if (exists.rowCount > 0) return res.status(409).json({ error: "Email ou nom d'utilisateur déjà utilisé." });
        const hash = await bcrypt.hash(password, 10);
        await pool.query(
          'INSERT INTO users (email, username, password, urlavatar, role) VALUES ($1, $2, $3, $4, $5)',
          [email, username, hash, urlavatar || '', 'user']
        );
        return res.status(201).json({ success: true });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    } else if (req.url.endsWith('/login')) {
      // Connexion
      const { mailOrUsername, password } = req.body;
      if (!mailOrUsername || !password) {
        return res.status(400).json({ error: 'Champs requis manquants.' });
      }
      try {
        const userRes = await pool.query(
          'SELECT * FROM users WHERE email = $1 OR username = $1',
          [mailOrUsername]
        );
        if (userRes.rowCount === 0) return res.status(401).json({ error: 'Identifiants invalides.' });
        const user = userRes.rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: 'Identifiants invalides.' });
        const token = jwt.sign(
          { id: user.id, email: user.email, username: user.username, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        );
        const { id, email, username, urlavatar, role } = user;
        return res.json({ token, user: { id, email, username, urlavatar, role } });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    } else {
      return res.status(404).json({ error: 'Route non trouvée.' });
    }
  } else {
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  }
}
