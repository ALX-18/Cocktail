import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.SUPABASE_DB_URL });

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { search } = req.query;
    try {
      let query = 'SELECT * FROM cocktails';
      let values = [];
      if (search) {
        query += ' WHERE name ILIKE $1 OR $1 = ANY(ingredients)';
        values.push(`%${search}%`);
      }
      const result = await pool.query(query, values);
      return res.json(result.rows);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'POST') {
    const { name, description, ingredients, instructions, user_id } = req.body;
    if (!name || !ingredients || !instructions) {
      return res.status(400).json({ error: 'Champs requis manquants.' });
    }
    try {
      const result = await pool.query(
        'INSERT INTO cocktails (name, description, ingredients, instructions, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, description || '', ingredients, instructions, user_id || null]
      );
      return res.status(201).json(result.rows[0]);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'id requis' });
    try {
      const result = await pool.query('DELETE FROM cocktails WHERE id = $1', [id]);
      if (result.rowCount === 0) return res.status(404).json({ error: 'Cocktail non trouvé' });
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  }
}
