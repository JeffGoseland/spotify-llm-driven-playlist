# Neural Bard - Spotify LLM Playlist Generator

A mystical AI-powered playlist generator that combines the wisdom of ancient soothsayers with cutting-edge computer science to divine perfect playlists.

## Features

- **Neural Bard Interface** - Mystical AI that speaks in a tech-savvy, poetic manner
- **Natural Language Input** - Describe your perfect playlist in plain English
- **Spotify Integration** - Real OAuth authentication and playlist creation
- **Custom Playlist Titles** - Name your playlists or let Neural Bard create unique names
- **Duplicate Prevention** - Automatically detects existing playlists with the same name
- **Smart Playlist Management** - Option to replace tracks in existing playlists
- **Real-time Notifications** - Toast notifications for all actions and status updates
- **Enhanced UX** - Improved progress indicators and user feedback
- **x.ai Grok Integration** - Powered by Grok-3-fast for intelligent responses
- **Security Features** - Rate limiting, input validation, and monitoring
- **Netlify Deployment** - Serverless functions with automatic scaling

## Live Demo

Visit: <https://spotify-llm-driven-playlist.netlify.app/>

## How It Works

1. **Connect to Spotify** - Authenticate with your Spotify account (with improved success feedback)
2. **Speak to the Neural Bard** - Enter your musical desires in the mystical interface
3. **Customize Your Playlist** - Optionally set a custom title and choose playlist behavior
4. **Consult the Oracle** - The Neural Bard processes your request with AI magic
5. **Receive Divination** - Get detailed playlist recommendations with track explanations
6. **Smart Playlist Creation** - Automatically checks for duplicates and creates/updates playlists
7. **Real-time Feedback** - Get instant notifications about playlist creation progress
8. **Enjoy the Magic** - Discover new music through the power of AI divination

## Tech Stack

- **Frontend**: HTML5 + Bootstrap 5 + Vanilla JavaScript
- **Backend**: Netlify Functions (serverless)
- **AI**: x.ai Grok-3-fast model
- **Deployment**: Netlify with automatic builds
- **Security**: Rate limiting, input validation, CORS protection

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Install Netlify CLI: `npm install -g netlify-cli` (if not already installed)
4. Test locally: `netlify dev`
5. Deploy: `git push origin main`

## 🎭 The Neural Bard Personality

The Neural Bard combines:

- **Pop culture nerd** sensibilities
- **Edgy, dark humor** in responses
- **Soothsayer** mystical language
- **Music computer science** expertise
- **Tech-savvy** algorithmic wisdom

## 🔒 Security Features

- Rate limiting (10 requests/minute per IP)
- Input validation and sanitization
- XSS protection
- CORS configuration
- Environment variable security
- Request logging and monitoring

## API Usage

### **Neural Bard API**

```bash
curl -X POST https://spotify-llm-driven-playlist.netlify.app/.netlify/functions/neural-bard \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Create a playlist for coding late at night", "numberOfSongs": 25}'
```

### **Spotify Playlist Creation API**

```bash
curl -X POST https://spotify-llm-driven-playlist.netlify.app/.netlify/functions/spotify-playlist \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "coding playlist",
    "numberOfSongs": 25,
    "accessToken": "your_spotify_token",
    "songs": ["Artist - Song Title"],
    "customTitle": "My Custom Playlist",
    "replaceExisting": false
  }'
```

### **Parameters**

- `prompt` - Description of the desired playlist
- `numberOfSongs` - Number of songs to generate (5-50)
- `accessToken` - Spotify OAuth access token
- `songs` - Array of song titles to add to playlist
- `customTitle` - Optional custom playlist name
- `replaceExisting` - Whether to replace tracks in existing playlists

## 🌟 Example Prompts

- "Create a playlist for coding late at night"
- "Make a workout playlist for the gym"
- "Generate a playlist for a road trip"
- "I need music for studying"
- "Create a romantic dinner playlist"

## 🆕 Recent Improvements

### **Enhanced User Experience**

- **Toast Notifications** - Real-time feedback with dark-themed, centered notifications
- **Custom Playlist Titles** - Name your playlists or use auto-generated titles
- **Duplicate Prevention** - Automatically detects and handles existing playlists
- **Smart Playlist Management** - Option to replace tracks in existing playlists
- **Improved Progress Tracking** - Visual progress indicators during playlist creation
- **Better Authentication Flow** - Enhanced OAuth callback with countdown and auto-redirect

### **Technical Enhancements**

- **Existing Playlist Detection** - Checks user's playlists before creating new ones
- **Track Replacement Logic** - Option to clear existing tracks before adding new ones
- **Enhanced Error Handling** - Better error messages and user feedback
- **Improved UI/UX** - Better positioning, styling, and user interactions
- **Real-time Status Updates** - Live progress indicators and success confirmations

