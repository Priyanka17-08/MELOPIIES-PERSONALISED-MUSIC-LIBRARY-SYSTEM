const db = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');

const getAll = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const [rows] = await db.execute(
    `SELECT a.*, COUNT(t.id) AS track_count
     FROM artists a LEFT JOIN tracks t ON t.artist_id = a.id
     GROUP BY a.id ORDER BY a.name LIMIT ? OFFSET ?`,
    [parseInt(limit), offset]
  );
  const [[{ total }]] = await db.execute('SELECT COUNT(*) AS total FROM artists');
  res.json({ success: true, data: rows, pagination: { total, page: +page, limit: +limit } });
});

const getOne = asyncHandler(async (req, res) => {
  const [rows] = await db.execute(
    `SELECT a.*, COUNT(t.id) AS track_count
     FROM artists a LEFT JOIN tracks t ON t.artist_id = a.id
     WHERE a.id = ? GROUP BY a.id`,
    [req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ success: false, message: 'Artist not found' });
  const [albums] = await db.execute('SELECT * FROM albums WHERE artist_id = ? ORDER BY release_year DESC', [req.params.id]);
  res.json({ success: true, data: { ...rows[0], albums } });
});

const create = asyncHandler(async (req, res) => {
  const { name, bio, country, formed_year, image_url } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'name is required' });
  const [result] = await db.execute(
    'INSERT INTO artists (name, bio, country, formed_year, image_url) VALUES (?,?,?,?,?)',
    [name, bio || null, country || null, formed_year || null, image_url || null]
  );
  res.status(201).json({ success: true, data: { id: result.insertId, name } });
});

const update = asyncHandler(async (req, res) => {
  const { name, bio, country, formed_year, image_url } = req.body;
  const [result] = await db.execute(
    `UPDATE artists SET
       name        = COALESCE(?, name),
       bio         = COALESCE(?, bio),
       country     = COALESCE(?, country),
       formed_year = COALESCE(?, formed_year),
       image_url   = COALESCE(?, image_url)
     WHERE id = ?`,
    [name||null, bio||null, country||null, formed_year||null, image_url||null, req.params.id]
  );
  if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Artist not found' });
  res.json({ success: true, message: 'Artist updated' });
});

const remove = asyncHandler(async (req, res) => {
  const [result] = await db.execute('DELETE FROM artists WHERE id = ?', [req.params.id]);
  if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Artist not found' });
  res.json({ success: true, message: 'Artist deleted' });
});

module.exports = { getAll, getOne, create, update, remove };