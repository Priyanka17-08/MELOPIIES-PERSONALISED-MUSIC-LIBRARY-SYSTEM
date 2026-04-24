import React, { useEffect, useState } from 'react';
import { getPlaylists, createPlaylist, deletePlaylist, getPlaylist, removeFromPlaylist } from '../services/api';

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState([]);
  const [selected,  setSelected]  = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [newName,   setNewName]   = useState('');
  const [msg,       setMsg]       = useState('');

  const flash = m => { setMsg(m); setTimeout(() => setMsg(''), 2500); };

  const load = async () => {
    const { data } = await getPlaylists();
    setPlaylists(data.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async e => {
    e.preventDefault();
    if (!newName.trim()) return;
    await createPlaylist({ name: newName.trim(), is_public: false });
    setNewName('');
    flash('Playlist created!');
    load();
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this playlist?')) return;
    await deletePlaylist(id);
    if (selected?.id === id) setSelected(null);
    flash('Playlist deleted');
    load();
  };

  const handleOpen = async id => {
    const { data } = await getPlaylist(id);
    setSelected(data.data);
  };

  const handleRemoveTrack = async trackId => {
    await removeFromPlaylist(selected.id, trackId);
    setSelected(s => ({ ...s, tracks: s.tracks.filter(t => t.id !== trackId) }));
    flash('Track removed');
  };

  return (
    <div className="page playlists-layout">
      <div className="playlists-sidebar">
        <h1>🎧 Playlists</h1>
        <form onSubmit={handleCreate} className="create-form">
          <input
            type="text" placeholder="New playlist name…"
            value={newName} onChange={e => setNewName(e.target.value)}
          />
          <button className="btn-primary" type="submit">+</button>
        </form>
        {msg && <div className="alert alert-success">{msg}</div>}
        {loading
          ? <div className="loading">Loading…</div>
          : playlists.length === 0
            ? <p className="empty">No playlists yet.</p>
            : playlists.map(p => (
              <div key={p.id}
                className={`playlist-item ${selected?.id === p.id ? 'active' : ''}`}
                onClick={() => handleOpen(p.id)}
              >
                <div>
                  <div className="playlist-name">{p.name}</div>
                  <div className="playlist-meta">{p.track_count} tracks</div>
                </div>
                <button className="btn-danger-sm"
                  onClick={e => { e.stopPropagation(); handleDelete(p.id); }}>✕</button>
              </div>
            ))
        }
      </div>
      <div className="playlist-detail">
        {!selected
          ? <div className="empty-state"><p>Select a playlist to view tracks.</p></div>
          : (
            <>
              <h2>{selected.name}</h2>
              <p className="playlist-desc">{selected.description || ''}</p>
              {selected.tracks?.length === 0
                ? <p className="empty">No tracks yet. Add them from the Tracks page!</p>
                : selected.tracks?.map(t => (
                  <div key={t.id} className="track-card">
                    <div className="track-info">
                      <span className="track-title">{t.title}</span>
                      <span className="track-meta">{t.artist_name}</span>
                    </div>
                    <button className="btn-icon"
                      onClick={() => handleRemoveTrack(t.id)}>✕</button>
                  </div>
                ))
              }
            </>
          )
        }
      </div>
    </div>
  );
}