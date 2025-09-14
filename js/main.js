// neural bard - spotify llm playlist generator main script

// API endpoint configuration
const API_BASE_URL = window.location.port === '5500' ? 'http://localhost:3000' : '';

// Check if user is connected to Spotify
function checkSpotifyConnection() {
    const accessToken = localStorage.getItem('spotify_access_token');
    const expiresAt = localStorage.getItem('spotify_token_expires');
    
    if (accessToken && expiresAt && Date.now() < parseInt(expiresAt)) {
        // Hide connect button and show create playlist button in song list area
        const connectBtn = document.getElementById('connectSpotifyBtn');
        const createPlaylistBtn = document.getElementById('createPlaylistBtn');
        
        if (connectBtn) connectBtn.style.display = 'none';
        if (createPlaylistBtn) createPlaylistBtn.style.display = 'inline-block';
        
        return true;
    } else {
        // Clear expired tokens
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_refresh_token');
        localStorage.removeItem('spotify_token_expires');
        
        // Show connect button and hide create playlist button in song list area
        const connectBtn = document.getElementById('connectSpotifyBtn');
        const createPlaylistBtn = document.getElementById('createPlaylistBtn');
        
        if (connectBtn) connectBtn.style.display = 'inline-block';
        if (createPlaylistBtn) createPlaylistBtn.style.display = 'none';
        
        return false;
    }
}

// Connect to Spotify
function connectToSpotify() {
    const clientId = '62d4eb4142784c7d9e0a3a1f0b1976ee';
    // Use Netlify callback URI for all hosts (registered with Spotify)
    const redirectUri = 'https://spotify-llm-driven-playlist.netlify.app/auth/callback/';
    const scope = 'playlist-modify-public playlist-modify-private user-read-email user-read-private';
    const state = Date.now().toString();
    
    const authUrl = `https://accounts.spotify.com/authorize?` +
        `client_id=${clientId}&` +
        `response_type=code&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scope)}&` +
        `state=${state}`;
    
    window.location.href = authUrl;
}

// Create Spotify playlist from current results (new function for the results section)
async function createSpotifyPlaylistFromResults() {
    if (!window.currentSongs || !window.currentPrompt) {
        console.error('No songs or prompt available');
        showPlaylistCreationStatus('No playlist data available. Please generate a playlist first.', 'error');
        return;
    }
    
    let progressInterval;
    try {
        showPlaylistCreationStatus('Creating playlist on Spotify...', 'info');
        
        // Get custom playlist title if provided
        const customTitle = document.getElementById('playlistTitle')?.value?.trim() || null;
        
        // Get replace existing tracks preference
        const replaceExisting = document.getElementById('replaceExistingTracks')?.checked || false;
        
        // Show progress updates
        const progressSteps = [
            'Checking for existing playlists...',
            'Preparing playlist...',
            'Searching for tracks...',
            'Adding tracks to playlist...',
            'Finalizing playlist...'
        ];
        
        // Show loading modal for Spotify playlist creation with 1 second delay
        setTimeout(() => {
            showSpotifyPlaylistLoading();
        }, 1000);
        
        let currentStep = 0;
        progressInterval = setInterval(() => {
            if (currentStep < progressSteps.length) {
                showPlaylistCreationStatus(progressSteps[currentStep], 'info');
                currentStep++;
            }
        }, 1000);
        
        const result = await createSpotifyPlaylist(window.currentSongs, window.currentPrompt, customTitle, replaceExisting);
        
        clearInterval(progressInterval);
        hideSpotifyPlaylistLoading();
        
        if (result.success) {
            const actionText = result.playlist.wasExisting ? 'updated' : 'created';
            const actionIcon = result.playlist.wasExisting ? '🔄' : '✅';
            
            showPlaylistCreationStatus(
                `${actionIcon} Playlist <strong>"${result.playlist.name}"</strong> ${actionText} successfully! <a href="${result.playlist.url}" target="_blank" class="alert-link">Open in Spotify</a>`,
                'success'
            );
            showToast(`Playlist <strong>"${result.playlist.name}"</strong> ${actionText} with ${result.playlist.tracksAdded} songs!`, 'success');
        } else {
            showPlaylistCreationStatus(`❌ Failed to create playlist: ${result.error}`, 'error');
            showToast(`Failed to create playlist: ${result.error}`, 'error');
        }
    } catch (error) {
        console.error('Playlist creation error:', error);
        clearInterval(progressInterval);
        hideSpotifyPlaylistLoading();
        showPlaylistCreationStatus(`❌ Error creating playlist: ${error.message}`, 'error');
        showToast(`Error creating playlist: ${error.message}`, 'error');
    }
}

