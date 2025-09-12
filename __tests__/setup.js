/**
 * Test setup file
 */

// Mock console methods to reduce noise in tests
global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
};

// Mock window.location for different environments (only if window exists)
if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'location', {
        value: {
            hostname: '127.0.0.1',
            href: 'http://127.0.0.1:5500'
        },
        writable: true
    });
}

// Mock document methods that might not be available in test environment
if (typeof document !== 'undefined') {
    document.execCommand = document.execCommand || jest.fn();
    document.createElement = document.createElement || jest.fn();
    document.body = document.body || {
        appendChild: jest.fn(),
        removeChild: jest.fn()
    };
}

// Mock URL methods
global.URL = global.URL || {
    createObjectURL: jest.fn(() => 'mock-url'),
    revokeObjectURL: jest.fn()
};

// Mock fetch if not available
if (typeof global.fetch === 'undefined') {
    global.fetch = jest.fn();
}

// Mock bootstrap if not available
if (typeof global.bootstrap === 'undefined') {
    global.bootstrap = {
        Modal: jest.fn(() => ({
            show: jest.fn(),
            hide: jest.fn(),
            _progressInterval: null,
            _messageInterval: null
        }))
    };
}
