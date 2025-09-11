import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap'
import PlaylistGenerator from './components/PlaylistGenerator'
import TrackSearch from './components/TrackSearch'
import PlaylistManager from './components/PlaylistManager'
import NotFound from './components/NotFound'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true) // Demo mode - always authenticated
  const [user, setUser] = useState({ display_name: 'Demo User' }) // Mock user
  const [error, setError] = useState(null)

  const handleLogin = () => {
    // Demo mode - just show success message
    alert('Demo Mode: Spotify authentication would be implemented here!')
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUser(null)
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
    <Router>
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
          <Alert variant="info" className="mb-4">
            <i className="fas fa-info-circle me-2"></i>
            <strong>Demo Mode:</strong> This is a demonstration of the LLM-powered playlist generator. 
            Spotify integration would be added for full functionality.
          </Alert>

          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Routes>
            <Route path="/" element={
              <>
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
              </>
            } />
            <Route path="/dashboard" element={
              <>
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
              </>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Container>
      </div>
    </Router>
  )
}

export default App
