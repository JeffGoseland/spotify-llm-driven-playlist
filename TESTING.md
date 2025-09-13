# Quick Testing Reference

## Quick Start

```bash
# Install dependencies
npm install
npm install -g netlify-cli

# Start local server
netlify dev

# Run all tests
npm test
```

## Testing Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests |
| `npm test -- --testPathPattern=unit` | Unit tests only |
| `npm test -- --testPathPattern=spotify-callback` | OAuth callback tests |
| `node test-spotify-callback.js` | Standalone callback test |
| `netlify dev` | Start local development server |

## 🌐 Test URLs

### Local Testing

- **Test Interface**: `http://localhost:8888/test-callback.html`
- **Success Callback**: `http://localhost:8888/auth/callback/?code=test_code&state=test_state`
- **Error Callback**: `http://localhost:8888/auth/callback/?error=access_denied`

### Live Testing

- **Test Interface**: `https://spotify-llm-driven-playlist.netlify.app/test-callback.html`
- **Success Callback**: `https://spotify-llm-driven-playlist.netlify.app/auth/callback/?code=test_code&state=test_state`
- **Error Callback**: `https://spotify-llm-driven-playlist.netlify.app/auth/callback/?error=access_denied`

## Test Scenarios

### Success Cases

- Valid authorization code with state
- Different state values
- Long authorization codes

### Error Cases

- Access denied by user
- Invalid request parameters
- Missing authorization code

### Edge Cases

- Empty callback URL
- Malformed parameters
- Special characters in parameters

## Browser Console Testing

```javascript
// Test URL parsing
const params = new URLSearchParams(window.location.search);
console.log('Code:', params.get('code'));

// Test localStorage
localStorage.setItem('test', 'value');
console.log('Test:', localStorage.getItem('test'));
```

## Test Results

All tests should show:

- **38/38 tests passing**
- **~0.58 seconds execution time**
- **Mixed environment optimization**

## 🚨 Troubleshooting

**Netlify CLI not found:**

```bash
npm install -g netlify-cli
```

**Tests failing:**

```bash
npm install  # Reinstall dependencies
```

**Port conflicts:**

```bash
netlify dev --port 8889  # Use different port
```
