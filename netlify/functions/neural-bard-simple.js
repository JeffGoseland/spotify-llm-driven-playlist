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
                body: JSON.stringify({ error: 'Groq API key not configured' })
            };
        }

        // call groq api with simple fetch
        const groqUrl = 'https://api.groq.com/openai/v1/chat/completions';
        
        const requestBody = {
            model: "llama3-8b-8192",
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
            temperature: 0.7,
            max_tokens: 500
        };

        const response = await fetch(groqUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${groqApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
        }

        const groqResponse = await response.json();
        
        // format response
        const neuralBardResponse = {
            prompt: prompt,
            response: groqResponse.choices[0].message.content,
            timestamp: new Date().toISOString(),
            bardData: {
                message: "The Neural Bard has spoken...",
                status: "divination_complete",
                tokens_used: groqResponse.usage?.total_tokens || 0,
                model_used: groqResponse.model || "llama3-8b-8192"
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
