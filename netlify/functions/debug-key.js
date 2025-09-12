exports.handler = async (event, context) => {
    const apiKey = process.env.GROQ_API_KEY;
    
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            hasApiKey: !!apiKey,
            keyLength: apiKey ? apiKey.length : 0,
            keyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : 'none',
            allEnvKeys: Object.keys(process.env).filter(key => key.includes('GROQ'))
        })
    };
};
