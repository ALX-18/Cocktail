// /api/solid_ingredients.js
// Handler serverless Vercel pour les ingrédients solides (lecture depuis Supabase)

import { Pool } from 'pg';
const pool = new Pool({ connectionString: process.env.SUPABASE_DB_URL });

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const result = await pool.query('SELECT name FROM solid_ingredient ORDER BY name ASC');
      return res.json(result.rows.map(row => row.name));
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  }
}
