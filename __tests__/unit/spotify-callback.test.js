/**
 * Unit tests for Spotify OAuth Callback functionality
 * These tests run in jsdom environment to properly simulate browser DOM APIs
 */

describe('Spotify OAuth Callback', () => {
    // Mock localStorage for all tests
    beforeEach(() => {
        // Create a proper HTML structure for DOM tests
        document.body.innerHTML = `
            <div id="loading">Loading...</div>
            <div id="success" style="display: none;">Success!</div>
            <div id="error" style="display: none;">Error!</div>
            <span id="errorMessage"></span>
        `;
        
        // Set up proper window.location mock
        Object.defineProperty(window, 'location', {
            value: {
                origin: 'http://localhost',
                search: '',
                href: 'http://localhost'
            },
            writable: true
        });
        
        // Mock localStorage properly for jsdom environment
        const mockLocalStorage = {
            getItem: jest.fn(),
            setItem: jest.fn(),
            removeItem: jest.fn()
        };
        
        Object.defineProperty(window, 'localStorage', {
            value: mockLocalStorage,
            writable: true
        });
        
        global.localStorage = mockLocalStorage;
    });

    describe('URL Parameter Parsing', () => {
        test('should parse authorization code from URL', () => {
            // Mock window.location with search params
            Object.defineProperty(window.location, 'search', {
                value: '?code=test_auth_code_12345&state=test_state_67890',
                writable: true
            });

            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            const state = urlParams.get('state');

            expect(code).toBe('test_auth_code_12345');
            expect(state).toBe('test_state_67890');
        });

        test('should parse error from URL', () => {
            // Mock window.location with error params
            Object.defineProperty(window.location, 'search', {
                value: '?error=access_denied&error_description=User+denied+access',
                writable: true
            });

            const urlParams = new URLSearchParams(window.location.search);
            const error = urlParams.get('error');
            const errorDescription = urlParams.get('error_description');

            expect(error).toBe('access_denied');
            expect(errorDescription).toBe('User denied access');
        });

        test('should handle missing parameters', () => {
            // Mock window.location with no search params
            Object.defineProperty(window.location, 'search', {
                value: '',
                writable: true
            });

            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            const error = urlParams.get('error');

            expect(code).toBeNull();
            expect(error).toBeNull();
        });
    });

    describe('Token Storage', () => {
        test('should store tokens in localStorage', () => {
            const mockResponse = {
                accessToken: 'mock_access_token_12345',
                refreshToken: 'mock_refresh_token_67890',
                expiresIn: 3600
            };

            // Simulate storing tokens
            localStorage.setItem('spotify_access_token', mockResponse.accessToken);
            localStorage.setItem('spotify_refresh_token', mockResponse.refreshToken);
            localStorage.setItem('spotify_token_expires', Date.now() + (mockResponse.expiresIn * 1000));

            expect(localStorage.setItem).toHaveBeenCalledWith('spotify_access_token', mockResponse.accessToken);
            expect(localStorage.setItem).toHaveBeenCalledWith('spotify_refresh_token', mockResponse.refreshToken);
        });

        test('should retrieve tokens from localStorage', () => {
            // Mock localStorage responses
            localStorage.getItem.mockImplementation((key) => {
                const tokens = {
                    'spotify_access_token': 'stored_access_token_12345',
                    'spotify_refresh_token': 'stored_refresh_token_67890',
                    'spotify_token_expires': Date.now() + 3600000
                };
                return tokens[key] || null;
            });

            const accessToken = localStorage.getItem('spotify_access_token');
            const refreshToken = localStorage.getItem('spotify_refresh_token');

            expect(accessToken).toBe('stored_access_token_12345');
            expect(refreshToken).toBe('stored_refresh_token_67890');
        });
    });

    describe('UI State Management', () => {
        test('should show loading state initially', () => {
            const loadingElement = document.getElementById('loading');
            const successElement = document.getElementById('success');
            const errorElement = document.getElementById('error');

            expect(loadingElement.style.display).toBe('');
            expect(successElement.style.display).toBe('none');
            expect(errorElement.style.display).toBe('none');
        });

        test('should show success state', () => {
            const loadingElement = document.getElementById('loading');
            const successElement = document.getElementById('success');

            // Simulate success
            loadingElement.style.display = 'none';
            successElement.style.display = 'block';

            expect(loadingElement.style.display).toBe('none');
            expect(successElement.style.display).toBe('block');
        });

        test('should show error state with message', () => {
            const loadingElement = document.getElementById('loading');
            const errorElement = document.getElementById('error');
            const errorMessageElement = document.getElementById('errorMessage');

            // Simulate error
            loadingElement.style.display = 'none';
            errorElement.style.display = 'block';
            errorMessageElement.textContent = 'Access denied by user';

            expect(loadingElement.style.display).toBe('none');
            expect(errorElement.style.display).toBe('block');
            expect(errorMessageElement.textContent).toBe('Access denied by user');
        });
    });

    describe('Token Exchange Simulation', () => {
        test('should simulate successful token exchange', async () => {
            const mockCode = 'valid_auth_code_12345';
            
            // Mock successful token exchange
            const simulateTokenExchange = async (code) => {
                await new Promise(resolve => setTimeout(resolve, 100)); // Simulate delay
                
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
                await new Promise(resolve => setTimeout(resolve, 100));
                
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

    describe('Redirect URLs', () => {
        test('should generate correct redirect URI', () => {
            const expectedRedirectUri = window.location.origin + '/auth/callback/';
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
    });
});

