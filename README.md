# Neural Bard - Spotify LLM Playlist Generator

A mystical AI-powered playlist generator that combines the wisdom of ancient soothsayers with cutting-edge computer science to divine perfect playlists.

## ✨ Features

- **Neural Bard Interface** - Mystical AI that speaks in a tech-savvy, poetic manner
- **Natural Language Input** - Describe your perfect playlist in plain English
- **x.ai Grok Integration** - Powered by Grok-3-fast for intelligent responses
- **Security Features** - Rate limiting, input validation, and monitoring
- **Netlify Deployment** - Serverless functions with automatic scaling

## 🚀 Live Demo

Visit: <https://spotify-llm-driven-playlist.netlify.app/>

## 🎵 How It Works

1. **Speak to the Neural Bard** - Enter your musical desires in the mystical interface
2. **Consult the Oracle** - The Neural Bard processes your request with AI magic
3. **Receive Divination** - Get detailed playlist recommendations with track explanations
4. **Channel the Music** - Use the recommendations on your preferred streaming platform

## 🛠️ Tech Stack

- **Frontend**: HTML5 + Bootstrap 5 + Vanilla JavaScript
- **Backend**: Netlify Functions (serverless)
- **AI**: x.ai Grok-3-fast model
- **Deployment**: Netlify with automatic builds
- **Security**: Rate limiting, input validation, CORS protection

## 🔧 Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Test locally: `netlify dev`
4. Deploy: `git push origin main`

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

## 📝 API Usage

```bash
curl -X POST https://spotify-llm-driven-playlist.netlify.app/api/neural-bard \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Create a playlist for coding late at night"}'
```

## 🌟 Example Prompts

- "Create a playlist for coding late at night"
- "Make a workout playlist for the gym"
- "Generate a playlist for a road trip"
- "I need music for studying"
- "Create a romantic dinner playlist"
