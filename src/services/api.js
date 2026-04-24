import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5000/api' });
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const signup  = data => api.post('/auth/signup', data);
export const login   = data => api.post('/auth/login',  data);
export const getMe   = ()   => api.get('/auth/me');

export const getTracks   = (page = 1) => api.get(`/tracks?page=${page}&limit=20`);
export const getTrack    = id         => api.get(`/tracks/${id}`);
export const createTrack = data       => api.post('/tracks', data);
export const updateTrack = (id, data) => api.put(`/tracks/${id}`, data);
export const deleteTrack = id         => api.delete(`/tracks/${id}`);
export const playTrack   = id         => api.post(`/tracks/${id}/play`);

export const getArtists   = ()         => api.get('/artists');
export const getArtist    = id         => api.get(`/artists/${id}`);
export const createArtist = data       => api.post('/artists', data);
export const updateArtist = (id, data) => api.put(`/artists/${id}`, data);
export const deleteArtist = id         => api.delete(`/artists/${id}`);

export const getAlbums = () => api.get('/albums');
export const getAlbum  = id => api.get(`/albums/${id}`);

export const getPlaylists       = ()              => api.get('/playlists');
export const getPlaylist        = id              => api.get(`/playlists/${id}`);
export const createPlaylist     = data            => api.post('/playlists', data);
export const deletePlaylist     = id              => api.delete(`/playlists/${id}`);
export const addToPlaylist      = (id, track_id)  => api.post(`/playlists/${id}/tracks`, { track_id });
export const removeFromPlaylist = (id, trackId)   => api.delete(`/playlists/${id}/tracks/${trackId}`);

export const getFavorites   = ()  => api.get('/favorites');
export const addFavorite    = id  => api.post(`/favorites/${id}`);
export const removeFavorite = id  => api.delete(`/favorites/${id}`);

export const search = (q, type = 'title') => api.get(`/search?q=${encodeURIComponent(q)}&type=${type}`);

export const getTopTracks         = () => api.get('/analytics/top-tracks');
export const getGenrePreferences  = () => api.get('/analytics/genre-preferences');
export const getMostActiveArtists = () => api.get('/analytics/most-active-artists');

/** YouTube Data API search (backend); needs YOUTUBE_API_KEY on server */
export const getYoutubeFirstVideo = q =>
  api.get(`/youtube/first-video?q=${encodeURIComponent(q)}`);

export default api;