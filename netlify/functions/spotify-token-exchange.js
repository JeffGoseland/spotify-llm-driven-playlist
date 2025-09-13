/**
 * Spotify Token Exchange Function
 * Exchanges authorization code for access token
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
        const { code, redirectUri } = JSON.parse(event.body);

        if (!code) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Authorization code is required' })
            };
        }

        // Get environment variables
        const clientId = process.env.SPOTIFY_CLIENT_ID;
        const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            console.error('Missing Spotify credentials');
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Server configuration error' })
            };
        }

        // Exchange code for token
        const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirectUri || 'https://spotify-llm-driven-playlist.netlify.app/auth/callback/'
            })
        });

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error('Spotify token exchange error:', errorText);
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    error: 'Token exchange failed',
                    details: errorText 
                })
            };
        }

        const tokenData = await tokenResponse.json();

        // Get user profile
        const profileResponse = await fetch('https://api.spotify.com/v1/me', {
            headers: {
                'Authorization': `Bearer ${tokenData.access_token}`
            }
        });

        let userProfile = null;
        if (profileResponse.ok) {
            userProfile = await profileResponse.json();
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                accessToken: tokenData.access_token,
                refreshToken: tokenData.refresh_token,
                expiresIn: tokenData.expires_in,
                tokenType: tokenData.token_type,
                user: userProfile
            })
        };

    } catch (error) {
        console.error('Token exchange error:', error);
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
