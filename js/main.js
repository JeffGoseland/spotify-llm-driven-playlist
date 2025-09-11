// neural bard - spotify llm playlist generator main script

// send prompt to neural bard and display response
function sendToNeuralBard() {
    const prompt = document.getElementById('neuralBardPrompt').value.trim();
    
    if (!prompt) {
        showNeuralBardMessage('The Neural Bard requires a prompt to divine your musical future...', 'warning');
        return;
    }

    // show loading modal with neural bard personality
    showNeuralBardLoading();

    // simulate neural bard response (replace with real api call)
    setTimeout(() => {
        const neuralBardResponse = {
            prompt: prompt,
            response: generateNeuralBardResponse(prompt),
            timestamp: new Date().toISOString(),
            bardData: {
                message: "The Neural Bard has spoken...",
                status: "divination_complete",
                tokens_used: 150,
                mystical_confidence: 0.95
            }
        };

        displayNeuralBardData(neuralBardResponse);
        hideNeuralBardLoading();
    }, 2000); // 2 second delay to simulate neural processing
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
