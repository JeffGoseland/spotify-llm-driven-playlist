exports.handler = async (event, context) => {
    const apiKey = process.env.GROQ_API_KEY;
    
    // Test the Groq API with a simple request
    const groqUrl = 'https://api.groq.com/openai/v1/chat/completions';
    
    const requestBody = {
        model: "llama3-8b-8192",
        messages: [
            {
                role: "user",
                content: "Hello"
            }
        ],
        max_tokens: 10
    };

    try {
        const response = await fetch(groqUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        const responseText = await response.text();
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                status: response.status,
                statusText: response.statusText,
                response: responseText,
                apiKeyPrefix: apiKey ? apiKey.substring(0, 10) : 'none'
            })
        };
    } catch (error) {
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: error.message,
                apiKeyPrefix: apiKey ? apiKey.substring(0, 10) : 'none'
            })
        };
    }
};
