const db = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');

const getFavorites = asyncHandler(async (req, res) => {
  const [rows] = await db.execute(
    `SELECT t.*, a.name AS artist_name, al.title AS album_title, g.name AS genre_name, f.created_at AS liked_at
     FROM favorites f
     JOIN tracks t   ON t.id  = f.track_id
     JOIN artists a  ON a.id  = t.artist_id
     LEFT JOIN albums al ON al.id = t.album_id
     LEFT JOIN genres g  ON g.id  = t.genre_id
     WHERE f.user_id = ? ORDER BY f.created_at DESC`,
    [req.user.id]
  );
  res.json({ success: true, data: rows });
});

const addFavorite = asyncHandler(async (req, res) => {
  const [track] = await db.execute('SELECT id FROM tracks WHERE id = ?', [req.params.trackId]);
  if (!track[0]) return res.status(404).json({ success: false, message: 'Track not found' });
  await db.execute(
    'INSERT IGNORE INTO favorites (user_id, track_id) VALUES (?, ?)',
    [req.user.id, req.params.trackId]
  );
  res.status(201).json({ success: true, message: 'Added to favorites' });
});

const removeFavorite = asyncHandler(async (req, res) => {
  await db.execute(
    'DELETE FROM favorites WHERE user_id = ? AND track_id = ?',
    [req.user.id, req.params.trackId]
  );
  res.json({ success: true, message: 'Removed from favorites' });
});

module.exports = { getFavorites, addFavorite, removeFavorite };