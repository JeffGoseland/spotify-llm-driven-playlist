/**
 * Unit tests for neural-bard.js Netlify function
 */

// Mock the handler function
const handler = require('../../netlify/functions/neural-bard.js').handler;

// Mock fetch globally
global.fetch = jest.fn();

describe('Neural Bard Netlify Function', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.GROQ_API_KEY = 'test-api-key';
    });

    describe('CORS Handling', () => {
        test('should handle OPTIONS preflight request', async () => {
            const event = {
                httpMethod: 'OPTIONS',
                headers: {}
            };

            const result = await handler(event, {});

            expect(result.statusCode).toBe(200);
            expect(result.headers['Access-Control-Allow-Origin']).toBe('*');
            expect(result.headers['Access-Control-Allow-Methods']).toBe('POST, OPTIONS');
            expect(result.body).toBe('');
        });

        test('should include CORS headers in all responses', async () => {
            const event = {
                httpMethod: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ prompt: 'test', numberOfSongs: 10 })
            };

            // Mock successful API response
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    choices: [{ message: { content: 'Test response' } }],
                    usage: { total_tokens: 100 },
                    model: 'grok-3-fast'
                })
            });

            const result = await handler(event, {});

            expect(result.headers['Access-Control-Allow-Origin']).toBe('*');
        });
    });

    describe('Request Validation', () => {
        test('should reject non-POST requests', async () => {
            const event = {
                httpMethod: 'GET',
                headers: {}
            };

            const result = await handler(event, {});

            expect(result.statusCode).toBe(405);
            expect(JSON.parse(result.body).error).toBe('Method not allowed');
        });

        test('should require prompt', async () => {
            const event = {
                httpMethod: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ numberOfSongs: 10 })
            };

            const result = await handler(event, {});

            expect(result.statusCode).toBe(400);
            expect(JSON.parse(result.body).error).toBe('Prompt is required');
        });

        test('should validate number of songs', async () => {
            const event = {
                httpMethod: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ prompt: 'test', numberOfSongs: 100 })
            };

            const result = await handler(event, {});

            expect(result.statusCode).toBe(400);
            expect(JSON.parse(result.body).error).toBe('Number of songs must be between 5 and 50');
        });

        test('should accept valid request', async () => {
            const event = {
                httpMethod: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ prompt: 'test', numberOfSongs: 25 })
            };

            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    choices: [{ message: { content: 'Test response' } }],
                    usage: { total_tokens: 100 },
                    model: 'grok-3-fast'
                })
            });

            const result = await handler(event, {});

            expect(result.statusCode).toBe(200);
        });
    });

    describe('API Integration', () => {
        test('should call x.ai API with correct parameters', async () => {
            const event = {
                httpMethod: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ prompt: 'test prompt', numberOfSongs: 15 })
            };

            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    choices: [{ message: { content: 'Test response' } }],
                    usage: { total_tokens: 100 },
                    model: 'grok-3-fast'
                })
            });

            await handler(event, {});

            expect(global.fetch).toHaveBeenCalledWith(
                'https://api.x.ai/v1/chat/completions',
                expect.objectContaining({
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer test-api-key'
                    },
                    body: expect.stringContaining('test prompt')
                })
            );
        });

        test('should handle API errors', async () => {
            const event = {
                httpMethod: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ prompt: 'test', numberOfSongs: 25 })
            };

            global.fetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error'
            });

            const result = await handler(event, {});

            expect(result.statusCode).toBe(500);
            expect(JSON.parse(result.body).error).toContain('mystical error');
        });

        test('should handle missing API key', async () => {
            delete process.env.GROQ_API_KEY;

            const event = {
                httpMethod: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ prompt: 'test', numberOfSongs: 25 })
            };

            const result = await handler(event, {});

            expect(result.statusCode).toBe(500);
            expect(JSON.parse(result.body).error).toBe('x.ai API key not configured');
        });
    });

    describe('Response Formatting', () => {
        test('should format successful response correctly', async () => {
            const event = {
                httpMethod: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ prompt: 'test prompt', numberOfSongs: 20 })
            };

            const mockApiResponse = {
                choices: [{ message: { content: 'Generated playlist response' } }],
                usage: { total_tokens: 150 },
                model: 'grok-3-fast'
            };

            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockApiResponse)
            });

            const result = await handler(event, {});
            const responseBody = JSON.parse(result.body);

            expect(result.statusCode).toBe(200);
            expect(responseBody.prompt).toBe('test prompt');
            expect(responseBody.response).toBe('Generated playlist response');
            expect(responseBody.bardData.status).toBe('divination_complete');
            expect(responseBody.bardData.tokens_used).toBe(150);
        });

        test('should handle invalid API response structure', async () => {
            const event = {
                httpMethod: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ prompt: 'test', numberOfSongs: 25 })
            };

            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ invalid: 'response' })
            });

            const result = await handler(event, {});

            expect(result.statusCode).toBe(500);
            expect(JSON.parse(result.body).error).toContain('mystical error');
        });
    });

    describe('Error Handling', () => {
        test('should handle JSON parsing errors', async () => {
            const event = {
                httpMethod: 'POST',
                headers: { 'content-type': 'application/json' },
                body: 'invalid json'
            };

            const result = await handler(event, {});

            expect(result.statusCode).toBe(500);
            expect(JSON.parse(result.body).error).toContain('mystical error');
        });

        test('should handle network errors', async () => {
            const event = {
                httpMethod: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ prompt: 'test', numberOfSongs: 25 })
            };

            global.fetch.mockRejectedValueOnce(new Error('Network error'));

            const result = await handler(event, {});

            expect(result.statusCode).toBe(500);
            expect(JSON.parse(result.body).error).toContain('mystical error');
            expect(JSON.parse(result.body).details).toBe('Network error');
        });
    });
});
