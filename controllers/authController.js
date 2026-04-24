const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const db     = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 10;

const signToken = user =>
  jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

const signup = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ success: false, message: 'username, email and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }
  const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const [result] = await db.execute(
    'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
    [username.trim(), email.trim().toLowerCase(), hash]
  );
  const user = { id: result.insertId, username, role: 'user' };
  res.status(201).json({ success: true, token: signToken(user), user: { id: user.id, username, email } });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'email and password are required' });
  }
  const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  res.json({
    success: true,
    token: signToken(user),
    user: { id: user.id, username: user.username, email: user.email, role: user.role },
  });
});

const getMe = asyncHandler(async (req, res) => {
  const [rows] = await db.execute(
    'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
    [req.user.id]
  );
  if (!rows[0]) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: rows[0] });
});

module.exports = { signup, login, getMe };