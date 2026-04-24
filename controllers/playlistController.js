const db = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');

const getAll = asyncHandler(async (req, res) => {
  const [rows] = await db.execute(
    `SELECT p.*, u.username AS owner, COUNT(pt.track_id) AS track_count
     FROM playlists p
     JOIN users u ON u.id = p.user_id
     LEFT JOIN playlist_tracks pt ON pt.playlist_id = p.id
     WHERE p.user_id = ? OR p.is_public = TRUE
     GROUP BY p.id ORDER BY p.created_at DESC`,
    [req.user.id]
  );
  res.json({ success: true, data: rows });
});

const getOne = asyncHandler(async (req, res) => {
  const [playlist] = await db.execute(
    'SELECT p.*, u.username AS owner FROM playlists p JOIN users u ON u.id = p.user_id WHERE p.id = ?',
    [req.params.id]
  );
  if (!playlist[0]) return res.status(404).json({ success: false, message: 'Playlist not found' });
  const p = playlist[0];
  if (!p.is_public && p.user_id !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  const [tracks] = await db.execute(
    `SELECT t.*, a.name AS artist_name, pt.position
     FROM playlist_tracks pt
     JOIN tracks t  ON t.id  = pt.track_id
     JOIN artists a ON a.id = t.artist_id
     WHERE pt.playlist_id = ? ORDER BY pt.position`,
    [req.params.id]
  );
  res.json({ success: true, data: { ...p, tracks } });
});

const create = asyncHandler(async (req, res) => {
  const { name, description, is_public = false } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'name is required' });
  const [result] = await db.execute(
    'INSERT INTO playlists (name, user_id, description, is_public) VALUES (?,?,?,?)',
    [name, req.user.id, description || null, is_public ? 1 : 0]
  );
  res.status(201).json({ success: true, data: { id: result.insertId, name } });
});

const update = asyncHandler(async (req, res) => {
  const { name, description, is_public } = req.body;
  const [result] = await db.execute(
    `UPDATE playlists SET
       name        = COALESCE(?, name),
       description = COALESCE(?, description),
       is_public   = COALESCE(?, is_public)
     WHERE id = ? AND user_id = ?`,
    [name||null, description||null, is_public != null ? +is_public : null, req.params.id, req.user.id]
  );
  if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Playlist not found' });
  res.json({ success: true, message: 'Playlist updated' });
});

const remove = asyncHandler(async (req, res) => {
  const [result] = await db.execute(
    'DELETE FROM playlists WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id]
  );
  if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Playlist not found' });
  res.json({ success: true, message: 'Playlist deleted' });
});

const addTrack = asyncHandler(async (req, res) => {
  const { track_id, position = 0 } = req.body;
  if (!track_id) return res.status(400).json({ success: false, message: 'track_id is required' });
  const [pl] = await db.execute('SELECT id FROM playlists WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  if (!pl[0]) return res.status(404).json({ success: false, message: 'Playlist not found' });
  await db.execute(
    'INSERT IGNORE INTO playlist_tracks (playlist_id, track_id, position) VALUES (?,?,?)',
    [req.params.id, track_id, position]
  );
  res.json({ success: true, message: 'Track added to playlist' });
});

const removeTrack = asyncHandler(async (req, res) => {
  const [pl] = await db.execute('SELECT id FROM playlists WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  if (!pl[0]) return res.status(404).json({ success: false, message: 'Playlist not found' });
  await db.execute(
    'DELETE FROM playlist_tracks WHERE playlist_id = ? AND track_id = ?',
    [req.params.id, req.params.trackId]
  );
  res.json({ success: true, message: 'Track removed from playlist' });
});

module.exports = { getAll, getOne, create, update, remove, addTrack, removeTrack };