// Show playlist creation status in the new UI
function showPlaylistCreationStatus(message, type = 'info') {
    const statusDiv = document.getElementById('playlistCreationStatus');
    if (!statusDiv) return;
    
    const alertClass = type === 'error' ? 'alert-danger' : 
                     type === 'success' ? 'alert-success' : 'alert-info';
    
    const iconClass = type === 'error' ? 'fas fa-exclamation-circle' : 
                     type === 'success' ? 'fas fa-check-circle' : 
                     'fas fa-spinner fa-spin';
    
    statusDiv.innerHTML = `
        <div class="alert ${alertClass} mb-0 d-flex align-items-center">
            <i class="${iconClass} me-2"></i>
            <div>${message}</div>
        </div>
    `;
    statusDiv.style.display = 'block';
}

// Create playlist on Spotify
async function createSpotifyPlaylist(songs, prompt, customTitle = null, replaceExisting = false) {
    const accessToken = localStorage.getItem('spotify_access_token');
    
    if (!accessToken) {
        throw new Error('Not connected to Spotify');
    }
    
    const apiUrl = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'
        ? 'http://localhost:3000/.netlify/functions/spotify-playlist'
        : window.location.hostname === 'spotify-llm-driven-playlist.netlify.app'
        ? '/.netlify/functions/spotify-playlist'
        : 'https://spotify-llm-driven-playlist.netlify.app/.netlify/functions/spotify-playlist';
    
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            prompt: prompt,
            numberOfSongs: songs.length,
            accessToken: accessToken,
            songs: songs,
            customTitle: customTitle,
            replaceExisting: replaceExisting
        })
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create playlist');
    }
    
    return await response.json();
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    checkSpotifyConnection();
    
    // Check if user just connected to Spotify and show success toast
    if (localStorage.getItem('spotify_connection_success') === 'true') {
        localStorage.removeItem('spotify_connection_success');
        showToast('Successfully connected to Spotify! You can now create playlists.', 'success');
    }
});

// send prompt to neural bard and display response
async function sendToNeuralBard() {
    const prompt = document.getElementById('neuralBardPrompt').value.trim();
    const numberOfSongs = document.getElementById('numberOfSongs').value;
    
    if (!prompt) {
        showNeuralBardMessage('The Neural Bard requires a prompt to divine your musical future...', 'warning');
        return;
    }

    if (!numberOfSongs || numberOfSongs < 5 || numberOfSongs > 50) {
        showNeuralBardMessage('The Neural Bard can only divine between 5 and 50 songs...', 'warning');
        return;
    }

    // show loading modal with neural bard personality
    showNeuralBardLoading();

    try {
        // call neural bard api - dynamic URL based on hosting provider
        const isLocalDev = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';
        const isNetlify = window.location.hostname === 'spotify-llm-driven-playlist.netlify.app';
        
        let apiUrl;
        if (isLocalDev) {
            apiUrl = 'http://localhost:3000/.netlify/functions/neural-bard';
        } else if (isNetlify) {
            apiUrl = '/.netlify/functions/neural-bard';
        } else {
            // For static hosting providers like goseland.org, use Netlify Functions directly
            apiUrl = 'https://spotify-llm-driven-playlist.netlify.app/.netlify/functions/neural-bard';
        }
        
        console.log('Using API URL:', apiUrl);
        console.log('Hostname:', window.location.hostname);
        console.log('Is local dev:', isLocalDev);
        console.log('Is Netlify:', isNetlify);
            
        console.log('Making API request to:', apiUrl);
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: prompt,
                numberOfSongs: parseInt(numberOfSongs)
            })
        });

        if (!response.ok) {
            throw new Error(`Neural Bard API error: ${response.status}`);
        }

        const neuralBardResponse = await response.json();
        displayNeuralBardData(neuralBardResponse);
        
        // Show success toast
        const songs = extractSongsFromResponse(neuralBardResponse.response);
        if (songs.length > 0) {
            showToast(`Neural Bard generated ${songs.length} songs for your playlist!`, 'success');
        } else {
            showToast('Neural Bard completed your request!', 'info');
        }
        
    } catch (error) {
        console.error('Neural Bard error:', error);
        showNeuralBardMessage('The Neural Bard encountered a mystical error... Please try again.', 'warning');
    } finally {
        hideNeuralBardLoading();
    }
}

// Removed unused generateNeuralBardResponse function

