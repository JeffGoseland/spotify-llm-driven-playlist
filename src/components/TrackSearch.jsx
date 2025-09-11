import React, { useState } from 'react'
import { Card, Form, Button, Alert } from 'react-bootstrap'

const TrackSearch = () => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState(null)

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Please enter a search query')
      return
    }

    setIsSearching(true)
    setError(null)

    try {
      const response = await fetch(`/api/search-tracks?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('spotify_token')}`
        }
      })

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data = await response.json()
      setResults(data.tracks || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <Card>
      <Card.Header>
        <h5><i className="fas fa-search me-2"></i>Track Search</h5>
      </Card.Header>
      <Card.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for tracks, artists, or albums..."
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </Form.Group>

          <Button
            variant="primary"
            onClick={handleSearch}
            disabled={isSearching}
            className="w-100"
          >
            {isSearching ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Searching...
              </>
            ) : (
              <>
                <i className="fas fa-search me-2"></i>Search
              </>
            )}
          </Button>
        </Form>

        {error && (
          <Alert variant="danger" className="mt-3">
            {error}
          </Alert>
        )}

        {results.length > 0 && (
          <div className="mt-3">
            <h6>Search Results:</h6>
            <div className="search-results">
              {results.map((track, index) => (
                <div key={index} className="card mb-2 track-card">
                  <div className="card-body d-flex align-items-center">
                    <div className="flex-grow-1">
                      <h6 className="mb-1">{track.name}</h6>
                      <p className="mb-1 text-muted">{track.artist} • {track.album}</p>
                    </div>
                    <div className="ms-3">
                      <a href={track.external_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-success">
                        <i className="fab fa-spotify"></i>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  )
}

export default TrackSearch
