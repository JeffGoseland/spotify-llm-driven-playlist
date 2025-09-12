exports.handler = async (event, context) => {
    // Force rebuild - v2
    // Log the request for debugging
    console.log('Neural Bard function called:', {
        method: event.httpMethod,
        origin: event.headers.origin || event.headers.Origin,
        userAgent: event.headers['user-agent']
    });

    // CORS headers for all responses
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Max-Age': '86400'
    };

    // handle cors preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: ''
        };
    }

    // only allow post requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // parse request body
        const { prompt, numberOfSongs = 25 } = JSON.parse(event.body);
        
        if (!prompt) {
            return {
                statusCode: 400,
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ error: 'Prompt is required' })
            };
        }

        // validate number of songs
        const songCount = parseInt(numberOfSongs);
        if (isNaN(songCount) || songCount < 5 || songCount > 50) {
            return {
                statusCode: 400,
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ error: 'Number of songs must be between 5 and 50' })
            };
        }

        // get groq api key from environment
        const groqApiKey = process.env.GROQ_API_KEY;
        
        if (!groqApiKey) {
            return {
                statusCode: 500,
                headers: {
                    ...corsHeaders,
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
                    content: `You are the Neural Bard, a mystical AI that specializes in music curation. Respond in a mystical, tech-savvy manner about music. When creating playlists, provide exactly ${songCount} song recommendations. Each song should include the artist name and song title in the format "Artist - Song Title".`
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

        console.log('Making API call to x.ai with request body:', JSON.stringify(requestBody, null, 2));

        const response = await fetch(xaiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${groqApiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        console.log('x.ai API response status:', response.status);
        console.log('x.ai API response headers:', response.headers ? Object.fromEntries(response.headers.entries()) : 'No headers');

        if (!response.ok) {
            const errorText = await response.text();
            console.error('x.ai API error response:', errorText);
            throw new Error(`x.ai API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const xaiResponse = await response.json();
        console.log('x.ai API response data:', JSON.stringify(xaiResponse, null, 2));
        
        // validate response structure
        if (!xaiResponse.choices || !xaiResponse.choices[0] || !xaiResponse.choices[0].message) {
            throw new Error('Invalid response structure from x.ai API');
        }
        
        // format response
        const neuralBardResponse = {
            prompt: prompt,
            response: xaiResponse.choices[0].message.content,
            timestamp: new Date().toISOString(),
            bardData: {
                message: "The Neural Bard has spoken...",
                status: "divination_complete",
                tokens_used: xaiResponse.usage?.total_tokens || 0,
                model_used: xaiResponse.model || "grok-3-fast"
            }
        };

        return {
            statusCode: 200,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(neuralBardResponse)
        };

    } catch (error) {
        console.error('Neural Bard error:', error);
        console.error('Error stack:', error.stack);
        console.error('Request body:', event.body);
        
        return {
            statusCode: 500,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                error: 'The Neural Bard encountered a mystical error...',
                details: error.message,
                stack: error.stack,
                requestBody: event.body
            })
        };
    }
};