// display received data from neural bard
function displayNeuralBardData(data) {
    const dataSection = document.getElementById('neuralBardDataSection');
    const dataResults = document.getElementById('neuralBardDataResults');
    
    // extract songs from the response
    const songs = extractSongsFromResponse(data.response);
    
    // remove song list from the response text to avoid duplication
    let cleanResponse = data.response;
    if (songs.length > 0) {
        // remove numbered song lists and song patterns from the response
        cleanResponse = cleanResponse
            .replace(/\d+\.\s*[^-\n]+\s*-\s*[^\n]+/g, '') // remove "1. Artist - Song" patterns
            .replace(/\*\*[^-\n]+\s*-\s*[^\n]+\*\*/g, '') // remove "**Artist - Song**" patterns
            .replace(/^[^:\n]+:\s*[^\n]+$/gm, '') // remove "Artist: Song" patterns
            .replace(/\n\s*\n/g, '\n') // clean up extra newlines
            .trim();
    }
    
    dataResults.innerHTML = `
        <div class="alert alert-info">
            <h6><i class="fas fa-robot me-2"></i>Neural Bard's Wisdom</h6>
            <textarea class="bard-response-textarea" rows="4" readonly>${cleanResponse}</textarea>
        </div>
        
        ${songs.length > 0 ? `
        <div class="alert alert-success">
            <h6><i class="fas fa-music me-2"></i>Divined Song List (${songs.length} songs)</h6>
            <div class="song-list-container">
                <textarea class="form-control song-list-textarea" rows="${Math.min(songs.length + 1, 20)}" readonly style="overflow-y: auto; max-height: 400px;">${songs.join('\n')}</textarea>
                <div class="mt-2 d-flex justify-content-center gap-2">
                    <button class="btn btn-sm btn-outline-success flex-fill" onclick="copySongList()">
                        <i class="fas fa-copy me-1"></i>Copy Song List
                    </button>
                    <button class="btn btn-sm btn-dark flex-fill" onclick="downloadSongList()">
                        <i class="fas fa-download me-1"></i>Download as CSV
                    </button>
                    <button class="btn btn-sm btn-dark flex-fill" onclick="connectToSpotify()" id="connectSpotifyBtn" style="display: none;">
                        <i class="fab fa-spotify me-1"></i>Connect to Spotify
                    </button>
                    <button class="btn btn-sm btn-dark flex-fill" onclick="createSpotifyPlaylistFromResults()" id="createPlaylistBtn" style="display: none;">
                        <i class="fab fa-spotify me-1"></i>Create on Spotify
                    </button>
                </div>
            </div>
        </div>
        ` : `
        <div class="alert alert-warning">
            <h6><i class="fas fa-exclamation-triangle me-2"></i>No Songs Detected</h6>
            <p class="mb-0">The Neural Bard's response didn't contain recognizable song patterns.</p>
        </div>
        `}
    `;
    
    // Spotify integration is now in the song list area - no separate section needed
    // document.getElementById('spotifyIntegrationSection').style.display = 'block';
    
    // Store the current songs and prompt for later use
    window.currentSongs = songs;
    window.currentPrompt = data.prompt;
    
    // Show Connect to Spotify button initially (will be updated by checkSpotifyConnection)
    const connectBtn = document.getElementById('connectSpotifyBtn');
    if (connectBtn) connectBtn.style.display = 'inline-block';
    
    // Check if user is already connected to Spotify
    checkSpotifyConnection();
    
    // Add metadata section
    dataResults.innerHTML += `
        <div class="alert alert-light">
            <h6 class="d-flex justify-content-between align-items-center">
                <span><i class="fas fa-magic me-2"></i>Bard Metadata</span>
                <button class="btn btn-sm btn-outline-secondary" onclick="toggleMetadata()" id="metadataToggle">
                    <i class="fas fa-chevron-down" id="metadataIcon"></i>
                </button>
            </h6>
            <div id="metadataContent" style="display: none;">
                <ul class="list-group list-group-flush">
                    <li class="list-group-item d-flex justify-content-between">
                        <span>Status:</span>
                        <span class="badge bg-primary">${data.bardData.status}</span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between">
                        <span>Tokens Used:</span>
                        <span class="badge bg-info">${data.bardData.tokens_used}</span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between">
                                <span>Model:</span>
                                <span class="badge bg-secondary">${data.bardData.model_used}</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between">
                                <span>Timestamp:</span>
                                <small class="text-muted">${data.timestamp}</small>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="alert alert-dark">
                    <h6 class="d-flex justify-content-between align-items-center">
                        <span><i class="fas fa-code me-2"></i>Raw Neural Data</span>
                        <button class="btn btn-sm btn-outline-secondary" onclick="toggleRawData()" id="rawDataToggle">
                            <i class="fas fa-chevron-down" id="rawDataIcon"></i>
                        </button>
                    </h6>
                    <div id="rawDataContent" style="display: none;">
                        <pre class="bg-light p-3 rounded mb-0" style="max-height: 200px; overflow-y: auto;"><code>${JSON.stringify(data, null, 2)}</code></pre>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    dataSection.style.display = 'block';
    dataSection.scrollIntoView({ behavior: 'smooth' });
}

// extract songs from neural bard response
function extractSongsFromResponse(response) {
    const songs = [];
    
    // try different patterns to find songs
    const patterns = [
        // Pattern 1: "Artist - Song" format
        /(\d+\.\s*)?([^-\n]+)\s*-\s*([^\n]+)/g,
        // Pattern 2: "**Artist - Song**" format (markdown bold)
        /\*\*([^-\n]+)\s*-\s*([^\n]+)\*\*/g,
        // Pattern 3: "Artist: Song" format
        /(\d+\.\s*)?([^:\n]+):\s*([^\n]+)/g,
        // Pattern 4: Lines that look like song titles
        /^(\d+\.\s*)?(.+)$/gm
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
                song = `${match[1].trim()} - ${match[2].trim()}`;
            } else if (match.length >= 2) {
                // Pattern 4: Just the line
                song = match[2].trim();
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
}

// copy song list to clipboard
function copySongList() {
    const textarea = document.querySelector('.song-list-textarea');
    if (textarea) {
        textarea.select();
        document.execCommand('copy');
        showNeuralBardMessage('Song list copied to clipboard!', 'success');
        showToast('Song list copied to clipboard!', 'success');
    }
}

// download song list as text file
function downloadSongList() {
    const textarea = document.querySelector('.song-list-textarea');
    if (textarea) {
        // Convert song list to CSV format
        const songs = textarea.value.split('\n').filter(line => line.trim());
        const csvContent = 'Track Number,Artist,Song Title\n' + 
            songs.map((song, index) => {
                // Parse "Artist - Song Title" format
                const parts = song.split(' - ');
                const artist = parts[0] ? parts[0].trim() : '';
                const title = parts[1] ? parts[1].trim() : '';
                return `${index + 1},"${artist}","${title}"`;
            }).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'neural-bard-playlist.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showNeuralBardMessage('Song list downloaded as CSV!', 'success');
        showToast('Song list downloaded as CSV!', 'success');
    }
}

// show neural bard loading modal
function showNeuralBardLoading() {
    const loadingModal = new bootstrap.Modal(document.getElementById('neuralBardLoadingModal'));
    loadingModal.show();
}

// hide neural bard loading modal
function hideNeuralBardLoading() {
    const loadingModal = bootstrap.Modal.getInstance(document.getElementById('neuralBardLoadingModal'));
    if (loadingModal) {
        loadingModal.hide();
    }
}

// show spotify playlist loading modal
function showSpotifyPlaylistLoading() {
    const loadingModal = new bootstrap.Modal(document.getElementById('spotifyPlaylistLoadingModal'));
    loadingModal.show();
}

// hide spotify playlist loading modal
function hideSpotifyPlaylistLoading() {
    const loadingModal = bootstrap.Modal.getInstance(document.getElementById('spotifyPlaylistLoadingModal'));
    if (loadingModal) {
        loadingModal.hide();
    }
}

// show neural bard message
function showNeuralBardMessage(message, type = 'info') {
    const alertClass = type === 'warning' ? 'alert-warning' : 'alert-info';
    const messageHtml = `
        <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
            <i class="fas fa-robot me-2"></i>${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    const mainContent = document.querySelector('.container.mt-5');
    mainContent.insertAdjacentHTML('afterbegin', messageHtml);
}

// Show toast notification
function showToast(message, type = 'info', duration = 5000) {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;
    
    const toastId = 'toast-' + Date.now();
    const iconClass = type === 'success' ? 'fas fa-check-circle' : 
                     type === 'error' ? 'fas fa-exclamation-circle' :
                     type === 'warning' ? 'fas fa-exclamation-triangle' :
                     'fas fa-info-circle';
    
    // Icon will be styled by our custom CSS
    
    const toastHtml = `
        <div class="toast" id="${toastId}" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <i class="${iconClass} me-2"></i>
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
}

// toggle functions for collapsible sections
function toggleMetadata() {
    const content = document.getElementById('metadataContent');
    const icon = document.getElementById('metadataIcon');
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        icon.className = 'fas fa-chevron-up';
    } else {
        content.style.display = 'none';
        icon.className = 'fas fa-chevron-down';
    }
}

function toggleRawData() {
    const content = document.getElementById('rawDataContent');
    const icon = document.getElementById('rawDataIcon');
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        icon.className = 'fas fa-chevron-up';
    } else {
        content.style.display = 'none';
        icon.className = 'fas fa-chevron-down';
    }
}

// initialize neural bard interface
function initializeNeuralBard() {
    console.log('Neural Bard interface initialized...');
    console.log('The mystical algorithm awaits your musical queries...');
}

// run initialization when page loads
document.addEventListener('DOMContentLoaded', initializeNeuralBard);
