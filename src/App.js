import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage     from './pages/LoginPage';
import RegisterPage  from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TracksPage    from './pages/TracksPage';
import FavoritesPage from './pages/FavoritesPage';
import PlaylistsPage from './pages/PlaylistsPage';
import SearchPage    from './pages/SearchPage';
import AddTrackPage  from './pages/AddTrackPage';
import Layout        from './components/Layout';
import './App.css';

const Protected = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<Protected><Layout /></Protected>}>
            <Route index              element={<DashboardPage />} />
            <Route path="tracks"      element={<TracksPage />} />
            <Route path="favorites"   element={<FavoritesPage />} />
            <Route path="playlists"   element={<PlaylistsPage />} />
            <Route path="search"      element={<SearchPage />} />
            <Route path="add-track"   element={<AddTrackPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}