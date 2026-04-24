import React, { useEffect, useState, useCallback } from 'react';
import { getTracks, getFavorites, addFavorite, removeFavorite, getPlaylists, addToPlaylist } from '../services/api';
import TrackCard   from '../components/TrackCard';
import MusicPlayer from '../components/MusicPlayer';

export default function TracksPage() {
  const [tracks,     setTracks]     = useState([]);
  const [favIds,     setFavIds]     = useState(new Set());
  const [playlists,  setPlaylists]  = useState([]);
  const [page,       setPage]       = useState(1);
  const [total,      setTotal]      = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [msg,        setMsg]        = useState('');
  const [nowPlaying, setNowPlaying] = useState(null);

  const flash = m => { setMsg(m); setTimeout(() => setMsg(''), 2500); };

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
    } catch (err) {
      setError('Failed to load tracks. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(page); }, [page, load]);

  const toggleFav = async id => {
    try {
      if (favIds.has(id)) {
        await removeFavorite(id);
        setFavIds(s => { const n = new Set(s); n.delete(id); return n; });
        flash('Removed from favorites');
      } else {
        await addFavorite(id);
        setFavIds(s => new Set(s).add(id));
        flash('Added to favorites ❤️');
      }
    } catch { flash('Something went wrong'); }
  };

  const handleAddToPlaylist = async trackId => {
    const name = window.prompt('Enter playlist name:');
    if (!name) return;
    const target = playlists.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (target) { await addToPlaylist(target.id, trackId); flash('Added to playlist!'); }
    else flash('Playlist not found. Create it in Playlists tab first.');
  };

  const totalPages = Math.ceil(total / 20) || 1;

  return (
    <div className="page">
      <h1>🎵 All Tracks</h1>
      {msg   && <div className="alert alert-success">{msg}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {nowPlaying && (
        <MusicPlayer track={nowPlaying} onClose={() => setNowPlaying(null)} />
      )}

      {loading
        ? <div className="loading">Loading tracks…</div>
        : tracks.length === 0
          ? <div className="empty-state"><p>No tracks found.</p></div>
          : (
            <>
              <div className="track-list">
                {tracks.map(t => (
                  <TrackCard
                    key={t.id}
                    track={t}
                    isFav={favIds.has(t.id)}
                    onToggleFav={toggleFav}
                    onAddToPlaylist={handleAddToPlaylist}
                    onPlay={setNowPlaying}
                  />
                ))}
              </div>
              <div className="pagination">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                <span>Page {page} of {totalPages}</span>
                <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
              </div>
            </>
          )
      }
    </div>
  );
}