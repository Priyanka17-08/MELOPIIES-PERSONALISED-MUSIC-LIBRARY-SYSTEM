import React, { useState } from 'react';
import { search, getFavorites, addFavorite, removeFavorite } from '../services/api';
import TrackCard from '../components/TrackCard';

const TYPES = ['title', 'artist', 'genre'];

export default function SearchPage() {
  const [q,        setQ]        = useState('');
  const [type,     setType]     = useState('title');
  const [results,  setResults]  = useState([]);
  const [favIds,   setFavIds]   = useState(new Set());
  const [loading,  setLoading]  = useState(false);
  const [searched, setSearched] = useState(false);
  const [msg,      setMsg]      = useState('');

  const flash = m => { setMsg(m); setTimeout(() => setMsg(''), 2500); };

  const handleSearch = async e => {
    e.preventDefault();
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    const [r, f] = await Promise.all([search(q.trim(), type), getFavorites()]);
    setResults(r.data.data);
    setFavIds(new Set(f.data.data.map(x => x.id)));
    setLoading(false);
  };

  const toggleFav = async id => {
    if (favIds.has(id)) {
      await removeFavorite(id);
      setFavIds(s => { const n = new Set(s); n.delete(id); return n; });
      flash('Removed from favorites');
    } else {
      await addFavorite(id);
      setFavIds(s => new Set(s).add(id));
      flash('Added to favorites ❤️');
    }
  };

  return (
    <div className="page">
      <h1>🔍 Search</h1>
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text" placeholder="Search…"
          value={q} onChange={e => setQ(e.target.value)}
        />
        <div className="type-tabs">
          {TYPES.map(t => (
            <button key={t} type="button"
              className={`tab ${type === t ? 'active' : ''}`}
              onClick={() => setType(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <button className="btn-primary" type="submit">Search</button>
      </form>
      {msg && <div className="alert alert-success">{msg}</div>}
      {loading && <div className="loading">Searching…</div>}
      {!loading && searched && (
        results.length === 0
          ? <div className="empty-state">No results found for "{q}"</div>
          : (
            <div className="track-list">
              <p className="results-count">{results.length} result{results.length !== 1 ? 's' : ''}</p>
              {results.map(t => (
                <TrackCard
                  key={t.id}
                  track={t}
                  isFav={favIds.has(t.id)}
                  onToggleFav={toggleFav}
                />
              ))}
            </div>
          )
      )}
    </div>
  );
}