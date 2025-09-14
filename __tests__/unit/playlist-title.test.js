/**
 * Unit tests for custom playlist title functionality
 */

// Mock DOM and global objects
global.document = {
    getElementById: jest.fn(),
    querySelector: jest.fn()
};

global.window = {
    currentSongs: ['Artist 1 - Song 1', 'Artist 2 - Song 2'],
    currentPrompt: 'test prompt'
};

global.fetch = jest.fn();
global.localStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn()
};

// Mock the playlist creation functions
const createSpotifyPlaylistFromResults = async () => {
    const customTitle = document.getElementById('playlistTitle')?.value?.trim() || null;
    const replaceExisting = document.getElementById('replaceExistingTracks')?.checked || false;
    
    if (!window.currentSongs || !window.currentPrompt) {
        throw new Error('No songs or prompt available');
    }
    
    const result = await createSpotifyPlaylist(window.currentSongs, window.currentPrompt, customTitle, replaceExisting);
    return result;
};

const createSpotifyPlaylist = async (songs, prompt, customTitle = null, replaceExisting = false) => {
    const accessToken = localStorage.getItem('spotify_access_token');
    
    if (!accessToken) {
        throw new Error('Not connected to Spotify');
    }
    
    const response = await fetch('/api/spotify-playlist', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            prompt: prompt,
            numberOfSongs: songs.length,
            accessToken: accessToken,
            songs: songs,
            customTitle: customTitle,
            replaceExisting: replaceExisting
        })
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create playlist');
    }
    
    return await response.json();
};

