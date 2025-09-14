/**
 * Simple development server for Neural Bard
 * Serves static files and provides API proxy
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const NETLIFY_BASE_URL = 'https://spotify-llm-driven-playlist.netlify.app';

// Function to proxy requests to Netlify functions
function proxyToNetlify(req, res, netlifyPath) {
    const targetUrl = `${NETLIFY_BASE_URL}${netlifyPath}`;
    
    // Collect request body for POST requests
    let body = '';
    if (req.method === 'POST') {
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            makeProxyRequest(targetUrl, req, res, body);
        });
    } else {
        makeProxyRequest(targetUrl, req, res, body);
    }
}

function makeProxyRequest(targetUrl, originalReq, res, body) {
    const options = {
        method: originalReq.method,
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Neural-Bard-Dev-Server'
        }
    };
    
    if (body && originalReq.method === 'POST') {
        options.headers['Content-Length'] = Buffer.byteLength(body);
    }
    
    const proxyReq = https.request(targetUrl, options, (proxyRes) => {
        // Forward status and headers
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        
        // Forward response body
        proxyRes.pipe(res);
    });
    
    proxyReq.on('error', (err) => {
        console.error('Proxy error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Proxy request failed', details: err.message }));
    });
    
    // Send request body if present
    if (body && originalReq.method === 'POST') {
        proxyReq.write(body);
    }
    
    proxyReq.end();
}

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    let pathname = parsedUrl.pathname;

    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle OPTIONS requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Netlify function routes - proxy to live Netlify functions
    if (pathname.startsWith('/.netlify/functions/')) {
        console.log(`🔄 Proxying ${req.method} ${pathname} to Netlify`);
        proxyToNetlify(req, res, pathname);
        return;
    }

    // Legacy API routes - also proxy to Netlify functions
    if (pathname.startsWith('/api/')) {
        const netlifyPath = pathname.replace('/api/', '/.netlify/functions/');
        console.log(`🔄 Proxying ${req.method} ${pathname} to ${netlifyPath}`);
        proxyToNetlify(req, res, netlifyPath);
        return;
    }

    // Serve static files
    if (pathname === '/') {
        pathname = '/index.html';
    }

    const filePath = path.join(__dirname, pathname);
    const ext = path.extname(filePath);

    fs.readFile(filePath, (err, data) => {
        if (err) {
            // File not found, serve index.html for SPA routing
            if (err.code === 'ENOENT') {
                fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
                    if (err) {
                        res.writeHead(404);
                        res.end('File not found');
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(data);
                    }
                });
            } else {
                res.writeHead(500);
                res.end('Server error');
            }
        } else {
            const contentType = mimeTypes[ext] || 'text/plain';
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Neural Bard development server running on http://localhost:${PORT}`);
    console.log(`📁 Serving static files from: ${__dirname}`);
    console.log(`🔧 Environment: development`);
    console.log(`🔄 Proxying Netlify functions to: ${NETLIFY_BASE_URL}`);
    console.log(`\n✨ Open your browser to: http://localhost:${PORT}`);
    console.log(`🎯 Full functionality available locally!`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`❌ Port ${PORT} is already in use. Try a different port or kill the existing process.`);
    } else {
        console.error('❌ Server error:', err);
    }
});