### **User Interface Improvements**

- **Dark Theme Integration** - Toast notifications match app's aesthetic
- **Better Positioning** - Notifications appear at top-center for better visibility
- **Enhanced Feedback** - Clear success/error messages with appropriate icons
- **Responsive Design** - Works well on different screen sizes
- **Accessibility** - Proper ARIA labels and screen reader support

## Testing Guide

### **Test Suite Overview**

This project includes comprehensive testing for all components:

- **Unit Tests** - Jest-based tests for core functionality
- **Integration Tests** - API endpoint testing
- **UI Tests** - Browser-based interface testing
- **OAuth Callback Tests** - Spotify authentication flow testing

### **Running Tests**

```bash
# Run all tests
npm test

# Run specific test suites
npm test -- --testPathPattern=unit          # Unit tests only
npm test -- --testPathPattern=integration   # Integration tests only
npm test -- --testPathPattern=ui            # UI tests only
npm test -- --testPathPattern=spotify-callback # OAuth callback tests

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### **Test Environment Setup**

The project uses a **mixed environment approach** for optimal performance:

- **Node Environment** - For server-side tests (main.js, neural-bard.js)
- **jsdom Environment** - For DOM-dependent tests (spotify-callback.js)

This setup provides:

- **Fast execution** for server-side tests
- **Accurate browser simulation** for DOM tests
- **Minimal performance overhead**

### **Spotify OAuth Callback Testing**

#### **1. Automated Unit Tests**

```bash
# Test callback functionality
npm test -- --testPathPattern=spotify-callback

# Run standalone callback test
node test-spotify-callback.js
```

#### **2. Interactive Testing Interface**

```bash
# Start local server
netlify dev

# Visit test interface
http://localhost:8888/test-callback.html
```

#### **3. Manual URL Testing**

**Success Cases:**

```text
http://localhost:8888/auth/callback/?code=test_auth_code_12345&state=test_state_67890
https://spotify-llm-driven-playlist.netlify.app/auth/callback/?code=test_code&state=test_state
```

**Error Cases:**

```text
http://localhost:8888/auth/callback/?error=access_denied&error_description=User+denied+access
http://localhost:8888/auth/callback/?error=invalid_request
```

**Edge Cases:**

```text
http://localhost:8888/auth/callback/?state=test_state_67890
http://localhost:8888/auth/callback/
```

#### **4. Browser Console Testing**

```javascript
// Test URL parameter parsing
const params = new URLSearchParams(window.location.search);
console.log('Code:', params.get('code'));
console.log('State:', params.get('state'));

// Test localStorage functionality
localStorage.setItem('spotify_access_token', 'test_token');
console.log('Token:', localStorage.getItem('spotify_access_token'));
```

### **Test Coverage**

Current test coverage includes:

- **URL Parameter Parsing** - Authorization codes, errors, state validation
- **Token Storage** - localStorage operations and retrieval
- **UI State Management** - Loading, success, and error states
- **Token Exchange Simulation** - Success and failure scenarios
- **Redirect URL Generation** - Spotify auth URL construction
- **Error Handling** - Various error conditions and edge cases

### **Live Server Testing**

For production testing on Netlify:

```bash
# Test on live deployment
https://spotify-llm-driven-playlist.netlify.app/test-callback.html

# Test callback directly
https://spotify-llm-driven-playlist.netlify.app/auth/callback/?code=test_code&state=test_state
```

### **Test Files Structure**

```text
__tests__/
├── unit/
│   ├── main.test.js              # Main application logic
│   ├── neural-bard.test.js       # AI function testing
│   └── spotify-callback.test.js  # OAuth callback testing
├── integration/
│   ├── api.test.js              # API endpoint testing
│   └── spotify-oauth.test.js    # OAuth integration
├── ui/
│   └── ui.test.js               # User interface testing
└── setup.js                     # Test environment configuration

# Standalone test files
test-callback.html               # Interactive callback testing
test-spotify-callback.js         # Standalone callback test runner
```

### **Continuous Integration**

Tests run automatically on:

- **Local development** - `npm test`
- **Pull requests** - Automated CI/CD pipeline
- **Production deployment** - Pre-deployment validation

### **Troubleshooting Tests**

**Common Issues:**

1. **Netlify CLI not found**

   ```bash
   npm install -g netlify-cli
   ```

2. **Test environment issues**

   ```bash
   npm install  # Ensure all dependencies are installed
   ```

3. **Callback tests failing**
   - Check that jsdom is properly installed
   - Verify window.location mocking is working
   - Ensure localStorage is properly mocked

**Debug Mode:**

```bash
# Run tests with verbose output
npm test -- --verbose

# Run specific test with debugging
npm test -- --testNamePattern="should parse authorization code"
```
