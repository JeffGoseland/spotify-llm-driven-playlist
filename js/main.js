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
        // call neural bard api
        const response = await fetch('/api/neural-bard', {
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

// generate mystical response from neural bard
function generateNeuralBardResponse(prompt) {
    const responses = [
        `The Neural Bard divines: "${prompt}" - A most intriguing musical query...`,
        `Binary whispers from the Neural Bard: "${prompt}" - The algorithm speaks of harmonies yet to be born...`,
        `The Neural Bard's digital oracle responds: "${prompt}" - Behold, the musical matrix reveals its secrets...`,
        `Neural Bard prophecy: "${prompt}" - The code has spoken, the playlist shall be forged...`,
        `The Neural Bard's mystical algorithm declares: "${prompt}" - Your musical destiny awaits in the digital realm...`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

// display received data from neural bard
function displayNeuralBardData(data) {
    const dataSection = document.getElementById('neuralBardDataSection');
    const dataResults = document.getElementById('neuralBardDataResults');
    
    dataResults.innerHTML = `
        <div class="alert alert-info neural-bard-glow">
            <h6><i class="fas fa-robot me-2"></i>Neural Bard Response</h6>
            <p class="mb-0">${data.response}</p>
        </div>
        
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
                    <li class="list-group-item">Mystical Confidence: ${(data.bardData.mystical_confidence * 100).toFixed(1)}%</li>
                </ul>
            </div>
        </div>
    `;
    
    dataSection.style.display = 'block';
    dataSection.scrollIntoView({ behavior: 'smooth' });
}

// show neural bard loading modal with enhanced animations
function showNeuralBardLoading() {
    const loadingModal = new bootstrap.Modal(document.getElementById('neuralBardLoadingModal'));
    
    // update loading messages dynamically
    const loadingMessages = [
        "The Neural Bard is divining...",
        "Consulting the digital oracle...",
        "Processing musical frequencies...",
        "Weaving sonic algorithms...",
        "Channeling mystical data streams...",
        "The algorithm speaks to the music...",
        "Divining your perfect playlist...",
        "Neural networks are harmonizing..."
    ];
    
    let messageIndex = 0;
    const messageElement = document.querySelector('#neuralBardLoadingModal h5');
    const progressElement = document.querySelector('#neuralBardLoadingModal .progress');
    
    // create progress bar if it doesn't exist
    if (!progressElement) {
        const modalBody = document.querySelector('#neuralBardLoadingModal .modal-body');
        const progressHtml = `
            <div class="progress mb-3" style="height: 6px;">
                <div class="progress-bar progress-bar-striped progress-bar-animated neural-bard-progress" 
                     role="progressbar" style="width: 0%"></div>
            </div>
        `;
        modalBody.insertAdjacentHTML('beforeend', progressHtml);
    }
    
    // animate progress bar
    const progressBar = document.querySelector('.neural-bard-progress');
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 90) progress = 90; // don't complete until response
        progressBar.style.width = progress + '%';
    }, 200);
    
    // cycle through loading messages
    const messageInterval = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        messageElement.textContent = loadingMessages[messageIndex];
    }, 1500);
    
    // store intervals for cleanup
    loadingModal._progressInterval = progressInterval;
    loadingModal._messageInterval = messageInterval;
    
    loadingModal.show();
}

// hide neural bard loading modal with completion animation
function hideNeuralBardLoading() {
    const loadingModal = bootstrap.Modal.getInstance(document.getElementById('neuralBardLoadingModal'));
    if (loadingModal) {
        // complete the progress bar
        const progressBar = document.querySelector('.neural-bard-progress');
        if (progressBar) {
            progressBar.style.width = '100%';
            progressBar.classList.add('bg-success');
        }
        
        // show completion message briefly
        const messageElement = document.querySelector('#neuralBardLoadingModal h5');
        const originalMessage = messageElement.textContent;
        messageElement.textContent = "Divination complete! The Neural Bard has spoken...";
        messageElement.classList.add('text-success');
        
        // clean up intervals
        if (loadingModal._progressInterval) {
            clearInterval(loadingModal._progressInterval);
        }
        if (loadingModal._messageInterval) {
            clearInterval(loadingModal._messageInterval);
        }
        
        // hide modal after brief delay
        setTimeout(() => {
            loadingModal.hide();
            // reset for next time
            if (progressBar) {
                progressBar.style.width = '0%';
                progressBar.classList.remove('bg-success');
            }
            messageElement.textContent = originalMessage;
            messageElement.classList.remove('text-success');
        }, 800);
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
    
    // insert at top of main content
    const mainContent = document.querySelector('.container.mt-5');
    mainContent.insertAdjacentHTML('afterbegin', messageHtml);
    
    // auto-dismiss after 5 seconds
    setTimeout(() => {
        const alert = mainContent.querySelector('.alert');
        if (alert) {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }
    }, 5000);
}

// initialize neural bard interface
function initializeNeuralBard() {
    console.log('Neural Bard interface initialized...');
    console.log('The mystical algorithm awaits your musical queries...');
}

// run initialization when page loads
document.addEventListener('DOMContentLoaded', initializeNeuralBard);
