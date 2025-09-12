const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Mock Neural Bard response
app.post('/api/neural-bard', (req, res) => {
    console.log('Mock Neural Bard called with:', req.body);
    
    // Simulate processing delay
    setTimeout(() => {
        const mockResponse = {
            prompt: req.body.prompt,
            response: `The Neural Bard has divined your musical future! Here are ${req.body.numberOfSongs} songs for "${req.body.prompt}":\n\n1. The Beatles - Hey Jude\n2. Led Zeppelin - Stairway to Heaven\n3. Queen - Bohemian Rhapsody\n4. Pink Floyd - Comfortably Numb\n5. The Rolling Stones - Paint It Black\n6. AC/DC - Thunderstruck\n7. Guns N' Roses - Sweet Child O' Mine\n8. Nirvana - Smells Like Teen Spirit\n9. The Who - Baba O'Riley\n10. Deep Purple - Smoke on the Water\n11. Jimi Hendrix - Purple Haze\n12. The Doors - Light My Fire\n13. Cream - Sunshine of Your Love\n14. The Clash - London Calling\n15. Black Sabbath - Paranoid\n16. Rush - Tom Sawyer\n17. Van Halen - Jump\n18. Boston - More Than a Feeling\n19. Foreigner - Hotel California\n20. Journey - Don't Stop Believin'`,
            bardData: {
                message: "The Neural Bard has spoken...",
                status: "divination_complete",
                tokens_used: 150,
                model_used: "grok-3-fast"
            }
        };
        
        res.json(mockResponse);
    }, 2000); // 2 second delay to simulate API call
});

app.listen(PORT, () => {
    console.log(`Mock Neural Bard server running on http://localhost:${PORT}`);
    console.log('Use this for local testing while the Netlify function is being fixed');
});
