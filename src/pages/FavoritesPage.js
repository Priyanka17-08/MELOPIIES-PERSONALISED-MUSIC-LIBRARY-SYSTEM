import React, { useEffect, useState } from 'react';
import { getFavorites, removeFavorite } from '../services/api';
import YoutubeTrackEmbed from '../components/YoutubeTrackEmbed';

export default function FavoritesPage() {
  const [tracks,     setTracks]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [msg,        setMsg]        = useState('');
  const [nowPlaying, setNowPlaying] = useState(null);
  const [isPlaying,  setIsPlaying]  = useState(false);

  const flash = m => { setMsg(m); setTimeout(() => setMsg(''), 2500); };

  const load = async () => {
    setLoading(true);
    const { data } = await getFavorites();
    setTracks(data.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const playTrack = track => {
    if (nowPlaying?.id === track.id) {
      setIsPlaying(p => !p);
    } else {
      setNowPlaying(track);
      setIsPlaying(true);
    }
  };

  const handleRemove = async id => {
    await removeFavorite(id);
    setTracks(ts => ts.filter(t => t.id !== id));
    if (nowPlaying?.id === id) { setNowPlaying(null); setIsPlaying(false); }
    flash('Removed from favorites');
  };

  const fmtDuration = s => {
    if (!s) return '--:--';
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  };

  return (
    <div className="page">
      <h1>❤️ Your Favorites</h1>
      {msg && <div className="alert alert-success">{msg}</div>}

      {/* ── Player ── */}
      {nowPlaying && isPlaying && (
        <div className="expanded-player">
          <div className="expanded-player-header">
            <span>🎵 Now Playing: <b>{nowPlaying.title}</b> — {nowPlaying.artist_name}</span>
            <button onClick={() => { setNowPlaying(null); setIsPlaying(false); }} className="btn-close-player">✕</button>
          </div>
          <YoutubeTrackEmbed
            key={nowPlaying.id}
            title={nowPlaying.title}
            artistName={nowPlaying.artist_name}
            ytSearchUrl={`https://www.youtube.com/results?search_query=${encodeURIComponent(nowPlaying.title + ' ' + nowPlaying.artist_name)}`}
          />
        </div>
      )}

      {loading
        ? <div className="loading">Loading…</div>
        : tracks.length === 0
          ? <div className="empty-state">
              <p>You have not liked any tracks yet.</p>
              <p>Go to Tracks and tap 🤍 to add some!</p>
            </div>
          : (
            <div className="track-list">
              {tracks.map(t => (
                <div
                  key={t.id}
                  className={`track-card ${nowPlaying?.id === t.id ? 'now-playing' : ''}`}
                >
                  <div className="track-info">
                    <span className="track-title">
                      {nowPlaying?.id === t.id && isPlaying && <span className="playing-indicator">♪ </span>}
                      {t.title}
                    </span>
                    <span className="track-meta">{t.artist_name} · {t.album_title || 'Single'}</span>
                    <span className="track-meta">{t.genre_name || 'Unknown'} · {fmtDuration(t.duration_sec)}</span>
                  </div>
                  <div className="track-actions">

                    {/* Play/Pause */}
                    <button
                      className={`btn-play ${nowPlaying?.id === t.id && isPlaying ? 'playing' : ''}`}
                      onClick={() => playTrack(t)}
                      title={nowPlaying?.id === t.id && isPlaying ? 'Pause' : 'Play'}
                    >
                      {nowPlaying?.id === t.id && isPlaying ? '⏸' : '▶'}
                    </button>

                    {/* Remove from favorites */}
                    <button
                      className="btn-icon fav-active"
                      onClick={() => handleRemove(t.id)}
                      title="Remove from favorites"
                    >
                      ❤️
                    </button>

                    {/* YouTube */}
                    <button
                      className="btn-yt-icon"
                      onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(t.title + ' ' + t.artist_name)}`, '_blank')}
                      title="Open in YouTube"
                    >
                      <svg viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#FF0000"/>
                      </svg>
                    </button>

                    <span className="play-count">
                      ▶ {t.play_count >= 1000 ? (t.play_count / 1000).toFixed(1) + 'K' : t.play_count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )
      }
    </div>
  );
}