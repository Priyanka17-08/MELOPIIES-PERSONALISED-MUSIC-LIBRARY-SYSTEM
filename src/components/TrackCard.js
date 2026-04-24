import React from 'react';

const fmtDuration = s => {
  if (!s) return '--:--';
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

const openYoutube = (title, artist) => {
  const query = encodeURIComponent(`${title} ${artist} official`);
  window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
};

export default function TrackCard({ track, isFav, onToggleFav, onAddToPlaylist, onPlay }) {
  return (
    <div className="track-card">
      <div className="track-info">
        <span className="track-title">{track.title}</span>
        <span className="track-meta">{track.artist_name} · {track.album_title || 'Single'}</span>
        <span className="track-meta">{track.genre_name || 'Unknown genre'} · {fmtDuration(track.duration_sec)}</span>
      </div>
      <div className="track-actions">
        {onPlay && (
          <button
            className="btn-play"
            onClick={() => onPlay(track)}
            title="Play song"
          >
            ▶
          </button>
        )}
        {onToggleFav && (
          <button
            className={`btn-icon ${isFav ? 'fav-active' : ''}`}
            onClick={() => onToggleFav(track.id)}
            title={isFav ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFav ? '❤️' : '🤍'}
          </button>
        )}
        {onAddToPlaylist && (
          <button className="btn-icon" onClick={() => onAddToPlaylist(track.id)} title="Add to playlist">
            ➕
          </button>
        )}
        <button
          className="btn-yt-icon"
          onClick={() => openYoutube(track.title, track.artist_name)}
          title="Listen on YouTube"
        >
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#FF0000"/>
          </svg>
        </button>
        <span className="play-count">
          ▶ {track.play_count >= 1000
            ? (track.play_count / 1000).toFixed(1) + 'K'
            : track.play_count}
        </span>
      </div>
    </div>
  );
}