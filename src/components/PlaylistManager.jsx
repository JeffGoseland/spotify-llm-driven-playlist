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
    try {
      const response = await fetch('/api/user-playlists', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('spotify_token')}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch playlists')
      }

      const data = await response.json()
      setPlaylists(data.playlists || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const createPlaylist = async (name, description) => {
    try {
      const response = await fetch('/api/create-playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('spotify_token')}`
        },
        body: JSON.stringify({ name, description })
      })

      if (!response.ok) {
        throw new Error('Failed to create playlist')
      }

      const data = await response.json()
      setPlaylists([...playlists, data.playlist])
      return data.playlist
    } catch (err) {
      setError(err.message)
      return null
    }
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
