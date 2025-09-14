# Deployment Guide for Non-Netlify Hosting

This guide explains how to deploy the Neural Bard Spotify playlist generator to hosting providers other than Netlify.

## Supported Hosting Providers

The app has been configured to work with:

- **Netlify** (primary)
- **Apache servers** (using .htaccess)
- **Node.js hosting** (using server.js)
- **Static hosting with redirect support** (using _redirects)

## Configuration Changes Made

### 1. Dynamic API URL Detection

The JavaScript now automatically detects the hosting environment:

- **Local development**: Uses localhost:3000
- **Netlify**: Uses `/.netlify/functions/`
- **Other providers**: Uses `/api/`

### 2. Dynamic OAuth Redirect URI

The Spotify OAuth callback URL is now automatically generated based on the current domain.

## Deployment Options

### Option 1: Static Hosting with Redirects

For providers that support redirect rules (like Vercel, Surge.sh, etc.):

1. Upload all files to your hosting provider
2. The `_redirects` file will handle API routing
3. No additional configuration needed

### Option 2: Apache Server (.htaccess)

For shared hosting providers with Apache:

1. Upload all files to your web root
2. Ensure `.htaccess` files are enabled
3. The `.htaccess` file will handle routing and security headers

### Option 3: Node.js Hosting

For platforms that support Node.js (like Heroku, Railway, etc.):

1. Ensure `server.js` is in your root directory
2. Add these scripts to your `package.json`:

   ```json
   {
     "scripts": {
       "start": "node server.js",
       "dev": "node server.js"
     }
   }
   ```

3. Deploy with Node.js support

## Environment Variables

Set these environment variables on your hosting provider:

```bash
# Required for Neural Bard API
GROQ_API_KEY=your_groq_api_key_here

# Optional: Set NODE_ENV
NODE_ENV=production
```

## File Structure

```text
/
├── index.html                 # Main application
├── auth/callback/index.html   # OAuth callback page
├── netlify/functions/         # Serverless functions
├── js/main.js                 # Main JavaScript (auto-detects environment)
├── css/style.css              # Styles
├── server.js                  # Node.js server (for non-Netlify hosting)
├── .htaccess                  # Apache configuration
├── _redirects                 # Redirect rules for static hosting
└── package.json               # Dependencies
```

## Testing Deployment

1. **Check API endpoints**:
   - `/api/neural-bard` - Should return CORS headers
   - `/api/spotify-playlist` - Should return CORS headers
   - `/api/spotify-token-exchange` - Should return CORS headers

2. **Test OAuth flow**:
   - Click "Connect to Spotify"
   - Verify redirect URI matches your domain
   - Complete authentication flow

3. **Test playlist creation**:
   - Generate a playlist with Neural Bard
   - Create playlist on Spotify
   - Verify success notifications

## Troubleshooting

### API Calls Failing

- Check browser console for errors
- Verify API endpoints are accessible
- Ensure CORS headers are present

### OAuth Issues

- Verify redirect URI in Spotify app settings
- Check that `/auth/callback/` route works
- Ensure HTTPS is enabled for production

### Static Files Not Loading

- Check file paths and case sensitivity
- Verify server supports the file types
- Check for 404 errors in browser network tab

## Platform-Specific Notes

### Vercel

- Add `vercel.json` for additional configuration
- Functions should work automatically

### Heroku

- Add `Procfile`: `web: node server.js`
- Set environment variables in dashboard

### GitHub Pages

- Limited to static hosting only
- Requires separate backend hosting for API

### Shared Hosting

- Ensure PHP/Node.js support if needed
- Check `.htaccess` support
- Verify file permissions

## Security Considerations

- Environment variables are secure on the server
- CORS is configured for cross-origin requests
- Security headers are set in `.htaccess`
- Input validation is handled in API functions

## Monitoring

Monitor these aspects after deployment:

- API response times
- Error rates
- OAuth success rates
- Playlist creation success rates

For issues, check:

- Server logs
- Browser console errors
- Network request failures
- Environment variable configuration