describe('Custom Playlist Title Functionality', () => {
    let mockPlaylistTitleInput;
    let mockReplaceExistingInput;

    beforeEach(() => {
        jest.clearAllMocks();
        
        mockPlaylistTitleInput = {
            value: ''
        };
        
        mockReplaceExistingInput = {
            checked: false
        };
        
        document.getElementById.mockImplementation((id) => {
            if (id === 'playlistTitle') return mockPlaylistTitleInput;
            if (id === 'replaceExistingTracks') return mockReplaceExistingInput;
            return null;
        });
        
        localStorage.getItem.mockReturnValue('test_access_token');
        
        fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({
                success: true,
                playlist: {
                    id: 'test_playlist_id',
                    name: 'Test Playlist',
                    url: 'https://open.spotify.com/playlist/test',
                    tracksAdded: 2,
                    totalRequested: 2,
                    wasExisting: false
                }
            })
        });
    });

    describe('Custom Title Input Handling', () => {
        test('should use custom title when provided', async () => {
            mockPlaylistTitleInput.value = 'My Custom Playlist';
            
            await createSpotifyPlaylistFromResults();
            
            expect(fetch).toHaveBeenCalledWith('/api/spotify-playlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: 'test prompt',
                    numberOfSongs: 2,
                    accessToken: 'test_access_token',
                    songs: ['Artist 1 - Song 1', 'Artist 2 - Song 2'],
                    customTitle: 'My Custom Playlist',
                    replaceExisting: false
                })
            });
        });

        test('should use null when no custom title provided', async () => {
            mockPlaylistTitleInput.value = '';
            
            await createSpotifyPlaylistFromResults();
            
            expect(fetch).toHaveBeenCalledWith('/api/spotify-playlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: 'test prompt',
                    numberOfSongs: 2,
                    accessToken: 'test_access_token',
                    songs: ['Artist 1 - Song 1', 'Artist 2 - Song 2'],
                    customTitle: null,
                    replaceExisting: false
                })
            });
        });

        test('should trim whitespace from custom title', async () => {
            mockPlaylistTitleInput.value = '  My Playlist With Spaces  ';
            
            await createSpotifyPlaylistFromResults();
            
            expect(fetch).toHaveBeenCalledWith('/api/spotify-playlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: 'test prompt',
                    numberOfSongs: 2,
                    accessToken: 'test_access_token',
                    songs: ['Artist 1 - Song 1', 'Artist 2 - Song 2'],
                    customTitle: 'My Playlist With Spaces',
                    replaceExisting: false
                })
            });
        });

        test('should handle empty string as null', async () => {
            mockPlaylistTitleInput.value = '   ';
            
            await createSpotifyPlaylistFromResults();
            
            expect(fetch).toHaveBeenCalledWith('/api/spotify-playlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: 'test prompt',
                    numberOfSongs: 2,
                    accessToken: 'test_access_token',
                    songs: ['Artist 1 - Song 1', 'Artist 2 - Song 2'],
                    customTitle: null,
                    replaceExisting: false
                })
            });
        });

        test('should handle missing playlist title input element', async () => {
            document.getElementById.mockImplementation((id) => {
                if (id === 'playlistTitle') return null;
                if (id === 'replaceExistingTracks') return mockReplaceExistingInput;
                return null;
            });
            
            await createSpotifyPlaylistFromResults();
            
            expect(fetch).toHaveBeenCalledWith('/api/spotify-playlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: 'test prompt',
                    numberOfSongs: 2,
                    accessToken: 'test_access_token',
                    songs: ['Artist 1 - Song 1', 'Artist 2 - Song 2'],
                    customTitle: null,
                    replaceExisting: false
                })
            });
        });
    });

    describe('Replace Existing Tracks Option', () => {
        test('should pass replaceExisting as true when checkbox is checked', async () => {
            mockReplaceExistingInput.checked = true;
            
            await createSpotifyPlaylistFromResults();
            
            expect(fetch).toHaveBeenCalledWith('/api/spotify-playlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: 'test prompt',
                    numberOfSongs: 2,
                    accessToken: 'test_access_token',
                    songs: ['Artist 1 - Song 1', 'Artist 2 - Song 2'],
                    customTitle: null,
                    replaceExisting: true
                })
            });
        });

        test('should pass replaceExisting as false when checkbox is unchecked', async () => {
            mockReplaceExistingInput.checked = false;
            
            await createSpotifyPlaylistFromResults();
            
            expect(fetch).toHaveBeenCalledWith('/api/spotify-playlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: 'test prompt',
                    numberOfSongs: 2,
                    accessToken: 'test_access_token',
                    songs: ['Artist 1 - Song 1', 'Artist 2 - Song 2'],
                    customTitle: null,
                    replaceExisting: false
                })
            });
        });

        test('should handle missing replace existing input element', async () => {
            document.getElementById.mockImplementation((id) => {
                if (id === 'playlistTitle') return mockPlaylistTitleInput;
                if (id === 'replaceExistingTracks') return null;
                return null;
            });
            
            await createSpotifyPlaylistFromResults();
            
            expect(fetch).toHaveBeenCalledWith('/api/spotify-playlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: 'test prompt',
                    numberOfSongs: 2,
                    accessToken: 'test_access_token',
                    songs: ['Artist 1 - Song 1', 'Artist 2 - Song 2'],
                    customTitle: null,
                    replaceExisting: false
                })
            });
        });
    });

    describe('Combined Custom Title and Replace Options', () => {
        test('should handle both custom title and replace existing', async () => {
            mockPlaylistTitleInput.value = 'My Custom Playlist';
            mockReplaceExistingInput.checked = true;
            
            await createSpotifyPlaylistFromResults();
            
            expect(fetch).toHaveBeenCalledWith('/api/spotify-playlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: 'test prompt',
                    numberOfSongs: 2,
                    accessToken: 'test_access_token',
                    songs: ['Artist 1 - Song 1', 'Artist 2 - Song 2'],
                    customTitle: 'My Custom Playlist',
                    replaceExisting: true
                })
            });
        });

        test('should handle special characters in custom title', async () => {
            mockPlaylistTitleInput.value = 'My Playlist 🎵 & "Special" Characters!';
            
            await createSpotifyPlaylistFromResults();
            
            expect(fetch).toHaveBeenCalledWith('/api/spotify-playlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: 'test prompt',
                    numberOfSongs: 2,
                    accessToken: 'test_access_token',
                    songs: ['Artist 1 - Song 1', 'Artist 2 - Song 2'],
                    customTitle: 'My Playlist 🎵 & "Special" Characters!',
                    replaceExisting: false
                })
            });
        });
    });

    describe('Error Handling', () => {
        test('should throw error when no songs available', async () => {
            window.currentSongs = null;
            
            await expect(createSpotifyPlaylistFromResults()).rejects.toThrow('No songs or prompt available');
        });

        test('should throw error when no prompt available', async () => {
            window.currentPrompt = null;
            
            await expect(createSpotifyPlaylistFromResults()).rejects.toThrow('No songs or prompt available');
        });

        test('should throw error when not connected to Spotify', async () => {
            localStorage.getItem.mockReturnValue(null);
            
            await expect(createSpotifyPlaylistFromResults()).rejects.toThrow('Not connected to Spotify');
        });

        test('should handle API errors gracefully', async () => {
            fetch.mockResolvedValue({
                ok: false,
                json: () => Promise.resolve({
                    error: 'Playlist creation failed'
                })
            });
            
            await expect(createSpotifyPlaylistFromResults()).rejects.toThrow('Playlist creation failed');
        });
    });

    describe('Playlist Creation Response', () => {
        test('should return playlist data with custom title', async () => {
            mockPlaylistTitleInput.value = 'My Custom Playlist';
            
            const result = await createSpotifyPlaylistFromResults();
            
            expect(result).toEqual({
                success: true,
                playlist: {
                    id: 'test_playlist_id',
                    name: 'Test Playlist',
                    url: 'https://open.spotify.com/playlist/test',
                    tracksAdded: 2,
                    totalRequested: 2,
                    wasExisting: false
                }
            });
        });

        test('should handle existing playlist response', async () => {
            fetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({
                    success: true,
                    playlist: {
                        id: 'existing_playlist_id',
                        name: 'Existing Playlist',
                        url: 'https://open.spotify.com/playlist/existing',
                        tracksAdded: 2,
                        totalRequested: 2,
                        wasExisting: true
                    }
                })
            });
            
            const result = await createSpotifyPlaylistFromResults();
            
            expect(result.playlist.wasExisting).toBe(true);
        });
    });
});
