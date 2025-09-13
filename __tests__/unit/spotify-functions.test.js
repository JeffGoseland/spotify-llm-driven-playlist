/**
 * Unit tests for Spotify integration functions
 */

// Mock fetch globally
global.fetch = jest.fn();

describe('Spotify Token Exchange', () => {
    let handler;

    beforeEach(() => {
        // Import the handler
        delete require.cache[require.resolve('../../netlify/functions/spotify-token-exchange.js')];
        handler = require('../../netlify/functions/spotify-token-exchange.js').handler;
        
        // Reset fetch mock
        fetch.mockClear();
        
        // Mock environment variables
        process.env.SPOTIFY_CLIENT_ID = 'test_client_id';
        process.env.SPOTIFY_CLIENT_SECRET = 'test_client_secret';
    });

    afterEach(() => {
        delete process.env.SPOTIFY_CLIENT_ID;
        delete process.env.SPOTIFY_CLIENT_SECRET;
    });

    test('should handle OPTIONS request', async () => {
        const event = { httpMethod: 'OPTIONS' };
        
        const result = await handler(event, {});
        
        expect(result.statusCode).toBe(200);
        expect(result.headers['Access-Control-Allow-Origin']).toBe('*');
    });

    test('should handle successful token exchange', async () => {
        const event = {
            httpMethod: 'POST',
            body: JSON.stringify({
                code: 'test_auth_code',
                redirectUri: 'http://localhost:8888/auth/callback/'
            })
        };

        // Mock successful token response
        fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({
                access_token: 'test_access_token',
                refresh_token: 'test_refresh_token',
                expires_in: 3600,
                token_type: 'Bearer'
            })
        });

        // Mock successful profile response
        fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({
                id: 'test_user_id',
                display_name: 'Test User'
            })
        });

        const result = await handler(event, {});
        
        expect(result.statusCode).toBe(200);
        expect(JSON.parse(result.body).success).toBe(true);
        expect(JSON.parse(result.body).accessToken).toBe('test_access_token');
    });

    test('should handle missing authorization code', async () => {
        const event = {
            httpMethod: 'POST',
            body: JSON.stringify({
                redirectUri: 'http://localhost:8888/auth/callback/'
            })
        };

        const result = await handler(event, {});
        
        expect(result.statusCode).toBe(400);
        expect(JSON.parse(result.body).error).toBe('Authorization code is required');
    });

    test('should handle missing environment variables', async () => {
        delete process.env.SPOTIFY_CLIENT_ID;
        delete process.env.SPOTIFY_CLIENT_SECRET;

        const event = {
            httpMethod: 'POST',
            body: JSON.stringify({
                code: 'test_auth_code',
                redirectUri: 'http://localhost:8888/auth/callback/'
            })
        };

        const result = await handler(event, {});
        
        expect(result.statusCode).toBe(500);
        expect(JSON.parse(result.body).error).toBe('Server configuration error');
    });
});

describe('Spotify Playlist Creation', () => {
    let handler;

    beforeEach(() => {
        // Import the handler
        delete require.cache[require.resolve('../../netlify/functions/spotify-playlist.js')];
        handler = require('../../netlify/functions/spotify-playlist.js').handler;
        
        // Reset fetch mock
        fetch.mockClear();
    });

    test('should handle OPTIONS request', async () => {
        const event = { httpMethod: 'OPTIONS' };
        
        const result = await handler(event, {});
        
        expect(result.statusCode).toBe(200);
        expect(result.headers['Access-Control-Allow-Origin']).toBe('*');
    });

    test('should handle successful playlist creation', async () => {
        const event = {
            httpMethod: 'POST',
            body: JSON.stringify({
                prompt: 'Test playlist',
                numberOfSongs: 5,
                accessToken: 'test_access_token',
                songs: ['Artist 1 - Song 1', 'Artist 2 - Song 2']
            })
        };

        // Mock user profile response
        fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({
                id: 'test_user_id',
                display_name: 'Test User'
            })
        });

        // Mock playlist creation response
        fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({
                id: 'playlist_id',
                name: 'Neural Bard: Test playlist',
                external_urls: { spotify: 'https://spotify.com/playlist/123' }
            })
        });

        // Mock track search responses
        fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({
                tracks: {
                    items: [{ uri: 'spotify:track:123' }]
                }
            })
        });

        fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({
                tracks: {
                    items: [{ uri: 'spotify:track:456' }]
                }
            })
        });

        // Mock add tracks response
        fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({})
        });

        const result = await handler(event, {});
        
        expect(result.statusCode).toBe(200);
        const responseBody = JSON.parse(result.body);
        expect(responseBody.success).toBe(true);
        expect(responseBody.playlist.tracksAdded).toBe(2);
    });

    test('should handle missing access token', async () => {
        const event = {
            httpMethod: 'POST',
            body: JSON.stringify({
                prompt: 'Test playlist',
                songs: ['Artist 1 - Song 1']
            })
        };

        const result = await handler(event, {});
        
        expect(result.statusCode).toBe(401);
        expect(JSON.parse(result.body).error).toBe('Access token required');
    });

    test('should handle invalid access token', async () => {
        const event = {
            httpMethod: 'POST',
            body: JSON.stringify({
                prompt: 'Test playlist',
                accessToken: 'invalid_token',
                songs: ['Artist 1 - Song 1']
            })
        };

        // Mock failed profile response
        fetch.mockResolvedValueOnce({
            ok: false,
            status: 401
        });

        const result = await handler(event, {});
        
        expect(result.statusCode).toBe(401);
        expect(JSON.parse(result.body).error).toBe('Invalid access token');
    });
});
