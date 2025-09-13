# 🌐 Netlify & Goseland.org Testing Guide

## 🚀 **Current Deployment Status**

### **Netlify Project**

- **Project**: spotify-llm-driven-playlist
- **URL**: <https://spotify-llm-driven-playlist.netlify.app>
- **Admin**: <https://app.netlify.com/projects/spotify-llm-driven-playlist>
- **Status**: ✅ Linked and ready for deployment

### **Custom Domain**

- **Domain**: goseland.org
- **Project**: goseland (separate Netlify project)
- **URL**: <https://goseland.org>

## 🧪 **Testing Strategy**

### **Phase 1: Deploy to Netlify**

```bash
# Deploy current code to Netlify
git add .
git commit -m "Deploy with callback testing fixes"
git push origin main

# Or deploy directly with Netlify CLI
netlify deploy --prod
```

### **Phase 2: Test on Netlify**

#### **Main Application Testing**

```bash
# Test main interface
curl -s "https://spotify-llm-driven-playlist.netlify.app" | grep -i "neural bard"

# Test API endpoint
curl -X POST "https://spotify-llm-driven-playlist.netlify.app/api/neural-bard" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Create a test playlist"}'
```

#### **Callback Testing**

```bash
# Test callback endpoint
curl -s "https://spotify-llm-driven-playlist.netlify.app/auth/callback/" | grep -i "spotify\|callback"

# Test callback with parameters
curl -s "https://spotify-llm-driven-playlist.netlify.app/auth/callback/?code=test_code&state=test_state"

# Test error callback
curl -s "https://spotify-llm-driven-playlist.netlify.app/auth/callback/?error=access_denied"
```

### **Phase 3: Test on Goseland.org**

#### **Option A: Subdomain Setup**

```bash
# Set up subdomain: spotify.goseland.org
# In Netlify admin, add custom domain: spotify.goseland.org
# Point DNS to Netlify
```

#### **Option B: Path-based Setup**

```bash
# Set up path: goseland.org/spotify
# Configure redirects in goseland.org project
```

## 📋 **Complete Testing Checklist**

### **Netlify Testing (spotify-llm-driven-playlist.netlify.app)**

#### **1. Main Application**

- [ ] **Homepage loads**: <https://spotify-llm-driven-playlist.netlify.app>
- [ ] **Neural Bard interface**: Visible and functional
- [ ] **API endpoint**: `/api/neural-bard` responds correctly
- [ ] **Error handling**: Graceful error responses

#### **2. Callback Functionality**

- [ ] **Callback page**: <https://spotify-llm-driven-playlist.netlify.app/auth/callback/>
- [ ] **Success callback**: `?code=test_code&state=test_state`
- [ ] **Error callback**: `?error=access_denied`
- [ ] **Missing parameters**: `?state=test_state`
- [ ] **Empty callback**: `/auth/callback/`

#### **3. Test Interface**

- [ ] **Test page**: <https://spotify-llm-driven-playlist.netlify.app/test-callback.html>
- [ ] **Interactive testing**: All buttons work
- [ ] **URL generation**: Test URLs are correct

### **Goseland.org Testing**

#### **1. Domain Configuration**

- [ ] **DNS setup**: Point subdomain to Netlify
- [ ] **SSL certificate**: HTTPS working
- [ ] **Custom domain**: Accessible via goseland.org

#### **2. Integration Testing**

- [ ] **Cross-domain**: Test from goseland.org
- [ ] **CORS**: API calls work from custom domain
- [ ] **Redirects**: Proper redirect handling

## 🚀 **Deployment Commands**

### **Deploy to Netlify**

```bash
# Method 1: Git push (automatic deployment)
git add .
git commit -m "Deploy with testing fixes"
git push origin main

# Method 2: Direct deployment
netlify deploy --prod

# Method 3: Preview deployment
netlify deploy
```

### **Set up Custom Domain**

```bash
# Add custom domain to Netlify project
netlify domains:add spotify.goseland.org

# Or add path-based redirect
# Configure in goseland.org project admin
```

## 🧪 **Manual Testing URLs**

### **Netlify URLs**

```bash
# Main application
https://spotify-llm-driven-playlist.netlify.app

# Callback testing
https://spotify-llm-driven-playlist.netlify.app/auth/callback/?code=test_code&state=test_state
https://spotify-llm-driven-playlist.netlify.app/auth/callback/?error=access_denied
https://spotify-llm-driven-playlist.netlify.app/auth/callback/?state=test_state

# Test interface
https://spotify-llm-driven-playlist.netlify.app/test-callback.html

# API testing
https://spotify-llm-driven-playlist.netlify.app/api/neural-bard
```

### **Goseland.org URLs (after setup)**

```bash
# Subdomain approach
https://spotify.goseland.org
https://spotify.goseland.org/auth/callback/?code=test_code&state=test_state

# Path-based approach
https://goseland.org/spotify
https://goseland.org/spotify/auth/callback/?code=test_code&state=test_state
```

## 🔧 **Environment Variables**

### **Required for Production**

```bash
# Set in Netlify admin or via CLI
netlify env:set X_AI_API_KEY "your-api-key"
netlify env:set SPOTIFY_CLIENT_ID "your-client-id"
netlify env:set SPOTIFY_CLIENT_SECRET "your-client-secret"
```

### **Check Current Variables**

```bash
# List environment variables
netlify env:list

# Get specific variable
netlify env:get X_AI_API_KEY
```

## 📊 **Testing Results Template**

### **Netlify Testing Results**

```text
✅ Main Application: [PASS/FAIL]
✅ Callback Functionality: [PASS/FAIL]
✅ API Endpoints: [PASS/FAIL]
✅ Error Handling: [PASS/FAIL]
✅ Test Interface: [PASS/FAIL]

Issues Found:
- [List any issues]
```text

### **Goseland.org Testing Results**

```

✅ Domain Setup: [PASS/FAIL]
✅ SSL Certificate: [PASS/FAIL]
✅ Cross-domain Access: [PASS/FAIL]
✅ CORS Configuration: [PASS/FAIL]

Issues Found:

- [List any issues]

```text

## 🚨 **Troubleshooting**

### **Common Issues**

1. **404 on callback**: Check netlify.toml redirects
2. **CORS errors**: Verify API endpoint configuration
3. **Environment variables**: Check Netlify admin settings
4. **Custom domain**: Verify DNS configuration

### **Debug Commands**

```bash
# Check deployment status
netlify status

# View deployment logs
netlify logs

# Test specific endpoint
curl -v "https://spotify-llm-driven-playlist.netlify.app/auth/callback/"

# Check environment variables
netlify env:list
```

## 🎯 **Next Steps**

1. **Deploy to Netlify** using git push or CLI
2. **Test all URLs** on Netlify domain
3. **Set up custom domain** (goseland.org)
4. **Test cross-domain functionality**
5. **Monitor and iterate**

Ready to deploy and test! 🚀
