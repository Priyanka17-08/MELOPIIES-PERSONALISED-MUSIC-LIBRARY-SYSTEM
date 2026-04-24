const db = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');

const topTracks = asyncHandler(async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const [rows] = await db.execute(
      `SELECT t.id, t.title, t.play_count,
              a.name AS artist_name,
              COUNT(f.user_id) AS like_count
       FROM tracks t
       JOIN artists a ON a.id = t.artist_id
       LEFT JOIN favorites f ON f.track_id = t.id
       GROUP BY t.id, t.title, t.play_count, a.name
       ORDER BY like_count DESC, t.play_count DESC
       LIMIT ${limit}`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('topTracks error:', err.message);
    res.json({ success: true, data: [] });
  }
});

const genrePreferences = asyncHandler(async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT g.name AS genre, COUNT(*) AS count
       FROM favorites f
       JOIN tracks t ON t.id = f.track_id
       JOIN genres g ON g.id = t.genre_id
       WHERE f.user_id = ${req.user.id}
       GROUP BY g.id, g.name
       ORDER BY count DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('genrePreferences error:', err.message);
    res.json({ success: true, data: [] });
  }
});

const mostActiveArtists = asyncHandler(async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const [rows] = await db.execute(
      `SELECT a.id, a.name,
              COUNT(t.id) AS track_count,
              SUM(t.play_count) AS total_plays
       FROM artists a
       JOIN tracks t ON t.artist_id = a.id
       GROUP BY a.id, a.name
       ORDER BY total_plays DESC
       LIMIT ${limit}`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('mostActiveArtists error:', err.message);
    res.json({ success: true, data: [] });
  }
});

const listeningHistory = asyncHandler(async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const [rows] = await db.execute(
      `SELECT t.title, a.name AS artist_name, lh.played_at
       FROM listening_history lh
       JOIN tracks t  ON t.id = lh.track_id
       JOIN artists a ON a.id = t.artist_id
       WHERE lh.user_id = ${req.user.id}
       ORDER BY lh.played_at DESC
       LIMIT ${limit}`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('listeningHistory error:', err.message);
    res.json({ success: true, data: [] });
  }
});

module.exports = { topTracks, genrePreferences, mostActiveArtists, listeningHistory };