/**
 * Integration tests for API functionality
 */

const request = require('supertest');
const http = require('http');
const handler = require('../../netlify/functions/neural-bard.js').handler;

// Mock environment
process.env.GROQ_API_KEY = 'test-api-key';

// Mock fetch for integration tests
global.fetch = jest.fn();

describe('API Integration Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('End-to-End API Flow', () => {
        test('should handle complete request flow', async () => {
            const mockApiResponse = {
                choices: [{ 
                    message: { 
                        content: 'Here are some great songs:\n1. The Beatles - Hey Jude\n2. Queen - Bohemian Rhapsody\n3. Led Zeppelin - Stairway to Heaven' 
                    } 
                }],
                usage: { total_tokens: 200 },
                model: 'grok-3-fast'
            };

            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockApiResponse)
            });

            const event = {
                httpMethod: 'POST',
                headers: { 
                    'content-type': 'application/json',
                    'origin': 'http://127.0.0.1:5500'
                },
                body: JSON.stringify({ 
                    prompt: 'Create a rock playlist', 
                    numberOfSongs: 3 
                })
            };

            const result = await handler(event, {});
            const responseBody = JSON.parse(result.body);

            expect(result.statusCode).toBe(200);
            expect(responseBody.prompt).toBe('Create a rock playlist');
            expect(responseBody.response).toContain('The Beatles - Hey Jude');
            expect(responseBody.bardData.status).toBe('divination_complete');
        });

        test('should handle CORS preflight correctly', async () => {
            const event = {
                httpMethod: 'OPTIONS',
                headers: { 
                    'origin': 'http://127.0.0.1:5500',
                    'access-control-request-method': 'POST',
                    'access-control-request-headers': 'content-type'
                }
            };

            const result = await handler(event, {});

            expect(result.statusCode).toBe(200);
            expect(result.headers['Access-Control-Allow-Origin']).toBe('*');
            expect(result.headers['Access-Control-Allow-Methods']).toBe('POST, OPTIONS');
            expect(result.headers['Access-Control-Allow-Headers']).toBe('Content-Type');
        });
    });

    describe('Error Scenarios', () => {
        test('should handle API timeout', async () => {
            global.fetch.mockRejectedValueOnce(new Error('Request timeout'));

            const event = {
                httpMethod: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ 
                    prompt: 'test', 
                    numberOfSongs: 10 
                })
            };

            const result = await handler(event, {});
            const responseBody = JSON.parse(result.body);

            expect(result.statusCode).toBe(500);
            expect(responseBody.error).toContain('mystical error');
            expect(responseBody.details).toBe('Request timeout');
        });

        test('should handle API rate limiting', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: false,
                status: 429,
                statusText: 'Too Many Requests',
                text: () => Promise.resolve('Rate limit exceeded')
            });

            const event = {
                httpMethod: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ 
                    prompt: 'test', 
                    numberOfSongs: 10 
                })
            };

            const result = await handler(event, {});
            const responseBody = JSON.parse(result.body);

            expect(result.statusCode).toBe(500);
            expect(responseBody.error).toContain('mystical error');
            expect(responseBody.details).toContain('429');
        });
    });

    describe('Performance Tests', () => {
        test('should handle large responses efficiently', async () => {
            const largeResponse = {
                choices: [{ 
                    message: { 
                        content: Array.from({ length: 50 }, (_, i) => `Artist ${i} - Song ${i}`).join('\n')
                    } 
                }],
                usage: { total_tokens: 1000 },
                model: 'grok-3-fast'
            };

            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(largeResponse)
            });

            const event = {
                httpMethod: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ 
                    prompt: 'Create a large playlist', 
                    numberOfSongs: 50 
                })
            };

            const startTime = Date.now();
            const result = await handler(event, {});
            const endTime = Date.now();

            expect(result.statusCode).toBe(200);
            expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
        });
    });
});
