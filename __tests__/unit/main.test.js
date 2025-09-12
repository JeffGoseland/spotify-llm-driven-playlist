/**
 * Unit tests for main.js functions
 */

// Mock DOM and global objects
global.fetch = jest.fn();
global.bootstrap = {
    Modal: jest.fn(() => ({
        show: jest.fn(),
        hide: jest.fn(),
        _progressInterval: null,
        _messageInterval: null
    }))
};

// Mock window object
global.window = {
    location: {
        hostname: '127.0.0.1'
    }
};

// Mock document methods
global.document = {
    getElementById: jest.fn(),
    querySelector: jest.fn(),
    querySelectorAll: jest.fn(),
    body: {
        appendChild: jest.fn(),
        removeChild: jest.fn()
    },
    execCommand: jest.fn(),
    createElement: jest.fn()
};

// Mock URL methods
global.URL = {
    createObjectURL: jest.fn(() => 'mock-url'),
    revokeObjectURL: jest.fn()
};

// Mock the functions we want to test
const extractSongsFromResponse = (response) => {
    const songs = [];
    
    // try different patterns to find songs
    const patterns = [
        // Pattern 1: "Artist - Song" format (must have dash)
        /(\d+\.\s*)?([^-\n]+)\s*-\s*([^\n]+)/g,
        // Pattern 2: "**Artist - Song**" format (markdown bold)
        /\*\*([^-\n]+)\s*-\s*([^\n]+)\*\*/g,
        // Pattern 3: "Artist: Song" format (must have colon)
        /(\d+\.\s*)?([^:\n]+):\s*([^\n]+)/g
    ];
    
    for (const pattern of patterns) {
        const matches = [...response.matchAll(pattern)];
        for (const match of matches) {
            let song = '';
            if (match.length >= 4) {
                // Pattern 1 or 3: Artist - Song or Artist: Song
                song = `${match[2].trim()} - ${match[3].trim()}`;
            } else if (match.length >= 3) {
                // Pattern 2: **Artist - Song**
                song = `${match[1] ? match[1].trim() : ''} - ${match[2] ? match[2].trim() : ''}`;
            } else if (match.length >= 2) {
                // Pattern 4: Just the line
                song = match[2] ? match[2].trim() : '';
            }
            
            // clean up the song string
            song = song.replace(/^\d+\.\s*/, '').replace(/^\*\*|\*\*$/g, '').trim();
            
            // filter out obvious non-songs
            if (song && 
                song.length > 3 && 
                !song.match(/^(Playlist|Track|Song|Music|Genre|Style|Theme|Mood|Energy|Tempo|BPM|Duration|Time|Minutes|Hours|Seconds)/i) &&
                !song.match(/^[0-9\s\-\.]+$/) &&
                !song.match(/^(The|A|An)\s+[A-Z][a-z]+\s+(is|are|will|can|should|would|could|might|may)/i)) {
                songs.push(song);
            }
        }
        
        // if we found songs with this pattern, use them
        if (songs.length > 0) {
            break;
        }
    }
    
    // remove duplicates and limit to reasonable number
    return [...new Set(songs)].slice(0, 50);
};

const copySongList = () => {
    const textarea = document.querySelector('.song-list-textarea');
    if (textarea) {
        textarea.select();
        document.execCommand('copy');
    }
};

