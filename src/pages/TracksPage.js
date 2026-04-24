import React, { useEffect, useState, useCallback } from 'react';
import { getTracks, getFavorites, addFavorite, removeFavorite, getPlaylists, addToPlaylist } from '../services/api';
import YoutubeTrackEmbed from '../components/YoutubeTrackEmbed';

const fmtDuration = s => {
  if (!s) return '--:--';
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

const YTIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#FF0000"/>
  </svg>
);

export default function TracksPage() {
  const [tracks, setTracks] = useState([]);
  const [favIds, setFavIds] = useState(new Set());
  const [playlists, setPlaylists] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [nowPlaying, setNowPlaying] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const flash = m => {
    setMsg(m);
    setTimeout(() => setMsg(''), 2500);
  };

  const load = useCallback(async p => {
    setLoading(true);
    setError('');
    try {
      const [t, f, pl] = await Promise.all([
        getTracks(p),
        getFavorites().catch(() => ({ data: { data: [] } })),
        getPlaylists().catch(() => ({ data: { data: [] } })),
      ]);
      setTracks(t.data.data || []);
      setTotal(t.data.pagination?.total || 0);
      setFavIds(new Set((f.data.data || []).map(x => x.id)));
      setPlaylists((pl.data.data || []).filter(x => x.user_id));
    } catch {
      setError('Failed to load tracks. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(page); }, [page, load]);

  const playTrack = track => {
    if (nowPlaying?.id === track.id) {
      setIsPlaying(p => !p);
    } else {
      setNowPlaying(track);
      setIsPlaying(true);
    }
  };

  const toggleFav = async id => {
    try {
      if (favIds.has(id)) {
        await removeFavorite(id);
        setFavIds(s => {
          const n = new Set(s);
          n.delete(id);
          return n;
        });
        flash('Removed from favorites');
      } else {
        await addFavorite(id);
        setFavIds(s => new Set(s).add(id));
        flash('Added to favorites ❤️');
      }
    } catch {
      flash('Something went wrong');
    }
  };

  const handleAddToPlaylist = async trackId => {
    if (playlists.length === 0) {
      flash('No playlists found!');
      return;
    }
    const names = playlists.map((p, i) => `${i + 1}. ${p.name}`).join('\n');
    const input = window.prompt(`Choose playlist:\n${names}\n\nType playlist name:`);
    if (!input) return;
    const target = playlists.find(p => p.name.toLowerCase() === input.toLowerCase());
    if (target) {
      await addToPlaylist(target.id, trackId);
      flash('Added to playlist! 🎧');
    } else {
      flash('Playlist not found!');
    }
  };

  const totalPages = Math.ceil(total / 20) || 1;

  const ytSearchUrl = track =>
    `https://www.youtube.com/results?search_query=${encodeURIComponent(track.title + ' ' + track.artist_name)}`;

  return (
    <div className="page">
      <h1>🎵 All Tracks</h1>

      {msg && <div className="alert alert-success">{msg}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* MINI PLAYER */}
      {nowPlaying && (
        <div className="mini-player">
          <div className="mini-player-left">
            <button onClick={() => setIsPlaying(p => !p)}>
              {isPlaying ? '⏸' : '▶'}
            </button>
            <div>
              <span>{nowPlaying.title}</span>
              <span>{nowPlaying.artist_name}</span>
            </div>
          </div>

          <div className="mini-player-right">
            <a
              href={ytSearchUrl(nowPlaying)}
              target="_blank"
              rel="noreferrer"
              className="mini-yt-link"
            >
              <YTIcon />
            </a>

            <button onClick={() => { setNowPlaying(null); setIsPlaying(false); }}>
              ✕
            </button>
          </div>
        </div>
      )}

      {/* EXPANDED PLAYER */}
      {nowPlaying && isPlaying && (
        <div className="expanded-player">
          <div>
            🎵 <b>{nowPlaying.title}</b> — {nowPlaying.artist_name}
          </div>

          <YoutubeTrackEmbed
            title={nowPlaying.title}
            artistName={nowPlaying.artist_name}
            ytSearchUrl={ytSearchUrl(nowPlaying)}
          />

          <a
            href={ytSearchUrl(nowPlaying)}
            target="_blank"
            rel="noreferrer"
          >
            🔗 Open full video on YouTube
          </a>
        </div>
      )}

      {/* TRACK LIST — uses classes from App.css (same as Favorites) */}
      {loading ? (
        <div className="loading">Loading…</div>
      ) : tracks.length === 0 ? (
        <div className="empty-state">
          <p>No tracks in the library yet.</p>
        </div>
      ) : (
        <>
          <div className="track-list">
            {tracks.map(t => (
              <div
                key={t.id}
                className={`track-card ${nowPlaying?.id === t.id ? 'now-playing' : ''}`}
              >
                <div className="track-info">
                  <span className="track-title">
                    {nowPlaying?.id === t.id && isPlaying && (
                      <span className="playing-indicator">♪ </span>
                    )}
                    {t.title}
                  </span>
                  <span className="track-meta">
                    {t.artist_name} · {t.album_title || 'Single'}
                  </span>
                  <span className="track-meta">
                    {t.genre_name || 'Unknown'} · {fmtDuration(t.duration_sec)}
                  </span>
                </div>
                <div className="track-actions">
                  <button
                    type="button"
                    className={`btn-play ${nowPlaying?.id === t.id && isPlaying ? 'playing' : ''}`}
                    onClick={() => playTrack(t)}
                    title={nowPlaying?.id === t.id && isPlaying ? 'Pause' : 'Play'}
                  >
                    {nowPlaying?.id === t.id && isPlaying ? '⏸' : '▶'}
                  </button>
                  <button
                    type="button"
                    className={`btn-icon ${favIds.has(t.id) ? 'fav-active' : ''}`}
                    onClick={() => toggleFav(t.id)}
                    title={favIds.has(t.id) ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    {favIds.has(t.id) ? '❤️' : '🤍'}
                  </button>
                  <button
                    type="button"
                    className="btn-icon"
                    onClick={() => handleAddToPlaylist(t.id)}
                    title="Add to playlist"
                  >
                    ➕
                  </button>
                  <button
                    type="button"
                    className="btn-yt-icon"
                    onClick={() => window.open(ytSearchUrl(t), '_blank')}
                    title="Open in YouTube"
                  >
                    <YTIcon />
                  </button>
                  <span className="play-count">
                    ▶{' '}
                    {t.play_count >= 1000
                      ? (t.play_count / 1000).toFixed(1) + 'K'
                      : t.play_count ?? 0}
                  </span>
                  


                </div>
              </div>
            ))}
          </div>

          <div className="pagination">
            <button type="button" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              Prev
            </button>
            <span>
              {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}