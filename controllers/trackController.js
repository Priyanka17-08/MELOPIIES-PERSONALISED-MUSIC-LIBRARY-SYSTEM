const db = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');

const TRACK_SELECT = `
  SELECT t.*, a.name AS artist_name, al.title AS album_title, g.name AS genre_name
  FROM tracks t
  JOIN artists a ON a.id = t.artist_id
  LEFT JOIN albums al ON al.id = t.album_id
  LEFT JOIN genres g  ON g.id  = t.genre_id
`;
const getAll = asyncHandler(async (req, res) => {
  const page   = parseInt(req.query.page)  || 1;
  const limit  = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const [rows] = await db.execute(
    `${TRACK_SELECT} ORDER BY t.title LIMIT ${limit} OFFSET ${offset}`
  );
  const [[{ total }]] = await db.execute('SELECT COUNT(*) AS total FROM tracks');
  res.json({ success: true, data: rows, pagination: { total, page, limit } });
});

const getOne = asyncHandler(async (req, res) => {
  const [rows] = await db.execute(`${TRACK_SELECT} WHERE t.id = ?`, [req.params.id]);
  if (!rows[0]) return res.status(404).json({ success: false, message: 'Track not found' });
  res.json({ success: true, data: rows[0] });
});

const create = asyncHandler(async (req, res) => {
  const { title, artist_id, album_id, genre_id, duration_sec, track_number, file_url } = req.body;
  if (!title || !artist_id) {
    return res.status(400).json({ success: false, message: 'title and artist_id are required' });
  }
  const [result] = await db.execute(
    'INSERT INTO tracks (title, artist_id, album_id, genre_id, duration_sec, track_number, file_url) VALUES (?,?,?,?,?,?,?)',
    [title, artist_id, album_id||null, genre_id||null, duration_sec||null, track_number||null, file_url||null]
  );
  res.status(201).json({ success: true, data: { id: result.insertId, title } });
});

const update = asyncHandler(async (req, res) => {
  const { title, artist_id, album_id, genre_id, duration_sec, track_number, file_url } = req.body;
  const [result] = await db.execute(
    `UPDATE tracks SET
       title        = COALESCE(?, title),
       artist_id    = COALESCE(?, artist_id),
       album_id     = COALESCE(?, album_id),
       genre_id     = COALESCE(?, genre_id),
       duration_sec = COALESCE(?, duration_sec),
       track_number = COALESCE(?, track_number),
       file_url     = COALESCE(?, file_url)
     WHERE id = ?`,
    [title||null, artist_id||null, album_id||null, genre_id||null,
     duration_sec||null, track_number||null, file_url||null, req.params.id]
  );
  if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Track not found' });
  res.json({ success: true, message: 'Track updated' });
});

const remove = asyncHandler(async (req, res) => {
  const [result] = await db.execute('DELETE FROM tracks WHERE id = ?', [req.params.id]);
  if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Track not found' });
  res.json({ success: true, message: 'Track deleted' });
});

const incrementPlay = asyncHandler(async (req, res) => {
  await db.execute('UPDATE tracks SET play_count = play_count + 1 WHERE id = ?', [req.params.id]);
  await db.execute('INSERT INTO listening_history (user_id, track_id) VALUES (?, ?)', [req.user.id, req.params.id]);
  res.json({ success: true, message: 'Play recorded' });
});

module.exports = { getAll, getOne, create, update, remove, incrementPlay };