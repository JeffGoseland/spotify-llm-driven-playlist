import spotipy
from spotipy.oauth2 import SpotifyOAuth
import random
from typing import List, Dict, Any, Optional
import logging

class SmartPlaylistGenerator:
    """
    Advanced playlist generator that uses Spotify's audio features
    for intelligent track curation and playlist creation.
    """
    
    def __init__(self, spotify_client: spotipy.Spotify):
        self.sp = spotify_client
        
    def generate_mood_playlist(self, mood: str, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Generate a playlist based on mood using audio features.
        
        Args:
            mood: The desired mood (happy, sad, energetic, calm, etc.)
            limit: Number of tracks to generate
            
        Returns:
            List of track dictionaries with audio features
        """
        mood_profiles = {
            'happy': {
                'valence': (0.6, 1.0),
                'energy': (0.5, 1.0),
                'danceability': (0.5, 1.0),
                'tempo': (100, 180)
            },
            'sad': {
                'valence': (0.0, 0.4),
                'energy': (0.0, 0.5),
                'danceability': (0.0, 0.4),
                'tempo': (60, 120)
            },
            'energetic': {
                'valence': (0.4, 1.0),
                'energy': (0.7, 1.0),
                'danceability': (0.6, 1.0),
                'tempo': (120, 200)
            },
            'calm': {
                'valence': (0.3, 0.7),
                'energy': (0.0, 0.4),
                'danceability': (0.0, 0.5),
                'tempo': (60, 100)
            },
            'party': {
                'valence': (0.6, 1.0),
                'energy': (0.8, 1.0),
                'danceability': (0.7, 1.0),
                'tempo': (120, 180)
            },
            'workout': {
                'valence': (0.5, 1.0),
                'energy': (0.8, 1.0),
                'danceability': (0.6, 1.0),
                'tempo': (140, 200)
            }
        }
        
        if mood.lower() not in mood_profiles:
            raise ValueError(f"Unknown mood: {mood}. Available moods: {list(mood_profiles.keys())}")
        
        profile = mood_profiles[mood.lower()]
        return self._search_by_audio_features(profile, limit)
    
    def generate_genre_playlist(self, genre: str, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Generate a playlist based on genre.
        
        Args:
            genre: The desired genre
            limit: Number of tracks to generate
            
        Returns:
            List of track dictionaries
        """
        try:
            # Search for tracks in the genre
            results = self.sp.search(q=f'genre:"{genre}"', type='track', limit=limit)
            tracks = []
            
            for track in results['tracks']['items']:
                track_info = {
                    'id': track['id'],
                    'name': track['name'],
                    'artist': ', '.join([artist['name'] for artist in track['artists']]),
                    'album': track['album']['name'],
                    'preview_url': track['preview_url'],
                    'external_url': track['external_urls']['spotify'],
                    'popularity': track['popularity']
                }
                tracks.append(track_info)
            
            return tracks
        except Exception as e:
            logging.error(f"Error generating genre playlist: {e}")
            return []
    
    def generate_artist_playlist(self, artist_name: str, include_related: bool = True, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Generate a playlist based on an artist and optionally related artists.
        
        Args:
            artist_name: Name of the artist
            include_related: Whether to include related artists
            limit: Number of tracks to generate
            
        Returns:
            List of track dictionaries
        """
        try:
            tracks = []
            
            # Get the artist
            artist_results = self.sp.search(q=artist_name, type='artist', limit=1)
            if not artist_results['artists']['items']:
                return []
            
            artist = artist_results['artists']['items'][0]
            artist_id = artist['id']
            
            # Get artist's top tracks
            top_tracks = self.sp.artist_top_tracks(artist_id)
            for track in top_tracks['tracks'][:limit//2 if include_related else limit]:
                track_info = {
                    'id': track['id'],
                    'name': track['name'],
                    'artist': ', '.join([artist['name'] for artist in track['artists']]),
                    'album': track['album']['name'],
                    'preview_url': track['preview_url'],
                    'external_url': track['external_urls']['spotify'],
                    'popularity': track['popularity']
                }
                tracks.append(track_info)
            
            # Get related artists if requested
            if include_related and len(tracks) < limit:
                related_artists = self.sp.artist_related_artists(artist_id)
                remaining_limit = limit - len(tracks)
                
                for related_artist in related_artists['artists'][:3]:  # Top 3 related artists
                    if remaining_limit <= 0:
                        break
                    
                    related_top_tracks = self.sp.artist_top_tracks(related_artist['id'])
                    for track in related_top_tracks['tracks'][:remaining_limit//3]:
                        track_info = {
                            'id': track['id'],
                            'name': track['name'],
                            'artist': ', '.join([artist['name'] for artist in track['artists']]),
                            'album': track['album']['name'],
                            'preview_url': track['preview_url'],
                            'external_url': track['external_urls']['spotify'],
                            'popularity': track['popularity']
                        }
                        tracks.append(track_info)
                        remaining_limit -= 1
            
            return tracks[:limit]
        except Exception as e:
            logging.error(f"Error generating artist playlist: {e}")
            return []
    
    def generate_smart_playlist(self, seed_tracks: List[str], limit: int = 20) -> List[Dict[str, Any]]:
        """
        Generate a playlist using Spotify's recommendation algorithm.
        
        Args:
            seed_tracks: List of track IDs to use as seeds
            limit: Number of tracks to generate
            
        Returns:
            List of track dictionaries
        """
        try:
            # Get audio features for seed tracks
            audio_features = self.sp.audio_features(seed_tracks)
            
            # Calculate average audio features
            avg_features = self._calculate_average_features(audio_features)
            
            # Get recommendations
            recommendations = self.sp.recommendations(
                seed_tracks=seed_tracks[:5],  # Spotify allows max 5 seed tracks
                limit=limit,
                target_valence=avg_features['valence'],
                target_energy=avg_features['energy'],
                target_danceability=avg_features['danceability'],
                target_tempo=avg_features['tempo']
            )
            
            tracks = []
            for track in recommendations['tracks']:
                track_info = {
                    'id': track['id'],
                    'name': track['name'],
                    'artist': ', '.join([artist['name'] for artist in track['artists']]),
                    'album': track['album']['name'],
                    'preview_url': track['preview_url'],
                    'external_url': track['external_urls']['spotify'],
                    'popularity': track['popularity']
                }
                tracks.append(track_info)
            
            return tracks
        except Exception as e:
            logging.error(f"Error generating smart playlist: {e}")
            return []
    
    def _search_by_audio_features(self, profile: Dict[str, tuple], limit: int) -> List[Dict[str, Any]]:
        """
        Search for tracks matching specific audio feature ranges.
        
        Args:
            profile: Dictionary with audio feature ranges
            limit: Number of tracks to return
            
        Returns:
            List of track dictionaries
        """
        try:
            # Start with a broad search
            search_terms = ['year:2020-2024', 'popularity:50-100']
            query = ' '.join(search_terms)
            
            results = self.sp.search(q=query, type='track', limit=50)
            tracks = []
            
            for track in results['tracks']['items']:
                # Get audio features for this track
                features = self.sp.audio_features(track['id'])[0]
                
                if features and self._matches_profile(features, profile):
                    track_info = {
                        'id': track['id'],
                        'name': track['name'],
                        'artist': ', '.join([artist['name'] for artist in track['artists']]),
                        'album': track['album']['name'],
                        'preview_url': track['preview_url'],
                        'external_url': track['external_urls']['spotify'],
                        'popularity': track['popularity'],
                        'audio_features': features
                    }
                    tracks.append(track_info)
                    
                    if len(tracks) >= limit:
                        break
            
            return tracks
        except Exception as e:
            logging.error(f"Error searching by audio features: {e}")
            return []
    
    def _matches_profile(self, features: Dict[str, Any], profile: Dict[str, tuple]) -> bool:
        """
        Check if track features match the desired profile.
        
        Args:
            features: Track's audio features
            profile: Desired feature ranges
            
        Returns:
            True if track matches profile
        """
        for feature, (min_val, max_val) in profile.items():
            if feature in features and features[feature] is not None:
                if not (min_val <= features[feature] <= max_val):
                    return False
        return True
    
    def _calculate_average_features(self, audio_features: List[Dict[str, Any]]) -> Dict[str, float]:
        """
        Calculate average audio features from a list of tracks.
        
        Args:
            audio_features: List of audio feature dictionaries
            
        Returns:
            Dictionary with average values
        """
        if not audio_features:
            return {}
        
        # Filter out None values
        valid_features = [f for f in audio_features if f is not None]
        
        if not valid_features:
            return {}
        
        avg_features = {}
        for key in valid_features[0].keys():
            if isinstance(valid_features[0][key], (int, float)):
                values = [f[key] for f in valid_features if f[key] is not None]
                if values:
                    avg_features[key] = sum(values) / len(values)
        
        return avg_features
    
    def analyze_playlist_features(self, playlist_id: str) -> Dict[str, Any]:
        """
        Analyze the audio features of an existing playlist.
        
        Args:
            playlist_id: Spotify playlist ID
            
        Returns:
            Dictionary with playlist analysis
        """
        try:
            # Get playlist tracks
            playlist = self.sp.playlist(playlist_id)
            tracks = playlist['tracks']['items']
            
            if not tracks:
                return {'error': 'Playlist is empty'}
            
            # Get track IDs
            track_ids = [item['track']['id'] for item in tracks if item['track']['id']]
            
            if not track_ids:
                return {'error': 'No valid tracks found'}
            
            # Get audio features
            audio_features = self.sp.audio_features(track_ids)
            valid_features = [f for f in audio_features if f is not None]
            
            if not valid_features:
                return {'error': 'No audio features available'}
            
            # Calculate averages
            avg_features = self._calculate_average_features(valid_features)
            
            # Determine mood based on features
            mood = self._determine_mood(avg_features)
            
            return {
                'track_count': len(valid_features),
                'average_features': avg_features,
                'mood': mood,
                'playlist_name': playlist['name']
            }
        except Exception as e:
            logging.error(f"Error analyzing playlist: {e}")
            return {'error': str(e)}
    
    def _determine_mood(self, features: Dict[str, float]) -> str:
        """
        Determine mood based on audio features.
        
        Args:
            features: Average audio features
            
        Returns:
            Predicted mood
        """
        valence = features.get('valence', 0.5)
        energy = features.get('energy', 0.5)
        danceability = features.get('danceability', 0.5)
        
        if valence > 0.7 and energy > 0.7:
            return 'happy'
        elif valence < 0.3 and energy < 0.4:
            return 'sad'
        elif energy > 0.8 and danceability > 0.7:
            return 'energetic'
        elif energy < 0.4 and valence < 0.6:
            return 'calm'
        else:
            return 'neutral'
