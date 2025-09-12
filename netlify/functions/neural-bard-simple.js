exports.handler = async (event, context) => {
    // handle cors preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: ''
        };
    }

    // only allow post requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // parse request body
        const { prompt } = JSON.parse(event.body);
        
        if (!prompt) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ error: 'Prompt is required' })
            };
        }

        // get groq api key from environment
        const groqApiKey = process.env.GROQ_API_KEY;
        
        if (!groqApiKey) {
            return {
                statusCode: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ error: 'x.ai API key not configured' })
            };
        }

        // call x.ai api with simple fetch
        const xaiUrl = 'https://api.x.ai/v1/chat/completions';
        
        const requestBody = {
            messages: [
                {
                    role: "system",
                    content: "You are the Neural Bard, a mystical AI that specializes in music curation. Respond in a mystical, tech-savvy manner about music."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: "grok-3-fast",
            stream: false,
            temperature: 0.7
        };

        const response = await fetch(xaiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${groqApiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`x.ai API error: ${response.status} ${response.statusText}`);
        }

        const xaiResponse = await response.json();
        
        // format response
        const neuralBardResponse = {
            prompt: prompt,
            response: xaiResponse.choices[0].message.content,
            timestamp: new Date().toISOString(),
            bardData: {
                message: "The Neural Bard has spoken...",
                status: "divination_complete",
                tokens_used: xaiResponse.usage?.total_tokens || 0,
                model_used: xaiResponse.model || "grok-4-latest"
            }
        };

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(neuralBardResponse)
        };

    } catch (error) {
        console.error('Neural Bard error:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                error: 'The Neural Bard encountered a mystical error...',
                details: error.message
            })
        };
    }
};
