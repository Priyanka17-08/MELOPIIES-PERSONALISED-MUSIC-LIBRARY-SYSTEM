const db = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');

const search = asyncHandler(async (req, res) => {
  const { q, type = 'title' } = req.query;
  if (!q || q.trim().length < 1) {
    return res.status(400).json({ success: false, message: 'Query param "q" is required' });
  }

  const like = `%${q.trim()}%`;

  let whereClause;
  if (type === 'artist')     whereClause = 'WHERE a.name LIKE ?';
  else if (type === 'genre') whereClause = 'WHERE g.name LIKE ?';
  else                       whereClause = 'WHERE t.title LIKE ?';

  const [rows] = await db.execute(
    `SELECT t.id, t.title, t.duration_sec, t.play_count,
            a.name AS artist_name, al.title AS album_title, g.name AS genre_name
     FROM tracks t
     JOIN artists a ON a.id = t.artist_id
     LEFT JOIN albums al ON al.id = t.album_id
     LEFT JOIN genres g  ON g.id  = t.genre_id
     ${whereClause}
     ORDER BY t.title`,
    [like]
  );

  res.json({ success: true, data: rows });
});

module.exports = { search };