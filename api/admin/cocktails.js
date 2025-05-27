// /api/admin/cocktails.js
// Handler serverless Vercel pour la gestion admin des cocktails (GET, DELETE)
// Utilise la BDD Supabase pour GET/DELETE admin/cocktails, avec authentification JWT admin.

import { Pool } from 'pg';
const pool = new Pool({ connectionString: process.env.SUPABASE_DB_URL });
import jwt from 'jsonwebtoken';

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
  const user = authenticateToken(req);
  if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Accès refusé : Admin uniquement' });

  if (req.method === 'GET') {
    try {
      const result = await pool.query('SELECT * FROM cocktails');
      return res.json(result.rows);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'id requis' });
    try {
      const result = await pool.query('DELETE FROM cocktails WHERE id = $1', [id]);
      if (result.rowCount === 0) return res.status(404).json({ error: 'Cocktail non trouvé' });
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  }
}
