// /api/favorites.js
// Handler serverless Vercel pour les favoris
// Utilise la BDD Supabase pour GET/POST/DELETE favorites, avec authentification JWT

import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const pool = new Pool({ connectionString: process.env.SUPABASE_DB_URL });

function authenticateToken(req) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: 'user_id requis' });
    try {
      const result = await pool.query('SELECT * FROM favorites WHERE user_id = $1', [user_id]);
      return res.json(result.rows);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else if (req.method === 'POST') {
    const user = authenticateToken(req);
    if (!user) return res.status(401).json({ error: 'Token manquant ou invalide' });
    const { user_id, cocktail_id } = req.body;
    if (!user_id || !cocktail_id) return res.status(400).json({ error: 'Champs requis manquants' });
    try {
      const result = await pool.query(
        `INSERT INTO favorites (user_id, cocktail_id) VALUES ($1, $2)
         ON CONFLICT (user_id, cocktail_id) DO NOTHING RETURNING *`,
        [user_id, cocktail_id]
      );
      return res.json(result.rows[0] || {});
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else if (req.method === 'DELETE') {
    const user = authenticateToken(req);
    if (!user) return res.status(401).json({ error: 'Token manquant ou invalide' });
    const { user_id, cocktail_id } = req.query;
    if (!user_id || !cocktail_id) return res.status(400).json({ error: 'Champs requis manquants' });
    try {
      await pool.query('DELETE FROM favorites WHERE user_id = $1 AND cocktail_id = $2', [user_id, cocktail_id]);
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  }
}
