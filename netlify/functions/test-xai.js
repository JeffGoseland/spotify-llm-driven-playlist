exports.handler = async (event, context) => {
    const apiKey = process.env.GROQ_API_KEY;
    
    // Test different x.ai endpoints
    const endpoints = [
        'https://api.x.ai/v1/chat/completions',
        'https://api.x.ai/v1/messages',
        'https://api.x.ai/chat/completions'
    ];
    
    const results = [];
    
    for (const endpoint of endpoints) {
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "grok-beta",
                    messages: [{ role: "user", content: "Hello" }],
                    max_tokens: 10
                })
            });
            
            results.push({
                endpoint: endpoint,
                status: response.status,
                statusText: response.statusText
            });
        } catch (error) {
            results.push({
                endpoint: endpoint,
                error: error.message
            });
        }
    }
    
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            apiKeyPrefix: apiKey ? apiKey.substring(0, 10) : 'none',
            results: results
        })
    };
};