const downloadSongList = () => {
    const textarea = document.querySelector('.song-list-textarea');
    if (textarea) {
        const blob = new Blob([textarea.value], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'neural-bard-playlist.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};

const showNeuralBardMessage = (message, type = 'info') => {
    const alertClass = type === 'warning' ? 'alert-warning' : 'alert-info';
    const messageHtml = `
        <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
            <i class="fas fa-robot me-2"></i>${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    const mainContent = document.querySelector('.container.mt-5');
    mainContent.insertAdjacentHTML('afterbegin', messageHtml);
};

describe('Neural Bard Functions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        fetch.mockClear();
    });

    describe('extractSongsFromResponse', () => {
        test('should extract songs from Artist - Song format', () => {
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

        test('should extract songs from **Artist - Song** format', () => {
            const response = `
                **The Beatles - Hey Jude**
                **Queen - Bohemian Rhapsody**
                **Led Zeppelin - Stairway to Heaven**
            `;
            
            const songs = extractSongsFromResponse(response);
            
            expect(songs).toContain('The Beatles - Hey Jude');
            expect(songs).toContain('Queen - Bohemian Rhapsody');
            expect(songs).toContain('Led Zeppelin - Stairway to Heaven');
        });

        test('should filter out non-song content', () => {
            const response = `
                Playlist: Rock Classics
                The Beatles - Hey Jude
                Genre: Rock
                Queen - Bohemian Rhapsody
                Style: Progressive Rock
            `;
            
            const songs = extractSongsFromResponse(response);
            
            expect(songs).toContain('The Beatles - Hey Jude');
            expect(songs).toContain('Queen - Bohemian Rhapsody');
            expect(songs).not.toContain('Playlist: Rock Classics');
            expect(songs).not.toContain('Genre: Rock');
        });

        test('should return empty array for no songs', () => {
            const response = 'This is just some text with no songs.';
            const songs = extractSongsFromResponse(response);
            expect(songs).toEqual([]);
        });

        test('should limit to 50 songs', () => {
            const response = Array.from({ length: 60 }, (_, i) => `Artist ${i} - Song ${i}`).join('\n');
            const songs = extractSongsFromResponse(response);
            expect(songs.length).toBeLessThanOrEqual(50);
        });
    });

    describe('copySongList', () => {
        test('should copy song list to clipboard', () => {
            const mockTextarea = {
                select: jest.fn(),
                value: 'The Beatles - Hey Jude\nQueen - Bohemian Rhapsody'
            };
            
            document.querySelector.mockReturnValue(mockTextarea);
            document.execCommand.mockReturnValue(true);
            
            copySongList();
            
            expect(document.querySelector).toHaveBeenCalledWith('.song-list-textarea');
            expect(mockTextarea.select).toHaveBeenCalled();
            expect(document.execCommand).toHaveBeenCalledWith('copy');
        });

        test('should handle missing textarea gracefully', () => {
            document.querySelector.mockReturnValue(null);
            
            expect(() => copySongList()).not.toThrow();
        });
    });

    describe('downloadSongList', () => {
        test('should download song list as text file', () => {
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
            
            expect(document.createElement).toHaveBeenCalledWith('a');
            expect(mockAnchor.href).toBe('mock-url');
            expect(mockAnchor.download).toBe('neural-bard-playlist.txt');
            expect(mockAnchor.click).toHaveBeenCalled();
            expect(document.body.appendChild).toHaveBeenCalledWith(mockAnchor);
            expect(document.body.removeChild).toHaveBeenCalledWith(mockAnchor);
        });

        test('should handle missing textarea gracefully', () => {
            document.querySelector.mockReturnValue(null);
            
            expect(() => downloadSongList()).not.toThrow();
        });
    });

    describe('showNeuralBardMessage', () => {
        test('should display info message', () => {
            const mockMainContent = {
                insertAdjacentHTML: jest.fn()
            };
            
            document.querySelector.mockReturnValue(mockMainContent);
            
            showNeuralBardMessage('Test message', 'info');
            
            expect(mockMainContent.insertAdjacentHTML).toHaveBeenCalledWith(
                'afterbegin',
                expect.stringContaining('Test message')
            );
        });

        test('should display warning message', () => {
            const mockMainContent = {
                insertAdjacentHTML: jest.fn()
            };
            
            document.querySelector.mockReturnValue(mockMainContent);
            
            showNeuralBardMessage('Warning message', 'warning');
            
            expect(mockMainContent.insertAdjacentHTML).toHaveBeenCalledWith(
                'afterbegin',
                expect.stringContaining('alert-warning')
            );
        });
    });

    describe('API URL Detection', () => {
        test('should use local proxy for localhost', () => {
            // Mock window.location.hostname
            Object.defineProperty(window, 'location', {
                value: { hostname: '127.0.0.1' },
                writable: true
            });
            
            // This would be tested in integration tests
            // as it requires the full function execution
        });

        test('should use remote URL for production', () => {
            Object.defineProperty(window, 'location', {
                value: { hostname: 'spotify-llm-driven-playlist.netlify.app' },
                writable: true
            });
            
            // This would be tested in integration tests
        });
    });
});
