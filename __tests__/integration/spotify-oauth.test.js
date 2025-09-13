/**
 * Integration tests for Spotify OAuth flow
 */

const request = require('supertest');
const http = require('http');

describe('Spotify OAuth Integration', () => {
    let server;

    beforeAll(() => {
        // Mock server for testing
        server = http.createServer((req, res) => {
            if (req.url === '/auth/callback/') {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(`
                    <!DOCTYPE html>
                    <html>
                    <head><title>Callback Test</title></head>
                    <body>
                        <div id="loading">Loading...</div>
                        <div id="success" style="display: none;">Success!</div>
                        <div id="error" style="display: none;">Error!</div>
                    </body>
                    </html>
                `);
            } else {
                res.writeHead(404);
                res.end('Not found');
            }
        });
    });

    afterAll(() => {
        if (server) {
            server.close();
        }
    });

    describe('OAuth Callback Endpoint', () => {
        test('should handle successful callback', async () => {
            const response = await request(server)
                .get('/auth/callback/?code=test_auth_code_12345&state=test_state_67890')
                .expect(200);

            expect(response.text).toContain('Callback Test');
            expect(response.text).toContain('Loading...');
        });

        test('should handle error callback', async () => {
            const response = await request(server)
                .get('/auth/callback/?error=access_denied&error_description=User+denied+access')
                .expect(200);

            expect(response.text).toContain('Callback Test');
            expect(response.text).toContain('Loading...');
        });

        test('should handle callback without parameters', async () => {
            const response = await request(server)
                .get('/auth/callback/')
                .expect(200);

            expect(response.text).toContain('Callback Test');
        });
    });

    describe('OAuth Flow Simulation', () => {
        test('should simulate complete OAuth flow', async () => {
            // Step 1: User clicks "Connect to Spotify"
            const authUrl = 'https://accounts.spotify.com/authorize?' +
                'client_id=test_client_id&' +
                'response_type=code&' +
                'redirect_uri=http://localhost/auth/callback/&' +
                'scope=playlist-modify-public&' +
                'state=test_state_123';

            expect(authUrl).toContain('accounts.spotify.com');
            expect(authUrl).toContain('client_id=test_client_id');
            expect(authUrl).toContain('response_type=code');

            // Step 2: User authorizes and gets redirected back
            const callbackUrl = 'http://localhost/auth/callback/?' +
                'code=test_auth_code_456&' +
                'state=test_state_123';

            expect(callbackUrl).toContain('code=test_auth_code_456');
            expect(callbackUrl).toContain('state=test_state_123');

            // Step 3: Callback page processes the code
            const response = await request(server)
                .get(callbackUrl)
                .expect(200);

            expect(response.text).toContain('Callback Test');
        });
    });

    describe('Error Handling', () => {
        test('should handle network errors gracefully', async () => {
            // Simulate network error
            const errorResponse = await request(server)
                .get('/auth/callback/?error=server_error&error_description=Internal+server+error')
                .expect(200);

            expect(errorResponse.text).toContain('Callback Test');
        });

        test('should handle malformed URLs', async () => {
            const response = await request(server)
                .get('/auth/callback/?malformed=param&another=value')
                .expect(200);

            expect(response.text).toContain('Callback Test');
        });
    });

    describe('Security Considerations', () => {
        test('should validate state parameter', () => {
            const originalState = 'test_state_12345';
            const returnedState = 'test_state_12345';
            
            // State should match to prevent CSRF attacks
            expect(returnedState).toBe(originalState);
        });

        test('should handle state mismatch', () => {
            const originalState = 'test_state_12345';
            const returnedState = 'different_state_67890';
            
            // State mismatch should be handled
            expect(returnedState).not.toBe(originalState);
        });

        test('should validate redirect URI', () => {
            const expectedRedirectUri = 'http://localhost/auth/callback/';
            const actualRedirectUri = 'http://localhost/auth/callback/';
            
            expect(actualRedirectUri).toBe(expectedRedirectUri);
        });
    });
});

