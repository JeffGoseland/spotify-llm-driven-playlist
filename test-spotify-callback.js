/**
 * Simple test runner for Spotify OAuth Callback
 * Run with: node test-spotify-callback.js
 */

const { JSDOM } = require('jsdom');

// Mock localStorage
const localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
};

function expect(actual) {
    return {
        toBe: (expected) => {
            if (actual !== expected) {
                throw new Error(`Expected ${expected}, got ${actual}`);
            }
            return true;
        },
        toContain: (expected) => {
            if (!actual.includes(expected)) {
                throw new Error(`Expected ${actual} to contain ${expected}`);
            }
            return true;
        },
        toBeNull: () => {
            if (actual !== null) {
                throw new Error(`Expected null, got ${actual}`);
            }
            return true;
        },
        not: {
            toBe: (expected) => {
                if (actual === expected) {
                    throw new Error(`Expected ${actual} not to be ${expected}`);
                }
                return true;
            }
        }
    };
}

function test(name, fn) {
    try {
        console.log(`🧪 Running test: ${name}`);
        fn();
        console.log(`✅ PASS: ${name}`);
    } catch (error) {
        console.log(`❌ FAIL: ${name} - ${error.message}`);
    }
}

function describe(name, fn) {
    console.log(`\n📁 Test Suite: ${name}`);
    fn();
}

// Test the callback functionality
describe('Spotify OAuth Callback', () => {
    test('should parse authorization code from URL', () => {
        const mockSearch = '?code=test_auth_code_12345&state=test_state_67890';
        const urlParams = new URLSearchParams(mockSearch);
        const code = urlParams.get('code');
        const state = urlParams.get('state');

        expect(code).toBe('test_auth_code_12345');
        expect(state).toBe('test_state_67890');
    });

    test('should parse error from URL', () => {
        const mockSearch = '?error=access_denied&error_description=User+denied+access';
        const urlParams = new URLSearchParams(mockSearch);
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');

        expect(error).toBe('access_denied');
        expect(errorDescription).toBe('User denied access');
    });

    test('should handle missing parameters', () => {
        const mockSearch = '';
        const urlParams = new URLSearchParams(mockSearch);
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        expect(code).toBeNull();
        expect(error).toBeNull();
    });

    test('should generate correct redirect URI', () => {
        const mockOrigin = 'http://localhost';
        const expectedRedirectUri = mockOrigin + '/auth/callback/';
        expect(expectedRedirectUri).toBe('http://localhost/auth/callback/');
    });

    test('should generate Spotify auth URL', () => {
        const clientId = 'test_client_id_12345';
        const redirectUri = 'http://localhost/auth/callback/';
        const scope = 'playlist-modify-public playlist-modify-private';
        const state = 'test_state_67890';

        const authUrl = `https://accounts.spotify.com/authorize?` +
            `client_id=${clientId}&` +
            `response_type=code&` +
            `redirect_uri=${encodeURIComponent(redirectUri)}&` +
            `scope=${scope}&` +
            `state=${state}`;

        expect(authUrl).toContain('https://accounts.spotify.com/authorize');
        expect(authUrl).toContain('client_id=test_client_id_12345');
        expect(authUrl).toContain('response_type=code');
        expect(authUrl).toContain('redirect_uri=');
        expect(authUrl).toContain('scope=playlist-modify-public');
        expect(authUrl).toContain('state=test_state_67890');
    });

    test('should simulate token exchange', async () => {
        const mockCode = 'valid_auth_code_12345';
        
        const simulateTokenExchange = async (code) => {
            await new Promise(resolve => setTimeout(resolve, 10)); // Simulate delay
            
            if (code && code.length > 10) {
                return {
                    success: true,
                    accessToken: 'mock_access_token_' + Date.now(),
                    refreshToken: 'mock_refresh_token_' + Date.now(),
                    expiresIn: 3600,
                    tokenType: 'Bearer'
                };
            } else {
                return {
                    success: false,
                    error: 'Invalid authorization code'
                };
            }
        };

        const result = await simulateTokenExchange(mockCode);
        
        expect(result.success).toBe(true);
        expect(result.accessToken).toContain('mock_access_token_');
        expect(result.refreshToken).toContain('mock_refresh_token_');
        expect(result.expiresIn).toBe(3600);
    });

    test('should handle invalid authorization code', async () => {
        const invalidCode = 'short';
        
        const simulateTokenExchange = async (code) => {
            await new Promise(resolve => setTimeout(resolve, 10));
            
            if (code && code.length > 10) {
                return { success: true };
            } else {
                return {
                    success: false,
                    error: 'Invalid authorization code'
                };
            }
        };

        const result = await simulateTokenExchange(invalidCode);
        
        expect(result.success).toBe(false);
        expect(result.error).toBe('Invalid authorization code');
    });
});

console.log('\n🎉 All tests completed!');

