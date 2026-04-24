const db = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');

const getAll = asyncHandler(async (req, res) => {
  const [rows] = await db.execute(
    `SELECT al.*, a.name AS artist_name, COUNT(t.id) AS track_count
     FROM albums al
     JOIN artists a ON a.id = al.artist_id
     LEFT JOIN tracks t ON t.album_id = al.id
     GROUP BY al.id ORDER BY al.release_year DESC`
  );
  res.json({ success: true, data: rows });
});

const getOne = asyncHandler(async (req, res) => {
  const [albums] = await db.execute(
    'SELECT al.*, a.name AS artist_name FROM albums al JOIN artists a ON a.id = al.artist_id WHERE al.id = ?',
    [req.params.id]
  );
  if (!albums[0]) return res.status(404).json({ success: false, message: 'Album not found' });
  const [tracks] = await db.execute(
    `SELECT t.*, g.name AS genre_name FROM tracks t
     LEFT JOIN genres g ON g.id = t.genre_id
     WHERE t.album_id = ? ORDER BY t.track_number`,
    [req.params.id]
  );
  res.json({ success: true, data: { ...albums[0], tracks } });
});

const create = asyncHandler(async (req, res) => {
  const { title, artist_id, release_year, cover_url } = req.body;
  if (!title || !artist_id) return res.status(400).json({ success: false, message: 'title and artist_id are required' });
  const [result] = await db.execute(
    'INSERT INTO albums (title, artist_id, release_year, cover_url) VALUES (?,?,?,?)',
    [title, artist_id, release_year || null, cover_url || null]
  );
  res.status(201).json({ success: true, data: { id: result.insertId, title } });
});

const update = asyncHandler(async (req, res) => {
  const { title, artist_id, release_year, cover_url } = req.body;
  const [result] = await db.execute(
    `UPDATE albums SET
       title        = COALESCE(?, title),
       artist_id    = COALESCE(?, artist_id),
       release_year = COALESCE(?, release_year),
       cover_url    = COALESCE(?, cover_url)
     WHERE id = ?`,
    [title||null, artist_id||null, release_year||null, cover_url||null, req.params.id]
  );
  if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Album not found' });
  res.json({ success: true, message: 'Album updated' });
});

const remove = asyncHandler(async (req, res) => {
  const [result] = await db.execute('DELETE FROM albums WHERE id = ?', [req.params.id]);
  if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Album not found' });
  res.json({ success: true, message: 'Album deleted' });
});

module.exports = { getAll, getOne, create, update, remove };