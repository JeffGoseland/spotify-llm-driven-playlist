// neural bard - groq api integration for spotify playlist generation

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

        // call groq api
        const groqResponse = await callGroqAPI(prompt, groqApiKey);
        
        // format neural bard response
        const neuralBardResponse = {
            prompt: prompt,
            response: groqResponse.choices[0].message.content,
            timestamp: new Date().toISOString(),
            bardData: {
                message: "The Neural Bard has spoken...",
                status: "divination_complete",
                tokens_used: groqResponse.usage?.total_tokens || 0,
                mystical_confidence: 0.95,
                model_used: groqResponse.model || "grok-3-mini"
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

// call groq api with neural bard personality
async function callGroqAPI(prompt, apiKey) {
    const groqUrl = 'https://api.groq.com/openai/v1/chat/completions';
    
    // neural bard system prompt
    const systemPrompt = `You are the Neural Bard, a mystical AI that specializes in music curation and playlist generation. You speak in a mystical, tech-savvy manner about music and algorithms. You have deep knowledge of music genres, artists, and audio features. When users ask for playlists, provide creative, detailed responses about the music they should listen to, including specific artists, songs, and the reasoning behind your recommendations. Always maintain your mystical, algorithmic personality while being helpful and informative about music.`;

    const requestBody = {
        model: "grok-3-mini",
        messages: [
            {
                role: "system",
                content: systemPrompt
            },
            {
                role: "user",
                content: prompt
            }
        ],
        temperature: 0.7,
        max_tokens: 1000
    };

    const response = await fetch(groqUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
}
