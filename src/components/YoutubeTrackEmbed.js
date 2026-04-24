import React, { useEffect, useState } from 'react';
import { getYoutubeFirstVideo } from '../services/api';

/**
 * Embeds the first YouTube search hit for title + artist.
 * Old listType=search iframe URLs no longer work; this uses Data API v3 on the backend.
 */
export default function YoutubeTrackEmbed({ title, artistName, ytSearchUrl }) {
  const [videoId, setVideoId] = useState(null);
  const [phase, setPhase] = useState('loading');

  useEffect(() => {
    let cancelled = false;
    const q = `${title || ''} ${artistName || ''}`.trim();
    (async () => {
      setPhase('loading');
      setVideoId(null);
      try {
        const { data } = await getYoutubeFirstVideo(`${q} official audio`);
        if (cancelled) return;
        if (!data.success) {
          setPhase('error');
          return;
        }
        if (!data.configured) {
          setPhase('no_key');
          return;
        }
        if (!data.videoId) {
          setPhase('empty');
          return;
        }
        setVideoId(data.videoId);
        setPhase('ready');
      } catch {
        if (!cancelled) setPhase('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [title, artistName]);

  const openYt = () => {
    if (ytSearchUrl) window.open(ytSearchUrl, '_blank', 'noopener,noreferrer');
  };

  if (phase === 'loading') {
    return <div className="yt-embed-fallback">Looking up video…</div>;
  }

  if (phase === 'no_key') {
    return (
      <div className="yt-embed-fallback">
        <p>
          To play audio here, add a YouTube Data API key to the backend{' '}
          <code className="yt-embed-code">.env</code>:
        </p>
        <p className="yt-embed-code-block">YOUTUBE_API_KEY=your_key_here</p>
        <p className="yt-embed-hint">
          Create a key in Google Cloud Console → APIs → YouTube Data API v3, then restart the server.
        </p>
        <button type="button" className="btn-primary" onClick={openYt}>
          Open search on YouTube
        </button>
      </div>
    );
  }

  if (phase === 'empty' || phase === 'error') {
    return (
      <div className="yt-embed-fallback">
        <p>{phase === 'empty' ? 'No matching video found.' : 'Could not load preview.'}</p>
        <button type="button" className="btn-primary" onClick={openYt}>
          Open on YouTube
        </button>
      </div>
    );
  }

  return (
    <iframe
      width="100%"
      height="200"
      src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
      title={title || 'YouTube'}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      className="yt-embed-iframe"
    />
  );
}
