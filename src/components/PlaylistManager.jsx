import React, { useState, useEffect } from 'react'
import { Card, Button, Alert, Row, Col } from 'react-bootstrap'

const PlaylistManager = () => {
  const [playlists, setPlaylists] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPlaylists()
  }, [])

  const fetchPlaylists = async () => {
    // Demo mode - mock playlists
    setTimeout(() => {
      const mockPlaylists = [
        {
          id: 'demo1',
          name: 'My Workout Mix',
          description: 'High energy tracks for exercise',
          tracks: 15,
          public: true,
          url: 'https://open.spotify.com/playlist/demo1'
        },
        {
          id: 'demo2', 
          name: 'Chill Vibes',
          description: 'Relaxing music for studying',
          tracks: 20,
          public: false,
          url: 'https://open.spotify.com/playlist/demo2'
        },
        {
          id: 'demo3',
          name: 'Party Hits',
          description: 'Upbeat tracks for dancing',
          tracks: 25,
          public: true,
          url: 'https://open.spotify.com/playlist/demo3'
        }
      ]
      setPlaylists(mockPlaylists)
      setIsLoading(false)
    }, 1000)
  }

  const createPlaylist = async (name, description) => {
    // Demo mode - add to mock playlists
    const newPlaylist = {
      id: `demo${Date.now()}`,
      name,
      description,
      tracks: 0,
      public: true,
      url: `https://open.spotify.com/playlist/demo${Date.now()}`
    }
    setPlaylists([...playlists, newPlaylist])
    return newPlaylist
  }

  if (isLoading) {
    return (
      <Card>
        <Card.Body className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </Card.Body>
      </Card>
    )
  }

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5><i className="fas fa-list me-2"></i>Your Playlists</h5>
        <Button variant="outline-primary" size="sm" onClick={fetchPlaylists}>
          <i className="fas fa-sync me-1"></i>Refresh
        </Button>
      </Card.Header>
      <Card.Body>
        {error && (
          <Alert variant="danger">
            {error}
          </Alert>
        )}

        {playlists.length === 0 ? (
          <p className="text-muted text-center">No playlists found. Create one using the AI generator above!</p>
        ) : (
          <Row>
            {playlists.map((playlist) => (
              <Col md={6} lg={4} key={playlist.id} className="mb-3">
                <Card className="h-100">
                  <Card.Body>
                    <h6 className="card-title">{playlist.name}</h6>
                    <p className="card-text text-muted small">
                      {playlist.tracks} tracks • {playlist.public ? 'Public' : 'Private'}
                    </p>
                    {playlist.description && (
                      <p className="card-text small">{playlist.description}</p>
                    )}
                    <div className="d-grid gap-2">
                      <a
                        href={playlist.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-success btn-sm"
                      >
                        <i className="fab fa-spotify me-1"></i>Open in Spotify
                      </a>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card.Body>
    </Card>
  )
}

export default PlaylistManager
