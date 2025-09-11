import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap'
import PlaylistGenerator from './components/PlaylistGenerator'
import TrackSearch from './components/TrackSearch'
import PlaylistManager from './components/PlaylistManager'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('spotify_token')
    if (token) {
      // Verify token is still valid
      fetchUserProfile(token)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        setIsAuthenticated(true)
      } else {
        // Token expired, clear it
        localStorage.removeItem('spotify_token')
      }
    } catch (err) {
      console.error('Error fetching user profile:', err)
      localStorage.removeItem('spotify_token')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = () => {
    const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID
    const redirectUri = window.location.origin + '/callback'
    const scopes = 'playlist-modify-public playlist-modify-private user-read-private user-read-email'
    
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`
    
    window.location.href = authUrl
  }

  const handleLogout = () => {
    localStorage.removeItem('spotify_token')
    setIsAuthenticated(false)
    setUser(null)
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Container className="mt-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <Card className="text-center shadow">
              <Card.Body className="p-5">
                <i className="fab fa-spotify fa-5x text-success mb-4"></i>
                <h1 className="display-4 mb-4">Spotify LLM Playlist Generator</h1>
                <p className="lead mb-4">
                  Create intelligent playlists using AI. Describe your mood, activity, or style 
                  and let our LLM generate the perfect playlist for you.
                </p>
                <Button size="lg" onClick={handleLogin} className="btn-success">
                  <i className="fab fa-spotify me-2"></i>Login with Spotify
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    )
  }

  return (
    <div className="App">
      <nav className="navbar navbar-dark bg-dark">
        <div className="container">
          <span className="navbar-brand">
            <i className="fab fa-spotify me-2"></i>Spotify LLM Generator
          </span>
          <div className="navbar-nav ms-auto">
            <span className="nav-link">Welcome, {user?.display_name}!</span>
            <button className="btn btn-outline-light btn-sm ms-2" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <Container className="mt-4">
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Row>
          <Col lg={6}>
            <PlaylistGenerator />
          </Col>
          <Col lg={6}>
            <TrackSearch />
          </Col>
        </Row>

        <Row className="mt-4">
          <Col>
            <PlaylistManager />
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default App
