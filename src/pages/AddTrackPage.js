import React, { useState } from 'react';
import { createTrack, getArtists } from '../services/api';
import { useAuth } from '../context/AuthContext';

const YTIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#FF0000"/>
  </svg>
);

const SUGGESTIONS = [
  'Tum Hi Ho', 'Perfect Ed Sheeran', 'Kesariya', 'Raataan Lambiyan',
  'Until I Found You', 'Kal Ho Naa Ho', 'Chaiyya Chaiyya'
];

export default function AddTrackPage() {
  const { user } = useAuth();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [player, setPlayer] = useState(null);
  const [msg, setMsg] = useState('');
  const [addedIds, setAddedIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [showSug, setShowSug] = useState(false);

  const flash = m => {
    setMsg(m);
    setTimeout(() => setMsg(''), 3000);
  };

  // 🔍 SEARCH
  const search = q => {
    if (!q.trim()) return;

    setLoading(true);
    setShowSug(false);

    const variants = [
      q,
      q + ' official video',
      q + ' full song',
      q + ' lyrics'
    ];

    const res = variants.map((v, i) => ({
      id: Date.now() + i, // ✅ unique id
      title: v,
      embedUrl:
        'https://www.youtube.com/embed?listType=search&list=' +
        encodeURIComponent(v),
      ytUrl:
        'https://www.youtube.com/results?search_query=' +
        encodeURIComponent(v)
    }));

    setResults(res);
    setLoading(false);
  };

  const handleSubmit = e => {
    e.preventDefault();
    search(query);
  };

  const handleSuggestion = s => {
    setQuery(s);
    search(s);
  };

  // ▶ Play / Pause
  const handlePlay = item => {
    if (player && player.id === item.id) {
      setPlayer(null); // pause
    } else {
      setPlayer(item);
    }
  };

  // ➕ Add
  const handleAddToLibrary = async item => {
    if (addedIds.has(item.id)) {
      flash('Already added!');
      return;
    }

    try {
      const artists = await getArtists();
      const artistId = artists?.data?.data?.[0]?.id || 1;

      await createTrack({
        title: item.title,
        artist_id: artistId,
        genre_id: 2
      });

      setAddedIds(prev => new Set(prev).add(item.id));
      flash('Added to library!');
    } catch {
      flash('Failed (login as admin)');
    }
  };

  const handleDelete = id => {
    setResults(prev => prev.filter(r => r.id !== id));
    if (player?.id === id) setPlayer(null);
  };

  const filtered = SUGGESTIONS.filter(s =>
    s.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="page">
      <h1>🎵 Find & Play Songs</h1>

      {msg && <div className="alert">{msg}</div>}

      {/* SEARCH */}
      <form onSubmit={handleSubmit}>
        <input
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setShowSug(true);
          }}
          placeholder="Search song..."
        />
        <button type="submit">Search</button>
      </form>

      {/* SUGGESTIONS */}
      {showSug && filtered.length > 0 && (
        <div>
          {filtered.map((s, i) => (
            <div key={i} onClick={() => handleSuggestion(s)}>
              🔍 {s}
            </div>
          ))}
        </div>
      )}

      {/* PLAYER */}
      {player && (
        <div>
          <h3>▶ {player.title}</h3>

          <a href={player.ytUrl} target="_blank" rel="noreferrer">
            Open on YouTube ↗
          </a>

          <iframe
            width="100%"
            height="240"
            src={player.embedUrl + '&autoplay=1'}
            title={player.title}
            allow="autoplay"
          />
        </div>
      )}

      {/* RESULTS */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        results.map(item => (
          <div key={item.id}>
            <span>{item.title}</span>

            {/* PLAY */}
            <button onClick={() => handlePlay(item)}>
              {player?.id === item.id ? '⏸' : '▶'}
            </button>

            {/* ADD */}
            <button onClick={() => handleAddToLibrary(item)}>
              {addedIds.has(item.id) ? '✅ Added' : '➕ Add'}
            </button>

            {/* YT */}
            <a href={item.ytUrl} target="_blank" rel="noreferrer">
              <YTIcon />
            </a>

            {/* DELETE */}
            <button onClick={() => handleDelete(item.id)}>✕</button>
          </div>
        ))
      )}
    </div>
  );
}