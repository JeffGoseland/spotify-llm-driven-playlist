/**
 * Unit tests for toast notification system
 */

// Mock DOM and global objects
global.document = {
    getElementById: jest.fn(),
    insertAdjacentHTML: jest.fn()
};

global.bootstrap = {
    Toast: jest.fn(() => ({
        show: jest.fn(),
        hide: jest.fn()
    }))
};

// Mock the showToast function
const showToast = (message, type = 'info', duration = 5000) => {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;
    
    const toastId = 'toast-' + Date.now();
    const iconClass = type === 'success' ? 'fas fa-check-circle' : 
                     type === 'error' ? 'fas fa-exclamation-circle' :
                     type === 'warning' ? 'fas fa-exclamation-triangle' :
                     'fas fa-info-circle';
    
    // Color mapping for better visibility
    const colorClass = type === 'success' ? 'text-success' : 
                      type === 'error' ? 'text-danger' :
                      type === 'warning' ? 'text-warning' :
                      'text-info';
    
    const toastHtml = `
        <div class="toast" id="${toastId}" role="alert" aria-live="assertive" aria-atomic="true" style="min-width: 350px;">
            <div class="toast-header">
                <i class="${iconClass} me-2 ${colorClass}"></i>
                <strong class="me-auto">Neural Bard</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, {
        autohide: duration > 0,
        delay: duration
    });
    
    toast.show();
    
    // Remove toast element after it's hidden
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
};

describe('Toast Notification System', () => {
    let mockToastContainer;
    let mockToastElement;
    let mockToast;

    beforeEach(() => {
        jest.clearAllMocks();
        
        mockToastContainer = {
            insertAdjacentHTML: jest.fn()
        };
        
        mockToastElement = {
            addEventListener: jest.fn(),
            remove: jest.fn()
        };
        
        mockToast = {
            show: jest.fn(),
            hide: jest.fn()
        };
        
        document.getElementById.mockImplementation((id) => {
            if (id === 'toastContainer') return mockToastContainer;
            if (id.startsWith('toast-')) return mockToastElement;
            return null;
        });
        
        bootstrap.Toast.mockReturnValue(mockToast);
    });

    describe('showToast', () => {
        test('should create success toast with correct styling', () => {
            showToast('Test success message', 'success', 5000);
            
            expect(document.getElementById).toHaveBeenCalledWith('toastContainer');
            expect(mockToastContainer.insertAdjacentHTML).toHaveBeenCalledWith(
                'beforeend',
                expect.stringContaining('fas fa-check-circle')
            );
            expect(mockToastContainer.insertAdjacentHTML).toHaveBeenCalledWith(
                'beforeend',
                expect.stringContaining('text-success')
            );
            expect(mockToastContainer.insertAdjacentHTML).toHaveBeenCalledWith(
                'beforeend',
                expect.stringContaining('Test success message')
            );
            expect(bootstrap.Toast).toHaveBeenCalled();
            expect(mockToast.show).toHaveBeenCalled();
        });

        test('should create error toast with correct styling', () => {
            showToast('Test error message', 'error', 3000);
            
            expect(mockToastContainer.insertAdjacentHTML).toHaveBeenCalledWith(
                'beforeend',
                expect.stringContaining('fas fa-exclamation-circle')
            );
            expect(mockToastContainer.insertAdjacentHTML).toHaveBeenCalledWith(
                'beforeend',
                expect.stringContaining('text-danger')
            );
        });

        test('should create warning toast with correct styling', () => {
            showToast('Test warning message', 'warning', 4000);
            
            expect(mockToastContainer.insertAdjacentHTML).toHaveBeenCalledWith(
                'beforeend',
                expect.stringContaining('fas fa-exclamation-triangle')
            );
            expect(mockToastContainer.insertAdjacentHTML).toHaveBeenCalledWith(
                'beforeend',
                expect.stringContaining('text-warning')
            );
        });

        test('should create info toast with default styling', () => {
            showToast('Test info message');
            
            expect(mockToastContainer.insertAdjacentHTML).toHaveBeenCalledWith(
                'beforeend',
                expect.stringContaining('fas fa-info-circle')
            );
            expect(mockToastContainer.insertAdjacentHTML).toHaveBeenCalledWith(
                'beforeend',
                expect.stringContaining('text-info')
            );
        });

        test('should handle missing toast container gracefully', () => {
            document.getElementById.mockReturnValue(null);
            
            expect(() => showToast('Test message')).not.toThrow();
            expect(mockToastContainer.insertAdjacentHTML).not.toHaveBeenCalled();
        });

        test('should set correct toast duration', () => {
            showToast('Test message', 'info', 10000);
            
            expect(bootstrap.Toast).toHaveBeenCalledWith(
                mockToastElement,
                expect.objectContaining({
                    autohide: true,
                    delay: 10000
                })
            );
        });

        test('should disable autohide for duration 0', () => {
            showToast('Test message', 'info', 0);
            
            expect(bootstrap.Toast).toHaveBeenCalledWith(
                mockToastElement,
                expect.objectContaining({
                    autohide: false,
                    delay: 0
                })
            );
        });

        test('should include proper ARIA attributes', () => {
            showToast('Test message', 'success');
            
            expect(mockToastContainer.insertAdjacentHTML).toHaveBeenCalledWith(
                'beforeend',
                expect.stringContaining('role="alert"')
            );
            expect(mockToastContainer.insertAdjacentHTML).toHaveBeenCalledWith(
                'beforeend',
                expect.stringContaining('aria-live="assertive"')
            );
            expect(mockToastContainer.insertAdjacentHTML).toHaveBeenCalledWith(
                'beforeend',
                expect.stringContaining('aria-atomic="true"')
            );
        });

        test('should include close button with proper attributes', () => {
            showToast('Test message', 'success');
            
            expect(mockToastContainer.insertAdjacentHTML).toHaveBeenCalledWith(
                'beforeend',
                expect.stringContaining('data-bs-dismiss="toast"')
            );
            expect(mockToastContainer.insertAdjacentHTML).toHaveBeenCalledWith(
                'beforeend',
                expect.stringContaining('aria-label="Close"')
            );
        });

        test('should set up event listener for toast removal', () => {
            showToast('Test message', 'success');
            
            expect(mockToastElement.addEventListener).toHaveBeenCalledWith(
                'hidden.bs.toast',
                expect.any(Function)
            );
        });

        test('should handle HTML content in messages', () => {
            showToast('Playlist <strong>"My Playlist"</strong> created successfully!', 'success');
            
            expect(mockToastContainer.insertAdjacentHTML).toHaveBeenCalledWith(
                'beforeend',
                expect.stringContaining('Playlist <strong>"My Playlist"</strong> created successfully!')
            );
        });

        test('should generate unique toast IDs', () => {
            const mockGetElementById = jest.fn()
                .mockReturnValueOnce(mockToastContainer)  // toastContainer
                .mockReturnValueOnce(mockToastElement)    // first toast
                .mockReturnValueOnce(mockToastContainer)  // toastContainer again
                .mockReturnValueOnce(mockToastElement);   // second toast
            
            document.getElementById = mockGetElementById;
            
            showToast('First message', 'success');
            showToast('Second message', 'success');
            
            // Should call getElementById for toastContainer twice
            expect(mockGetElementById).toHaveBeenCalledWith('toastContainer');
            expect(mockGetElementById).toHaveBeenCalledTimes(4); // 2 for container, 2 for elements
        });
    });

    describe('Toast Content Validation', () => {
        test('should include Neural Bard branding', () => {
            showToast('Test message', 'success');
            
            expect(mockToastContainer.insertAdjacentHTML).toHaveBeenCalledWith(
                'beforeend',
                expect.stringContaining('<strong class="me-auto">Neural Bard</strong>')
            );
        });

        test('should set minimum width for better visibility', () => {
            showToast('Test message', 'success');
            
            expect(mockToastContainer.insertAdjacentHTML).toHaveBeenCalledWith(
                'beforeend',
                expect.stringContaining('style="min-width: 350px;"')
            );
        });

        test('should preserve message content exactly', () => {
            const complexMessage = 'Playlist "My Awesome Playlist 🎵" created with 25 songs! Click here to open.';
            showToast(complexMessage, 'success');
            
            expect(mockToastContainer.insertAdjacentHTML).toHaveBeenCalledWith(
                'afterbegin',
                expect.stringContaining(complexMessage)
            );
        });
    });
});
