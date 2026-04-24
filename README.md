# 🎵 Melopiies — Music Library Management System

A full-stack music library app built with **Node.js + Express + MySQL + React**.

![Melopiies](https://img.shields.io/badge/Music-Library-purple?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-18-green?style=for-the-badge)
![MySQL](https://img.shields.io/badge/MySQL-8-orange?style=for-the-badge)

---

## 📸 Features

- 🎵 Browse all tracks with play/pause functionality
- ❤️ Add songs to favorites
- 🎧 Create and manage playlists
- 🔍 Search songs by title, artist or genre
- 📊 Dashboard with top liked tracks and most active artists
- ▶️ YouTube integration — play any song on YouTube
- ➕ Admin can add new tracks
- 🔐 JWT authentication with bcrypt password hashing

---

## 🛠️ Tech Stack

### Backend
- Node.js + Express.js
- MySQL (database)
- JWT (authentication)
- bcrypt (password hashing)
- Swagger (API documentation)

### Frontend
- React 18
- React Router DOM
- Axios
- Custom CSS with animations

---

## 📁 Project Structure
melopiies/
├── backend/
│   ├── config/
│   │   ├── db.js
│   │   ├── schema.sql
│   │   └── seed.sql
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── artistController.js
│   │   ├── albumController.js
│   │   ├── trackController.js
│   │   ├── playlistController.js
│   │   ├── favoriteController.js
│   │   ├── searchController.js
│   │   └── analyticsController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── artists.js
│   │   ├── tracks.js
│   │   └── misc.js
│   ├── utils/
│   │   └── swagger.js
│   ├── server.js
│   └── .env.example
└── frontend/
├── public/
│   └── index.html
└── src/
├── components/
│   ├── Layout.js
│   └── TrackCard.js
├── context/
│   └── AuthContext.js
├── pages/
│   ├── DashboardPage.js
│   ├── TracksPage.js
│   ├── FavoritesPage.js
│   ├── PlaylistsPage.js
│   ├── SearchPage.js
│   ├── AddTrackPage.js
│   ├── LoginPage.js
│   └── RegisterPage.js
├── services/
│   └── api.js
├── App.js
└── App.css

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js v18+
- MySQL 8+
- Git

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/melopiies-music-app.git
cd melopiies-music-app
```

### 2. Database Setup
Open MySQL Workbench and run:
```sql
source backend/config/schema.sql
source backend/config/seed.sql
```

### 3. Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env and set your DB_PASSWORD and JWT_SECRET
npm install
npm run dev
```

Backend runs at: `http://localhost:5000`
API Docs: `http://localhost:5000/api/docs`

### 4. Frontend Setup
```bash
cd frontend
npm install
npm start
```

Frontend runs at: `http://localhost:3000`

---

## 🔑 Demo Credentials

| Role  | Email | Password |
|-------|-------|----------|
| Admin | admin@musiclib.com | priya |
| User  | demo@musiclib.com  | priya |

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/signup | Register |
| POST | /api/auth/login  | Login |
| GET  | /api/auth/me     | Get profile |

### Tracks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /api/tracks          | Get all tracks |
| GET    | /api/tracks/:id      | Get one track |
| POST   | /api/tracks          | Add track (admin) |
| PUT    | /api/tracks/:id      | Update track (admin) |
| DELETE | /api/tracks/:id      | Delete track (admin) |

### Playlists
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /api/playlists | Get playlists |
| POST   | /api/playlists | Create playlist |
| POST   | /api/playlists/:id/tracks | Add track |
| DELETE | /api/playlists/:id/tracks/:trackId | Remove track |

### Favorites
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /api/favorites | Get favorites |
| POST   | /api/favorites/:trackId | Add favorite |
| DELETE | /api/favorites/:trackId | Remove favorite |

### Search
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /api/search?q=&type= | Search tracks |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/analytics/top-tracks | Top liked tracks |
| GET | /api/analytics/most-active-artists | Most active artists |
| GET | /api/analytics/genre-preferences | User genre preferences |

---

## 🔒 Security Features

- JWT authentication with 7 day expiry
- bcrypt password hashing (10 rounds)
- Helmet.js security headers
- CORS protection
- Rate limiting (200 requests / 15 min)
- Role based access control (user / admin)

---

## 👩‍💻 Developer

Built with love by **Priyanka** 🎵

---

## 📄 License

MIT License — free to use and modify