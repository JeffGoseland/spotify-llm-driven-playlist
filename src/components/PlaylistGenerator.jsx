import React, { useState } from 'react'
import { Card, Form, Button, Alert, Row, Col } from 'react-bootstrap'

const PlaylistGenerator = () => {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description for your playlist')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/generate-playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('spotify_token')}`
        },
        body: JSON.stringify({ prompt })
      })

      if (!response.ok) {
        throw new Error('Failed to generate playlist')
      }

      const data = await response.json()
      setResults(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const quickPrompts = [
    "Create a workout playlist that starts slow and builds energy",
    "Make a sad playlist for a rainy day with indie artists",
    "Generate a party mix that transitions from pop to electronic",
    "Create a study playlist with ambient and instrumental music"
  ]

  return (
    <Card>
      <Card.Header>
        <h5><i className="fas fa-magic me-2"></i>AI Playlist Generator</h5>
      </Card.Header>
      <Card.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Describe your perfect playlist:</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Create a workout playlist that starts slow and builds energy..."
            />
          </Form.Group>

          <div className="mb-3">
            <small className="text-muted">Quick prompts:</small>
            <div className="mt-2">
              {quickPrompts.map((quickPrompt, index) => (
                <Button
                  key={index}
                  variant="outline-primary"
                  size="sm"
                  className="me-2 mb-2"
                  onClick={() => setPrompt(quickPrompt)}
                >
                  {quickPrompt}
                </Button>
              ))}
            </div>
          </div>

          <Button
            variant="success"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-100"
          >
            {isGenerating ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Generating...
              </>
            ) : (
              <>
                <i className="fas fa-magic me-2"></i>Generate Playlist
              </>
            )}
          </Button>
        </Form>

        {error && (
          <Alert variant="danger" className="mt-3">
            {error}
          </Alert>
        )}

        {results && (
          <div className="mt-3">
            <Alert variant="success">
              <h6>Generated Playlist: {results.name}</h6>
              <p className="mb-0">{results.description}</p>
            </Alert>
            
            <div className="search-results">
              {results.tracks?.map((track, index) => (
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

export default PlaylistGenerator
