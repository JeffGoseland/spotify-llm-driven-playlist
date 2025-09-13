/**
 * Spotify Playlist Creation Function
 * Creates playlists on user's Spotify account
 */

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
        const { prompt, numberOfSongs, accessToken, songs } = JSON.parse(event.body);

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

        // Create playlist
        const playlistData = {
            name: `Neural Bard: ${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}`,
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

        const playlist = await createResponse.json();

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
                    totalRequested: songs.length
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
