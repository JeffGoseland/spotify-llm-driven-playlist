# 🎵 Spotify Integration Plan

## 🎯 **Integration Overview**

We'll replace the simulated token exchange with real Spotify API integration to enable actual playlist creation.

## 📋 **Step-by-Step Implementation**

### **1. Spotify Developer App Setup**

#### **Register App**

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
2. Click "Create an App"
3. Fill in details:
   - **App Name**: Neural Bard Playlist Generator
   - **App Description**: AI-powered playlist generator
   - **Redirect URI**: `https://spotify-llm-driven-playlist.netlify.app/auth/callback/`
4. Get **Client ID** and **Client Secret**

#### **Set Redirect URIs**

Add these redirect URIs in Spotify dashboard:

- `https://spotify-llm-driven-playlist.netlify.app/auth/callback/`
- `http://localhost:8888/auth/callback/` (for local testing)

### **2. Environment Variables Setup**

```bash
# Set in Netlify admin
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
```

### **3. Create Spotify Token Exchange Function**

#### **New Netlify Function: `spotify-token-exchange.js`**

```javascript
// Exchange authorization code for access token
// Handle token refresh
// Return user's Spotify profile info
```

### **4. Update Callback Handler**

#### **Replace Simulated Exchange**

- Remove `simulateTokenExchange()` function
- Implement real token exchange with Spotify API
- Handle errors and edge cases
- Store tokens securely

### **5. Implement Playlist Creation**

#### **New Netlify Function: `spotify-playlist.js`**

```javascript
// Create playlist on user's Spotify account
// Add tracks to playlist
// Handle Spotify API responses
```

### **6. Update Neural Bard Integration**

#### **Connect AI to Spotify**

- Parse AI-generated song recommendations
- Search Spotify for matching tracks
- Create actual playlists
- Return playlist URL to user

## 🔧 **Technical Implementation**

### **Authentication Flow**

1. **User clicks "Connect to Spotify"**
2. **Redirect to Spotify authorization**
3. **User authorizes app**
4. **Spotify redirects with code**
5. **Exchange code for tokens**
6. **Store tokens securely**
7. **Enable playlist creation**

### **API Endpoints Needed**

#### **Token Exchange**

```text
POST /api/spotify-token-exchange
Body: { code, redirectUri }
Response: { accessToken, refreshToken, expiresIn, user }
```

#### **Playlist Creation**

```text
POST /api/spotify-playlist
Body: { prompt, numberOfSongs, accessToken }
Response: { playlistUrl, playlistId, tracks }
```

### **Required Scopes**

```text
playlist-modify-public
playlist-modify-private
user-read-email
user-read-private
```

## 🚀 **Implementation Steps**

### **Phase 1: Authentication (Priority 1)**

- [ ] Set up Spotify Developer App
- [ ] Create token exchange function
- [ ] Update callback handler
- [ ] Test authentication flow

### **Phase 2: Playlist Creation (Priority 2)**

- [ ] Create playlist creation function
- [ ] Integrate with Neural Bard
- [ ] Handle track searching
- [ ] Test playlist creation

### **Phase 3: UI Updates (Priority 3)**

- [ ] Add "Connect to Spotify" button
- [ ] Update success messages
- [ ] Show playlist links
- [ ] Handle error states

## 🔒 **Security Considerations**

### **Token Storage**

- Store access tokens in localStorage (temporary)
- Implement token refresh logic
- Handle expired tokens gracefully

### **API Security**

- Validate all inputs
- Rate limit requests
- Handle API errors properly
- Secure environment variables

## 📊 **Testing Strategy**

### **Authentication Testing**

- Test authorization flow
- Test token exchange
- Test token refresh
- Test error handling

### **Playlist Testing**

- Test playlist creation
- Test track addition
- Test various prompt types
- Test error scenarios

## 🎯 **Success Criteria**

- [ ] Users can authenticate with Spotify
- [ ] AI generates relevant song recommendations
- [ ] Playlists are created on user's Spotify account
- [ ] Users can access their created playlists
- [ ] Error handling works properly
- [ ] Local and production environments work

## 📝 **Next Steps**

1. **Set up Spotify Developer App**
2. **Create token exchange function**
3. **Update callback handler**
4. **Test authentication flow**
5. **Implement playlist creation**
6. **Update UI for Spotify integration**

Ready to start implementation! 🚀
