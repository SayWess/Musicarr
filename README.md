# Musicarr 🎵

Musicarr is an automatic playlist management and download application, inspired by `.arr` tools like Sonarr or Radarr. It allows you to track playlists from artists or channels, manage download formats and qualities, and ensure all videos are locally available.

## Features 🧩

- 📅 Scheduled daily checks for missing videos
- 📱 Simple and clean UI (Next.js + Tailwind)
- 📂 Per-playlist configuration (folder, quality, format, subtitles)
- 🔄 Real-time download status via WebSockets (planned)
- 🔧 Fast backend using FastAPI and `yt-dlp` (via subprocess)
- 📃 PostgreSQL database

---

## Technologies 🚀

**Frontend**: Next.js, TypeScript, Tailwind CSS  
**Backend**: FastAPI, Python 3.11, `yt-dlp` via subprocess , Alembic, SQLAlchemy   
**Database**: PostgreSQL  
**State Management**: SWR

---

## Getting Started 🚪

### Prerequisites
- Node.js >= 18
- Python >= 3.11
- PostgreSQL

### Setup

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

---

## TODO 📌

### Backend
- [x] WebSocket support for live download tracking
- [ ] Validate filenames and folder names strictly in the API
- [ ] Add optional authentication
- [x] Improve download logging

### Frontend
- [x] Better user feedback (errors, spinners, notifications)
- [x] Display progress when a video is downloading
- [ ] Smarter playlist creation (search, autocomplete)
- [x] Responsive mobile layout improvements

### Quality & Tests
- [ ] Add backend unit tests
- [ ] Add end-to-end tests for UI (Playwright or Cypress)

---

## Author ✍️

Made by [SayWess](https://github.com/SayWess)
