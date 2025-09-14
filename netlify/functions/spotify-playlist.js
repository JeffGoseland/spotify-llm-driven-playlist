/**
 * Spotify Playlist Creation Function
 * Creates playlists on user's Spotify account
 */

// Helper function to check for existing playlists with the same name
async function checkForExistingPlaylist(accessToken, userId, playlistName) {
    try {
        let offset = 0;
        const limit = 50;
        
        while (true) {
            const response = await fetch(
                `https://api.spotify.com/v1/users/${userId}/playlists?limit=${limit}&offset=${offset}`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );
            
            if (!response.ok) {
                console.error('Failed to fetch user playlists:', response.status);
                return null;
            }
            
            const data = await response.json();
            const playlists = data.items;
            
            // Check if any playlist has the exact same name
            const existingPlaylist = playlists.find(playlist => 
                playlist.name === playlistName && 
                playlist.owner.id === userId
            );
            
            if (existingPlaylist) {
                return existingPlaylist;
            }
            
            // If we've fetched all playlists, break
            if (playlists.length < limit) {
                break;
            }
            
            offset += limit;
        }
        
        return null; // No existing playlist found
    } catch (error) {
        console.error('Error checking for existing playlists:', error);
        return null;
    }
}

exports.handler = async (event, context) => {
    // Handle CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { prompt, numberOfSongs, accessToken, songs, customTitle, replaceExisting = false } = JSON.parse(event.body);

        if (!accessToken) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Access token required' })
            };
        }

        if (!songs || !Array.isArray(songs)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Songs array is required' })
            };
        }

        // Get user profile first
        const profileResponse = await fetch('https://api.spotify.com/v1/me', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!profileResponse.ok) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Invalid access token' })
            };
        }

        const user = await profileResponse.json();

        // Create playlist with custom title or auto-generated name
        const playlistName = customTitle && customTitle.trim() 
            ? customTitle.trim()
            : `Neural Bard: ${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}`;
        
        // Check for existing playlists with the same name
        const existingPlaylist = await checkForExistingPlaylist(accessToken, user.id, playlistName);
        
        let playlist;
        if (existingPlaylist) {
            // Use existing playlist
            playlist = existingPlaylist;
            console.log(`Using existing playlist: ${playlistName}`);
            
            // If user wants to replace existing tracks, clear the playlist first
            if (replaceExisting) {
                try {
                    // Get current tracks in the playlist
                    const tracksResponse = await fetch(
                        `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`,
                        {
                            headers: {
                                'Authorization': `Bearer ${accessToken}`
                            }
                        }
                    );
                    
                    if (tracksResponse.ok) {
                        const tracksData = await tracksResponse.json();
                        if (tracksData.items.length > 0) {
                            // Remove all existing tracks
                            const trackUrisToRemove = tracksData.items.map(item => ({
                                uri: item.track.uri
                            }));
                            
                            await fetch(
                                `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`,
                                {
                                    method: 'DELETE',
                                    headers: {
                                        'Authorization': `Bearer ${accessToken}`,
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                        tracks: trackUrisToRemove
                                    })
                                }
                            );
                            
                            console.log(`Cleared ${trackUrisToRemove.length} existing tracks from playlist`);
                        }
                    }
                } catch (error) {
                    console.error('Error clearing existing tracks:', error);
                    // Continue anyway - we'll just add to existing tracks
                }
            }
        } else {
            // Create new playlist
            const playlistData = {
                name: playlistName,
                description: `Created by Neural Bard AI - "${prompt}"`,
                public: true
            };

            const createResponse = await fetch(`https://api.spotify.com/v1/users/${user.id}/playlists`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(playlistData)
            });

            if (!createResponse.ok) {
                const errorText = await createResponse.text();
                console.error('Playlist creation error:', errorText);
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ 
                        error: 'Failed to create playlist',
                        details: errorText 
                    })
                };
            }

            playlist = await createResponse.json();
        }

        // Search for tracks and add to playlist
        const trackUris = [];
        const searchPromises = songs.map(async (song) => {
            try {
                const searchQuery = encodeURIComponent(song);
                const searchResponse = await fetch(
                    `https://api.spotify.com/v1/search?q=${searchQuery}&type=track&limit=1`,
                    {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    }
                );

                if (searchResponse.ok) {
                    const searchData = await searchResponse.json();
                    if (searchData.tracks.items.length > 0) {
                        return searchData.tracks.items[0].uri;
                    }
                }
            } catch (error) {
                console.error(`Error searching for "${song}":`, error);
            }
            return null;
        });

        const searchResults = await Promise.all(searchPromises);
        trackUris.push(...searchResults.filter(uri => uri !== null));

        // Add tracks to playlist
        if (trackUris.length > 0) {
            const addTracksResponse = await fetch(
                `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        uris: trackUris
                    })
                }
            );

            if (!addTracksResponse.ok) {
                const errorText = await addTracksResponse.text();
                console.error('Add tracks error:', errorText);
            }
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                playlist: {
                    id: playlist.id,
                    name: playlist.name,
                    url: playlist.external_urls.spotify,
                    tracksAdded: trackUris.length,
                    totalRequested: songs.length,
                    wasExisting: !!existingPlaylist
                }
            })
        };

    } catch (error) {
        console.error('Playlist creation error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Internal server error',
                details: error.message 
            })
        };
    }
};
