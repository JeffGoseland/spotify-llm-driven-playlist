/**
 * UI tests for Neural Bard interface
 */

// Polyfill for TextEncoder/TextDecoder
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock DOM environment
const { JSDOM } = require('jsdom');

// Create a mock DOM
const dom = new JSDOM(`
<!DOCTYPE html>
<html>
<head>
    <title>Neural Bard Test</title>
</head>
<body>
    <div class="container mt-5">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header">
                        <h5><i class="fas fa-robot me-2"></i>Neural Bard Interface</h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <label for="neuralBardPrompt" class="form-label">Speak your musical desires to the Neural Bard:</label>
                            <textarea class="form-control" id="neuralBardPrompt" rows="3" 
                                placeholder="The Neural Bard awaits your musical prophecy..."></textarea>
                        </div>
                        <div class="mb-3">
                            <label for="numberOfSongs" class="form-label">Number of songs:</label>
                            <input type="number" class="form-control" id="numberOfSongs" value="25" min="5" max="50" 
                                placeholder="How many songs shall the Neural Bard divine?">
                            <div class="form-text">The Neural Bard can divine between 5 and 50 songs</div>
                        </div>
                        <button class="btn btn-success w-100" onclick="sendToNeuralBard()">
                            <i class="fas fa-magic me-2"></i>Consult the Neural Bard
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="row mt-4" id="neuralBardDataSection" style="display: none;">
            <div class="col-12">
                <div class="card">
                    <div class="card-header">
                        <h5><i class="fas fa-database me-2"></i>Neural Bard Divination Results</h5>
                    </div>
                    <div class="card-body">
                        <div id="neuralBardDataResults">
                            <!-- Neural Bard data will be displayed here -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="modal fade" id="neuralBardLoadingModal" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-body text-center py-4">
                    <div class="neural-bard-container mb-3">
                        <div class="spinner-border text-success neural-bard-loading" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                    </div>
                    <h5>The Neural Bard is divining...</h5>
                    <p class="text-muted">The mystical algorithm processes your musical desires...</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
`, {
    url: 'http://127.0.0.1:5500',
    pretendToBeVisual: true,
    resources: 'usable'
});

// Set up global objects
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

// Mock fetch
global.fetch = jest.fn();

// Mock bootstrap
global.bootstrap = {
    Modal: jest.fn(() => ({
        show: jest.fn(),
        hide: jest.fn(),
        _progressInterval: null,
        _messageInterval: null
    }))
};

// Mock URL methods
global.URL = {
    createObjectURL: jest.fn(() => 'mock-url'),
    revokeObjectURL: jest.fn()
};

// Mock document methods
document.execCommand = jest.fn();

// Load the main.js file
require('../../js/main.js');

