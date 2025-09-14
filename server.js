/**
 * Express server for Neural Bard - Spotify LLM Playlist Generator
 * For hosting on platforms other than Netlify
 */

const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Import Netlify functions
const neuralBardHandler = require('./netlify/functions/neural-bard');
const spotifyPlaylistHandler = require('./netlify/functions/spotify-playlist');
const spotifyTokenExchangeHandler = require('./netlify/functions/spotify-token-exchange');

// API routes
app.post('/api/neural-bard', async (req, res) => {
    try {
        const event = {
            httpMethod: 'POST',
            headers: req.headers,
            body: JSON.stringify(req.body)
        };
        
        const result = await neuralBardHandler.handler(event, {});
        
        res.status(result.statusCode)
           .set(result.headers)
           .send(result.body);
    } catch (error) {
        console.error('Neural Bard API error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/spotify-playlist', async (req, res) => {
    try {
        const event = {
            httpMethod: 'POST',
            headers: req.headers,
            body: JSON.stringify(req.body)
        };
        
        const result = await spotifyPlaylistHandler.handler(event, {});
        
        res.status(result.statusCode)
           .set(result.headers)
           .send(result.body);
    } catch (error) {
        console.error('Spotify Playlist API error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/spotify-token-exchange', async (req, res) => {
    try {
        const event = {
            httpMethod: 'POST',
            headers: req.headers,
            body: JSON.stringify(req.body)
        };
        
        const result = await spotifyTokenExchangeHandler.handler(event, {});
        
        res.status(result.statusCode)
           .set(result.headers)
           .send(result.body);
    } catch (error) {
        console.error('Spotify Token Exchange API error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Handle CORS preflight requests
app.options('/api/neural-bard', (req, res) => {
    res.status(200)
       .set({
           'Access-Control-Allow-Origin': '*',
           'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
           'Access-Control-Allow-Headers': 'Content-Type, Authorization',
           'Access-Control-Max-Age': '86400'
       })
       .send();
});

app.options('/api/spotify-playlist', (req, res) => {
    res.status(200)
       .set({
           'Access-Control-Allow-Origin': '*',
           'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
           'Access-Control-Allow-Headers': 'Content-Type, Authorization',
           'Access-Control-Max-Age': '86400'
       })
       .send();
});

app.options('/api/spotify-token-exchange', (req, res) => {
    res.status(200)
       .set({
           'Access-Control-Allow-Origin': '*',
           'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
           'Access-Control-Allow-Headers': 'Content-Type, Authorization',
           'Access-Control-Max-Age': '86400'
       })
       .send();
});

// Serve auth callback
app.get('/auth/callback/', (req, res) => {
    res.sendFile(path.join(__dirname, 'auth/callback/index.html'));
});

// SPA routing - serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`Neural Bard server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
