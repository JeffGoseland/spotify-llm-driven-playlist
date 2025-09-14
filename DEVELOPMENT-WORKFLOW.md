# Development Workflow Guide

## 🚀 **Safe Development Process**

To avoid breaking production, we now use a proper Git branching workflow:

sly

- `main` - **Production branch** (stable, working code)
- `development` - **Development branch** (testing new features)
- `feature/*` - **Feature branches** (specific feature development)

### **Workflow Steps:**

#### 1. **Start New Development:**

```bash
# Switch to development branch
git checkout development

# Pull latest changes
git pull origin development

# Create feature branch for specific work
git checkout -b feature/your-feature-name
```

#### 2. **Make Changes & Test Locally:**

```bash
# Make your changes
# Test locally with: npm test
# Test the app locally with: npm start

# Commit changes
git add .
git commit -m "Add: your feature description"
```

#### 3. **Test on Development Branch:**

```bash
# Switch to development
git checkout development

# Merge feature branch
git merge feature/your-feature-name

# Push to development branch
git push origin development

# Test on development deployment (if available)
```

#### 4. **Deploy to Production:**

```bash
# Only when development is fully tested
git checkout main
git merge development
git push origin main

# Tag the release
git tag -a v1.1.0 -m "Release v1.1.0: Feature description"
git push origin v1.1.0
```

### **Emergency Hotfixes:**

```bash
# For critical production fixes
git checkout main
git checkout -b hotfix/issue-description

# Make minimal fix
git add .
git commit -m "Fix: critical production issue"

# Deploy immediately
git checkout main
git merge hotfix/issue-description
git push origin main
```

### **Testing Checklist Before Production:**

#### ✅ **Local Testing:**

- [ ] Run `npm test` - all tests pass
- [ ] Test app locally with `npm start`
- [ ] Test all major features:
  - [ ] Neural Bard playlist generation
  - [ ] Spotify OAuth flow
  - [ ] Playlist creation
  - [ ] Toast notifications
  - [ ] Copy/download functionality

#### ✅ **Cross-Platform Testing:**

- [ ] Test on localhost (development)
- [ ] Test on Netlify deployment
- [ ] Test on goseland.org deployment
- [ ] Verify all API endpoints work

#### ✅ **Browser Testing:**

- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (if available)
- [ ] Mobile responsiveness

### **Current Branch Status:**

- **Active Branch:** `development`
- **Production Branch:** `main` (stable)
- **Next Release:** Ready for testing on development branch

### **Quick Commands:**

```bash
# Check current branch
git branch

# See all branches
git branch -a

# Switch branches
git checkout main
git checkout development

# See recent commits
git log --oneline -10

# See what's changed
git status
git diff
```

### **Best Practices:**

1. **Never work directly on `main`** - always use feature branches
2. **Test thoroughly** before merging to development
3. **Test on development branch** before merging to main
4. **Use descriptive commit messages**
5. **Keep commits small and focused**
6. **Document breaking changes**

### **Current Development Status:**

- ✅ **Toast notifications** - Fixed styling for mystical dark theme
- ✅ **Multi-platform deployment** - Fixed API routing for goseland.org
- 🔄 **Testing phase** - Ready for development branch testing

---

**Remember:** When in doubt, test on the development branch first! 🛡️