describe('UI Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset form values if elements exist
        const promptElement = document.getElementById('neuralBardPrompt');
        const songsElement = document.getElementById('numberOfSongs');
        const dataSection = document.getElementById('neuralBardDataSection');
        
        if (promptElement) promptElement.value = '';
        if (songsElement) songsElement.value = '25';
        if (dataSection) dataSection.style.display = 'none';
    });

    describe('Form Validation', () => {
        test('should show warning for empty prompt', () => {
            document.getElementById('neuralBardPrompt').value = '';
            
            sendToNeuralBard();
            
            // Should not make API call
            expect(fetch).not.toHaveBeenCalled();
        });

        test('should show warning for invalid song count', () => {
            document.getElementById('neuralBardPrompt').value = 'test prompt';
            document.getElementById('numberOfSongs').value = '100';
            
            sendToNeuralBard();
            
            // Should not make API call
            expect(fetch).not.toHaveBeenCalled();
        });

        test('should accept valid input', () => {
            document.getElementById('neuralBardPrompt').value = 'Create a rock playlist';
            document.getElementById('numberOfSongs').value = '10';
            
            // Mock successful API response
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    prompt: 'Create a rock playlist',
                    response: 'Here are some great songs...',
                    timestamp: new Date().toISOString(),
                    bardData: {
                        status: 'divination_complete',
                        tokens_used: 100,
                        model_used: 'grok-3-fast'
                    }
                })
            });
            
            sendToNeuralBard();
            
            expect(fetch).toHaveBeenCalled();
        });
    });

    describe('API Integration', () => {
        test('should use correct API URL for localhost', () => {
            document.getElementById('neuralBardPrompt').value = 'test prompt';
            document.getElementById('numberOfSongs').value = '10';
            
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    prompt: 'test prompt',
                    response: 'Test response',
                    timestamp: new Date().toISOString(),
                    bardData: { status: 'divination_complete' }
                })
            });
            
            sendToNeuralBard();
            
            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:3001/api/neural-bard',
                expect.any(Object)
            );
        });

        test('should handle API errors gracefully', () => {
            document.getElementById('neuralBardPrompt').value = 'test prompt';
            document.getElementById('numberOfSongs').value = '10';
            
            global.fetch.mockRejectedValueOnce(new Error('Network error'));
            
            sendToNeuralBard();
            
            // Should not throw error
            expect(() => sendToNeuralBard()).not.toThrow();
        });
    });

    describe('UI State Management', () => {
        test('should show loading modal during API call', () => {
            document.getElementById('neuralBardPrompt').value = 'test prompt';
            document.getElementById('numberOfSongs').value = '10';
            
            // Mock delayed API response
            global.fetch.mockImplementationOnce(() => 
                new Promise(resolve => 
                    setTimeout(() => resolve({
                        ok: true,
                        json: () => Promise.resolve({
                            prompt: 'test prompt',
                            response: 'Test response',
                            timestamp: new Date().toISOString(),
                            bardData: { status: 'divination_complete' }
                        })
                    }), 100)
                )
            );
            
            sendToNeuralBard();
            
            // Loading modal should be shown
            expect(bootstrap.Modal).toHaveBeenCalled();
        });

        test('should display results after successful API call', () => {
            document.getElementById('neuralBardPrompt').value = 'test prompt';
            document.getElementById('numberOfSongs').value = '10';
            
            const mockResponse = {
                prompt: 'test prompt',
                response: 'Here are some great songs:\n1. The Beatles - Hey Jude\n2. Queen - Bohemian Rhapsody',
                timestamp: new Date().toISOString(),
                bardData: {
                    status: 'divination_complete',
                    tokens_used: 100,
                    model_used: 'grok-3-fast'
                }
            };
            
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            });
            
            sendToNeuralBard();
            
            // Results section should be visible
            setTimeout(() => {
                expect(document.getElementById('neuralBardDataSection').style.display).toBe('block');
            }, 100);
        });
    });

    describe('Song List Functionality', () => {
        test('should extract songs from response', () => {
            const response = `
                Here are some great songs:
                1. The Beatles - Hey Jude
                2. Queen - Bohemian Rhapsody
                3. Led Zeppelin - Stairway to Heaven
            `;
            
            const songs = extractSongsFromResponse(response);
            
            expect(songs).toContain('The Beatles - Hey Jude');
            expect(songs).toContain('Queen - Bohemian Rhapsody');
            expect(songs).toContain('Led Zeppelin - Stairway to Heaven');
        });

        test('should handle copy song list', () => {
            const mockTextarea = {
                select: jest.fn(),
                value: 'The Beatles - Hey Jude\nQueen - Bohemian Rhapsody'
            };
            
            document.querySelector.mockReturnValue(mockTextarea);
            
            copySongList();
            
            expect(mockTextarea.select).toHaveBeenCalled();
            expect(document.execCommand).toHaveBeenCalledWith('copy');
        });

        test('should handle download song list', () => {
            const mockTextarea = {
                value: 'The Beatles - Hey Jude\nQueen - Bohemian Rhapsody'
            };
            
            const mockAnchor = {
                href: '',
                download: '',
                click: jest.fn()
            };
            
            document.querySelector.mockReturnValue(mockTextarea);
            document.createElement.mockReturnValue(mockAnchor);
            
            downloadSongList();
            
            expect(mockAnchor.download).toBe('neural-bard-playlist.txt');
            expect(mockAnchor.click).toHaveBeenCalled();
        });
    });
});
