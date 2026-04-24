const { asyncHandler } = require('../middleware/errorHandler');

const CACHE = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000;
const MAX_Q = 200;

/**
 * Returns first search result video id for embedding.
 * Requires YOUTUBE_API_KEY in .env (YouTube Data API v3).
 */
const firstVideo = asyncHandler(async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (!q || q.length > MAX_Q) {
    return res.status(400).json({ success: false, message: `Query q required (max ${MAX_Q} chars)` });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return res.json({ success: true, videoId: null, configured: false });
  }

  const cacheKey = q.toLowerCase();
  const cached = CACHE.get(cacheKey);
  if (cached && Date.now() - cached.t < CACHE_TTL_MS) {
    return res.json({
      success: true,
      videoId: cached.videoId,
      configured: true,
      cached: true,
    });
  }

  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('type', 'video');
  url.searchParams.set('maxResults', '1');
  url.searchParams.set('q', q);
  url.searchParams.set('key', apiKey);

  const r = await fetch(url);
  const body = await r.json().catch(() => ({}));

  if (!r.ok) {
    const msg = body.error?.message || 'YouTube API request failed';
    console.error('[youtube] API error', r.status, msg);
    return res.status(502).json({ success: false, message: msg });
  }

  const videoId = body.items?.[0]?.id?.videoId || null;
  CACHE.set(cacheKey, { videoId, t: Date.now() });

  res.json({ success: true, videoId, configured: true, cached: false });
});

module.exports = { firstVideo };
