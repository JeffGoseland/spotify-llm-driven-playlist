import os
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from flask import Flask, request, redirect, session, url_for, render_template, jsonify
from dotenv import load_dotenv
import json
from playlist_generator import SmartPlaylistGenerator

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'dev-secret-key')

# Spotify API credentials
SPOTIPY_CLIENT_ID = os.getenv('SPOTIPY_CLIENT_ID')
SPOTIPY_CLIENT_SECRET = os.getenv('SPOTIPY_CLIENT_SECRET')
SPOTIPY_REDIRECT_URI = os.getenv('SPOTIPY_REDIRECT_URI', 'http://localhost:5000/callback')

# Required scopes for playlist management
SCOPE = "playlist-modify-public playlist-modify-private user-read-private user-read-email"

def get_spotify_oauth():
    """Create Spotify OAuth object"""
    return SpotifyOAuth(
        client_id=SPOTIPY_CLIENT_ID,
        client_secret=SPOTIPY_CLIENT_SECRET,
        redirect_uri=SPOTIPY_REDIRECT_URI,
        scope=SCOPE
    )

@app.route('/')
def index():
    """Home page with login option"""
    return render_template('index.html')

@app.route('/login')
def login():
    """Initiate Spotify OAuth flow"""
    sp_oauth = get_spotify_oauth()
    auth_url = sp_oauth.get_authorize_url()
    return redirect(auth_url)

@app.route('/callback')
def callback():
    """Handle OAuth callback"""
    sp_oauth = get_spotify_oauth()
    code = request.args.get('code')
    
    if code:
        token_info = sp_oauth.get_access_token(code)
        session['token_info'] = token_info
        return redirect(url_for('dashboard'))
    else:
        return "Authentication failed", 400

@app.route('/dashboard')
def dashboard():
    """Main dashboard for playlist management"""
    if 'token_info' not in session:
        return redirect(url_for('login'))
    
    # Create Spotify client
    token_info = session['token_info']
    sp = spotipy.Spotify(auth=token_info['access_token'])
    
    # Get user info
    user = sp.current_user()
    
    return render_template('dashboard.html', user=user)

@app.route('/create_playlist', methods=['POST'])
def create_playlist():
    """Create a new playlist"""
    if 'token_info' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    sp = spotipy.Spotify(auth=session['token_info']['access_token'])
    user = sp.current_user()
    
    data = request.get_json()
    playlist_name = data.get('name', 'My New Playlist')
    playlist_description = data.get('description', 'Created with Spotify Playlist Generator')
    
    try:
        playlist = sp.user_playlist_create(
            user=user['id'],
            name=playlist_name,
            description=playlist_description,
            public=True
        )
        return jsonify({
            'success': True,
            'playlist': {
                'id': playlist['id'],
                'name': playlist['name'],
                'url': playlist['external_urls']['spotify']
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/search_tracks', methods=['GET'])
def search_tracks():
    """Search for tracks"""
    if 'token_info' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    sp = spotipy.Spotify(auth=session['token_info']['access_token'])
    query = request.args.get('q', '')
    limit = int(request.args.get('limit', 20))
    
    if not query:
        return jsonify({'error': 'Query parameter required'}), 400
    
    try:
        results = sp.search(q=query, type='track', limit=limit)
        tracks = []
        
        for track in results['tracks']['items']:
            tracks.append({
                'id': track['id'],
                'name': track['name'],
                'artist': ', '.join([artist['name'] for artist in track['artists']]),
                'album': track['album']['name'],
                'preview_url': track['preview_url'],
                'external_url': track['external_urls']['spotify']
            })
        
        return jsonify({'tracks': tracks})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/add_tracks_to_playlist', methods=['POST'])
def add_tracks_to_playlist():
    """Add tracks to a playlist"""
    if 'token_info' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    sp = spotipy.Spotify(auth=session['token_info']['access_token'])
    data = request.get_json()
    
    playlist_id = data.get('playlist_id')
    track_ids = data.get('track_ids', [])
    
    if not playlist_id or not track_ids:
        return jsonify({'error': 'Playlist ID and track IDs required'}), 400
    
    try:
        sp.playlist_add_items(playlist_id, track_ids)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get_audio_features', methods=['GET'])
def get_audio_features():
    """Get audio features for tracks"""
    if 'token_info' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    sp = spotipy.Spotify(auth=session['token_info']['access_token'])
    track_ids = request.args.get('ids', '').split(',')
    
    if not track_ids or track_ids == ['']:
        return jsonify({'error': 'Track IDs required'}), 400
    
    try:
        features = sp.audio_features(track_ids)
        return jsonify({'features': features})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/generate_smart_playlist', methods=['POST'])
def generate_smart_playlist():
    """Generate a smart playlist based on mood, genre, or artist"""
    if 'token_info' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    sp = spotipy.Spotify(auth=session['token_info']['access_token'])
    generator = SmartPlaylistGenerator(sp)
    
    data = request.get_json()
    playlist_type = data.get('type')  # mood, genre, artist, smart
    value = data.get('value')  # mood name, genre name, artist name, or seed tracks
    limit = data.get('limit', 20)
    
    try:
        if playlist_type == 'mood':
            tracks = generator.generate_mood_playlist(value, limit)
        elif playlist_type == 'genre':
            tracks = generator.generate_genre_playlist(value, limit)
        elif playlist_type == 'artist':
            include_related = data.get('include_related', True)
            tracks = generator.generate_artist_playlist(value, include_related, limit)
        elif playlist_type == 'smart':
            seed_tracks = data.get('seed_tracks', [])
            tracks = generator.generate_smart_playlist(seed_tracks, limit)
        else:
            return jsonify({'error': 'Invalid playlist type'}), 400
        
        return jsonify({'tracks': tracks})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/analyze_playlist', methods=['GET'])
def analyze_playlist():
    """Analyze an existing playlist's audio features"""
    if 'token_info' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    sp = spotipy.Spotify(auth=session['token_info']['access_token'])
    generator = SmartPlaylistGenerator(sp)
    
    playlist_id = request.args.get('playlist_id')
    if not playlist_id:
        return jsonify({'error': 'Playlist ID required'}), 400
    
    try:
        analysis = generator.analyze_playlist_features(playlist_id)
        return jsonify(analysis)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get_user_playlists', methods=['GET'])
def get_user_playlists():
    """Get user's playlists"""
    if 'token_info' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    sp = spotipy.Spotify(auth=session['token_info']['access_token'])
    
    try:
        playlists = sp.current_user_playlists()
        playlist_list = []
        
        for playlist in playlists['items']:
            playlist_list.append({
                'id': playlist['id'],
                'name': playlist['name'],
                'description': playlist['description'],
                'tracks': playlist['tracks']['total'],
                'public': playlist['public'],
                'url': playlist['external_urls']['spotify']
            })
        
        return jsonify({'playlists': playlist_list})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/logout')
def logout():
    """Logout user"""
    session.clear()
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True, port=5000)
