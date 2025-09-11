# Spotify Playlist Generator

A powerful web application that creates personalized Spotify playlists using Spotify's Web API. Features intelligent track search, audio feature analysis, and smart playlist curation.

## Features

- **Spotify OAuth Authentication**: Secure login with Spotify account
- **Smart Track Search**: Find songs by artist, genre, mood, or audio features
- **Playlist Creation**: Programmatically create and manage playlists
- **Audio Feature Analysis**: Use Spotify's audio features for intelligent curation
- **Modern Web Interface**: Clean, responsive UI built with Bootstrap
- **Real-time Search**: Instant track search and preview

## Quick Start

### 1. Spotify App Setup

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Note your **Client ID** and **Client Secret**
4. Add `http://localhost:5000/callback` to your app's redirect URIs

### 2. Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your Spotify credentials:
   ```
   SPOTIPY_CLIENT_ID=your_spotify_client_id_here
   SPOTIPY_CLIENT_SECRET=your_spotify_client_secret_here
   SPOTIPY_REDIRECT_URI=http://localhost:5000/callback
   FLASK_SECRET_KEY=your_secret_key_here
   ```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the Application

```bash
python app.py
```

Visit `http://localhost:5000` in your browser!

## API Endpoints

- `GET /` - Home page
- `GET /login` - Initiate Spotify OAuth
- `GET /callback` - OAuth callback handler
- `GET /dashboard` - Main application dashboard
- `POST /create_playlist` - Create a new playlist
- `GET /search_tracks` - Search for tracks
- `POST /add_tracks_to_playlist` - Add tracks to playlist
- `GET /get_audio_features` - Get audio features for tracks

## Usage

1. **Login**: Click "Login with Spotify" to authenticate
2. **Create Playlist**: Use the "Create New Playlist" button
3. **Search Tracks**: Enter search terms and click search
4. **Add Tracks**: Select tracks and click "Add Selected"
5. **Manage**: View your playlist in Spotify

## Technical Details

- **Backend**: Python Flask with Spotipy library
- **Frontend**: HTML5, Bootstrap 5, JavaScript
- **Authentication**: Spotify OAuth 2.0
- **API**: Spotify Web API v1

## Requirements

- Python 3.7+
- Spotify Developer Account
- Internet connection

## License

MIT License - see LICENSE file for details