import React from 'react'
import { Container, Row, Col, Card, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="text-center shadow">
            <Card.Body className="p-5">
              <i className="fas fa-exclamation-triangle fa-5x text-warning mb-4"></i>
              <h1 className="display-4 mb-4">404 - Page Not Found</h1>
              <p className="lead mb-4">
                The page you're looking for doesn't exist or has been moved.
              </p>
              <Button 
                variant="primary" 
                size="lg" 
                onClick={() => navigate('/')}
              >
                <i className="fas fa-home me-2"></i>Go Home
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default NotFound
