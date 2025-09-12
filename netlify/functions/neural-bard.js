// neural bard - groq api integration for spotify playlist generation

// rate limiting storage (in production, use Redis or database)
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per minute

// request validation
function validatePrompt(prompt) {
    if (!prompt || typeof prompt !== 'string') {
        return { valid: false, error: 'Prompt must be a non-empty string' };
    }
    
    if (prompt.length > 1000) {
        return { valid: false, error: 'Prompt too long (max 1000 characters)' };
    }
    
    if (prompt.length < 3) {
        return { valid: false, error: 'Prompt too short (min 3 characters)' };
    }
    
    // check for potentially malicious content
    const suspiciousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /eval\s*\(/i,
        /function\s*\(/i
    ];
    
    for (const pattern of suspiciousPatterns) {
        if (pattern.test(prompt)) {
            return { valid: false, error: 'Invalid content detected' };
        }
    }
    
    return { valid: true };
}

// rate limiting check
function checkRateLimit(clientIP) {
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW;
    
    if (!rateLimit.has(clientIP)) {
        rateLimit.set(clientIP, []);
    }
    
    const requests = rateLimit.get(clientIP);
    
    // remove old requests outside the window
    const recentRequests = requests.filter(timestamp => timestamp > windowStart);
    rateLimit.set(clientIP, recentRequests);
    
    if (recentRequests.length >= RATE_LIMIT_MAX) {
        return { allowed: false, remaining: 0 };
    }
    
    // add current request
    recentRequests.push(now);
    rateLimit.set(clientIP, recentRequests);
    
    return { 
        allowed: true, 
        remaining: RATE_LIMIT_MAX - recentRequests.length 
    };
}

// log request for monitoring
function logRequest(clientIP, prompt, response, error = null) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        clientIP: clientIP,
        promptLength: prompt ? prompt.length : 0,
        responseLength: response ? response.length : 0,
        error: error ? error.message : null,
        success: !error
    };
    
    console.log('Neural Bard Request:', JSON.stringify(logEntry));
}

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
        // get client ip for rate limiting
        const clientIP = event.headers['x-forwarded-for'] || 
                        event.headers['x-real-ip'] || 
                        'unknown';
        
        // check rate limit
        const rateLimitCheck = checkRateLimit(clientIP);
        if (!rateLimitCheck.allowed) {
            logRequest(clientIP, null, null, new Error('Rate limit exceeded'));
            return {
                statusCode: 429,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json',
                    'Retry-After': '60'
                },
                body: JSON.stringify({ 
                    error: 'The Neural Bard is overwhelmed... Please try again later.',
                    retryAfter: 60
                })
            };
        }
        
        // parse request body
        const { prompt } = JSON.parse(event.body);
        
        // validate prompt
        const validation = validatePrompt(prompt);
        if (!validation.valid) {
            logRequest(clientIP, prompt, null, new Error(validation.error));
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ error: validation.error })
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
                model_used: groqResponse.model || "grok-3-mini",
                rateLimitRemaining: rateLimitCheck.remaining
            }
        };

        // log successful request
        logRequest(clientIP, prompt, neuralBardResponse.response);

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
                'X-RateLimit-Remaining': rateLimitCheck.remaining.toString(),
                'X-RateLimit-Reset': new Date(Date.now() + RATE_LIMIT_WINDOW).toISOString()
            },
            body: JSON.stringify(neuralBardResponse)
        };

    } catch (error) {
        console.error('Neural Bard error:', error);
        
        // log error request
        const clientIP = event.headers['x-forwarded-for'] || 
                        event.headers['x-real-ip'] || 
                        'unknown';
        logRequest(clientIP, null, null, error);
        
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                error: 'The Neural Bard encountered a mystical error...',
                details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
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
        model: "llama3-8b-8192",
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
