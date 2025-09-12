// neural bard - spotify llm playlist generator main script

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
        // call neural bard api - use mock server for local testing
        const isLocalDev = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';
        const apiUrl = isLocalDev 
            ? 'http://localhost:3002/api/neural-bard'  // Local mock server
            : 'https://spotify-llm-driven-playlist.netlify.app/.netlify/functions/neural-bard';  // Direct call
            
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
    
    dataResults.innerHTML = `
        <div class="alert alert-info">
            <h6><i class="fas fa-robot me-2"></i>Neural Bard Response</h6>
            <textarea class="bard-response-textarea" rows="8" readonly>${data.response}</textarea>
        </div>
        
        ${songs.length > 0 ? `
        <div class="alert alert-success">
            <h6><i class="fas fa-music me-2"></i>Extracted Song List (${songs.length} songs):</h6>
            <div class="song-list-container">
                <textarea class="form-control song-list-textarea" rows="${Math.min(songs.length + 2, 15)}" readonly>${songs.join('\n')}</textarea>
                <div class="mt-2">
                    <button class="btn btn-sm btn-outline-success" onclick="copySongList()">
                        <i class="fas fa-copy me-1"></i>Copy Song List
                    </button>
                    <button class="btn btn-sm btn-outline-info" onclick="downloadSongList()">
                        <i class="fas fa-download me-1"></i>Download as TXT
                    </button>
                </div>
            </div>
        </div>
        ` : ''}
        
        <div class="row">
            <div class="col-md-6">
                <h6><i class="fas fa-code me-2"></i>Raw Neural Data:</h6>
                <pre class="bg-light p-3 rounded"><code>${JSON.stringify(data, null, 2)}</code></pre>
            </div>
            <div class="col-md-6">
                <h6><i class="fas fa-magic me-2"></i>Bard Metadata:</h6>
                <ul class="list-group">
                    <li class="list-group-item">Timestamp: ${data.timestamp}</li>
                    <li class="list-group-item">Status: ${data.bardData.status}</li>
                    <li class="list-group-item">Tokens Used: ${data.bardData.tokens_used}</li>
                    <li class="list-group-item">Model: ${data.bardData.model_used}</li>
                </ul>
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
    }
}

// download song list as text file
function downloadSongList() {
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
        showNeuralBardMessage('Song list downloaded!', 'success');
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

// initialize neural bard interface
function initializeNeuralBard() {
    console.log('Neural Bard interface initialized...');
    console.log('The mystical algorithm awaits your musical queries...');
}

// run initialization when page loads
document.addEventListener('DOMContentLoaded', initializeNeuralBard);
