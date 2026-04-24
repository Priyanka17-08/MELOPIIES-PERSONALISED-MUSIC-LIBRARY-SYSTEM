require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const morgan    = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes    = require('./routes/auth');
const artistRoutes  = require('./routes/artists');
const trackRoutes   = require('./routes/tracks');
const { albumRouter, playlistRouter, favoriteRouter, searchRouter, analyticsRouter } = require('./routes/misc');
const youtubeRoutes = require('./routes/youtube');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests' },
});
app.use('/api', limiter);

app.use('/api/auth',      authRoutes);
app.use('/api/artists',   artistRoutes);
app.use('/api/tracks',    trackRoutes);
app.use('/api/albums',    albumRouter);
app.use('/api/playlists', playlistRouter);
app.use('/api/favorites', favoriteRouter);
app.use('/api/search',    searchRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/youtube', youtubeRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` }));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🎵  Music Library API running on http://localhost:${PORT}`));

module.exports = app;
