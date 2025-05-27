// /api/admin/users.js
// Handler serverless Vercel pour la gestion admin des utilisateurs (GET, PATCH)
// Utilise la BDD Supabase pour GET/PATCH admin/users, avec authentification JWT admin.

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
      const result = await pool.query('SELECT id, email, username, role FROM users ORDER BY username ASC');
      return res.json(result.rows);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else if (req.method === 'PATCH') {
    const { id, role } = req.body;
    if (!['user', 'admin'].includes(role)) return res.status(400).json({ error: 'Rôle invalide' });
    try {
      const result = await pool.query('UPDATE users SET role = $1 WHERE id = $2 RETURNING id, username, role', [role, id]);
      if (result.rowCount === 0) return res.status(404).json({ error: 'Utilisateur non trouvé' });
      return res.json(result.rows[0]);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  }
}
