import React, { useEffect, useState } from 'react';
import { getTopTracks, getMostActiveArtists, getGenrePreferences, search, getFavorites, addFavorite, removeFavorite, createTrack, getArtists } from '../services/api';
import { useAuth } from '../context/AuthContext';

const YTIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#FF0000"/>
  </svg>
);

const fmtDuration = s => {
  if (!s) return '--:--';
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
};

export default function DashboardPage() {
  const { user } = useAuth();

  const [topTracks, setTopTracks] = useState([]);
  const [artists,   setArtists]   = useState([]);
  const [genres,    setGenres]    = useState([]);
  const [loading,   setLoading]   = useState(true);

  const [q,          setQ]          = useState('');
  const [searchType, setSearchType] = useState('title');
  const [libResults, setLibResults] = useState([]);
  const [ytResults,  setYtResults]  = useState([]);
  const [favIds,     setFavIds]     = useState(new Set());
  const [searching,  setSearching]  = useState(false);
  const [searched,   setSearched]   = useState(false);
  const [activeTab,  setActiveTab]  = useState('library');
  const [addedIds,   setAddedIds]   = useState(new Set());
  const [msg,        setMsg]        = useState('');
  const [nowPlaying, setNowPlaying] = useState(null);

  const flash = m => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  useEffect(() => {
    const load = async () => {
      try {
        const [t, a, g, f] = await Promise.all([
          getTopTracks().catch(() => ({ data: { data: [] } })),
          getMostActiveArtists().catch(() => ({ data: { data: [] } })),
          getGenrePreferences().catch(() => ({ data: { data: [] } })),
          getFavorites().catch(() => ({ data: { data: [] } })),
        ]);
        setTopTracks(t.data.data || []);
        setArtists(a.data.data || []);
        setGenres(g.data.data || []);
        setFavIds(new Set((f.data.data || []).map(x => x.id)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSearch = async e => {
    e.preventDefault();
    if (!q.trim()) return;
    setSearching(true);
    setSearched(true);
    setActiveTab('library');
    setNowPlaying(null);

    try {
      const [r, f] = await Promise.all([
        search(q.trim(), searchType).catch(() => ({ data: { data: [] } })),
        getFavorites().catch(() => ({ data: { data: [] } })),
      ]);

      setLibResults(r.data.data || []);
      setFavIds(new Set((f.data.data || []).map(x => x.id)));

      const searches = [
        q.trim(),
        q.trim() + ' official video',
        q.trim() + ' full song',
        q.trim() + ' audio',
        q.trim() + ' lyrics',
        q.trim() + ' HD',
        q.trim() + ' official audio',
        q.trim() + ' music video',
      ];

      setYtResults(searches.map((s, i) => ({
        id:    'yt-' + i,
        title: s,
        ytUrl: 'https://www.youtube.com/results?search_query=' + encodeURIComponent(s),
      })));

    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

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

  const handleAddToLibrary = async item => {
    if (addedIds.has(item.id)) { flash('Already added!'); return; }
    try {
      const artistsRes = await getArtists();
      const artistList = artistsRes.data.data || [];
      const artistId   = artistList[0]?.id || 1;
      await createTrack({ title: item.title, artist_id: artistId, genre_id: 1 });
      setAddedIds(s => new Set(s).add(item.id));
      flash('Added to library! Check Tracks page.');
    } catch {
      flash('Failed to add. Login as admin first.');
    }
  };

  const clearSearch = () => {
    setQ('');
    setSearched(false);
    setLibResults([]);
    setYtResults([]);
    setNowPlaying(null);
  };

  const openYoutube = url => {
    window.open(url, '_blank');
  };

  if (loading) return <div className="loading">Loading dashboard…</div>;

  return (
    <div className="page">
      <h1>Welcome back, {user?.username} 👋</h1>

      {msg && <div className="alert alert-success">{msg}</div>}

      {/* ── Search Bar ── */}
      <div className="dash-search-wrap">
        <form onSubmit={handleSearch}>
          <div className="dash-search-box">
            <span className="dash-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search any song by name… e.g. Raanjhan, Perfect, Bardali"
              value={q}
              onChange={e => { setQ(e.target.value); if (!e.target.value) clearSearch(); }}
              className="dash-search-input"
            />
            {q && (
              <button type="button" onClick={clearSearch}
                style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: '1rem', padding: '0 6px' }}>
                ✕
              </button>
            )}
            <div className="dash-search-types">
              {['title', 'artist', 'genre'].map(t => (
                <button key={t} type="button"
                  className={searchType === t ? 'dash-type-btn active' : 'dash-type-btn'}
                  onClick={() => setSearchType(t)}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <button type="submit" className="dash-search-btn">Search</button>
          </div>
        </form>
      </div>

      {/* ── Now Playing Bar ── */}
      {nowPlaying && (
        <div className="mini-player" style={{ marginBottom: '1rem' }}>
          <div className="mini-player-left">
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'var(--accent)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '1.1rem', animation: 'beatPulse 1s ease-in-out infinite'
            }}>
              🎵
            </div>
            <div className="mini-player-info">
              <span className="mini-player-title">{nowPlaying.title}</span>
              <span className="mini-player-artist">Click YouTube to listen</span>
            </div>
          </div>
          <div className="mini-player-right">
            <button
              className="btn-primary"
              style={{ padding: '6px 16px', fontSize: '0.85rem', borderRadius: '20px' }}
              onClick={() => openYoutube(nowPlaying.ytUrl)}
            >
              ▶ Play on YouTube
            </button>
            <button className="mini-close-btn" onClick={() => setNowPlaying(null)}>✕</button>
          </div>
        </div>
      )}

      {/* ── Search Results ── */}
      {searching && <div className="loading">Searching…</div>}

      {!searching && searched && (
        <div style={{ marginBottom: '2rem' }}>

          {/* Tabs */}
          <div className="search-tabs">
            <button
              className={activeTab === 'library' ? 'search-tab active' : 'search-tab'}
              onClick={() => setActiveTab('library')}
            >
              📚 My Library {libResults.length > 0 && '(' + libResults.length + ')'}
            </button>
            <button
              className={activeTab === 'youtube' ? 'search-tab active' : 'search-tab'}
              onClick={() => setActiveTab('youtube')}
            >
              ▶ YouTube ({ytResults.length})
            </button>
          </div>

          {/* Library Tab */}
          {activeTab === 'library' && (
            <div>
              {libResults.length === 0
                ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text2)' }}>
                    <p style={{ marginBottom: '12px' }}>
                      No songs found in your library for "<b style={{ color: 'var(--text)' }}>{q}</b>"
                    </p>
                    <button className="btn-primary" onClick={() => setActiveTab('youtube')}>
                      ▶ Search on YouTube instead
                    </button>
                  </div>
                )
                : (
                  <div className="track-list">
                    {libResults.map(t => (
                      <div key={t.id} className="track-card">
                        <div className="track-info">
                          <span className="track-title">{t.title}</span>
                          <span className="track-meta">{t.artist_name} · {t.album_title || 'Single'}</span>
                          <span className="track-meta">{t.genre_name || 'Unknown'} · {fmtDuration(t.duration_sec)}</span>
                        </div>
                        <div className="track-actions">
                          <button
                            className="btn-play"
                            onClick={() => {
                              setNowPlaying({
                                title: t.title + ' - ' + t.artist_name,
                                ytUrl: 'https://www.youtube.com/results?search_query=' + encodeURIComponent(t.title + ' ' + t.artist_name),
                              });
                              openYoutube('https://www.youtube.com/results?search_query=' + encodeURIComponent(t.title + ' ' + t.artist_name));
                            }}
                            title="Play on YouTube"
                          >
                            ▶
                          </button>
                          <button
                            className={favIds.has(t.id) ? 'btn-icon fav-active' : 'btn-icon'}
                            onClick={() => toggleFav(t.id)}
                          >
                            {favIds.has(t.id) ? '❤️' : '🤍'}
                          </button>
                          <button
                            className="btn-yt-icon"
                            onClick={() => openYoutube('https://www.youtube.com/results?search_query=' + encodeURIComponent(t.title + ' ' + t.artist_name))}
                          >
                            <YTIcon />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              }
            </div>
          )}

          {/* YouTube Tab */}
          {activeTab === 'youtube' && (
            <div>
              <p style={{ color: 'var(--text2)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                Click ▶ Play to open on YouTube · ➕ Add to save in your library
              </p>
              <div className="track-list">
                {ytResults.map(item => (
                  <div key={item.id} className="track-card">
                    <div className="track-info">
                      <span className="track-title">{item.title}</span>
                      <span className="track-meta">YouTube Search Result · Click Play to open</span>
                    </div>
                    <div className="track-actions">

                      {/* Play — opens YouTube directly */}
                      <button
                        className="btn-play"
                        onClick={() => {
                          setNowPlaying(item);
                          openYoutube(item.ytUrl);
                        }}
                        title="Play on YouTube"
                      >
                        ▶
                      </button>

                      {/* Add to Library */}
                      <button
                        onClick={() => handleAddToLibrary(item)}
                        style={{
                          background:   addedIds.has(item.id) ? 'var(--success)' : 'var(--accent)',
                          color:        '#fff',
                          border:       'none',
                          padding:      '6px 14px',
                          borderRadius: '20px',
                          cursor:       'pointer',
                          fontSize:     '0.8rem',
                          fontWeight:   '600',
                          transition:   'all 0.2s',
                          whiteSpace:   'nowrap',
                        }}
                      >
                        {addedIds.has(item.id) ? '✅ Added' : '➕ Add to Library'}
                      </button>

                      {/* YouTube Icon */}
                      <button
                        className="btn-yt-icon"
                        onClick={() => openYoutube(item.ytUrl)}
                        title="Open on YouTube"
                      >
                        <YTIcon />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button className="btn-clear-search" onClick={clearSearch}>
            ✕ Clear search — back to dashboard
          </button>
        </div>
      )}

      {/* ── Dashboard Cards ── */}
      {!searched && (
        <div className="dashboard-grid">

          <section className="dash-card">
            <h2>🔥 Top Liked Tracks</h2>
            {topTracks.length === 0
              ? <p className="empty">Like some tracks to see them here!</p>
              : (
                <ol className="dash-list">
                  {topTracks.slice(0, 8).map(t => (
                    <li key={t.id} className="dash-list-item">
                      <span className="dash-item-title">{t.title}</span>
                      <span className="dash-item-meta">{t.artist_name}</span>
                      <span className="dash-item-badge">❤️ {t.like_count}</span>
                    </li>
                  ))}
                </ol>
              )
            }
          </section>

          <section className="dash-card">
            <h2>🎤 Most Active Artists</h2>
            {artists.length === 0
              ? <p className="empty">No data yet</p>
              : (
                <ol className="dash-list">
                  {artists.slice(0, 8).map(a => (
                    <li key={a.id} className="dash-list-item">
                      <span className="dash-item-title">{a.name}</span>
                      <span className="dash-item-meta">{a.track_count} tracks</span>
                      <span className="dash-item-badge">▶ {Number(a.total_plays).toLocaleString()}</span>
                    </li>
                  ))}
                </ol>
              )
            }
          </section>

          <section className="dash-card">
            <h2>🎸 Your Genre Preferences</h2>
            {genres.length === 0
              ? <p className="empty">Like some tracks to see preferences!</p>
              : (
                <div className="genre-bars">
                  {genres.map((g, i) => (
                    <div key={i} className="genre-bar-row">
                      <span className="genre-label">{g.genre}</span>
                      <div className="genre-bar-bg">
                        <div className="genre-bar-fill"
                          style={{ width: ((g.count / genres[0].count) * 100) + '%' }} />
                      </div>
                      <span className="genre-count">{g.count}</span>
                    </div>
                  ))}
                </div>
              )
            }
          </section>

        </div>
      )}
    </div>
  );
}