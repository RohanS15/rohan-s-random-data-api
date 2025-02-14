const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Store API keys
const apiKeys = new Map();

// Random data generators
const generateRandomUser = () => ({
    id: crypto.randomInt(1000, 9999),
    name: ['Alice', 'Bob', 'Charlie', 'David', 'Emma'][Math.floor(Math.random() * 5)],
    age: crypto.randomInt(18, 80),
    email: `user${crypto.randomInt(100, 999)}@example.com`,
    country: ['USA', 'UK', 'Canada', 'Australia', 'Japan'][Math.floor(Math.random() * 5)]
});

const jokes = [
    "Why don't programmers like nature? It has too many bugs.",
    "What do you call a bear with no teeth? A gummy bear!",
    "Why did the scarecrow win an award? He was outstanding in his field!",
    "What do you call a fake noodle? An impasta!"
];

const quotes = [
    "Be the change you wish to see in the world.",
    "Life is what happens while you're busy making other plans.",
    "Success is not final, failure is not fatal.",
    "The only way to do great work is to love what you do."
];

// Generate API key
function generateApiKey() {
    return crypto.randomBytes(16).toString('hex');
}

// Middleware to validate API key
function validateApiKey(req, res, next) {
    const apiKey = req.header('X-API-Key');
    if (!apiKey || !apiKeys.has(apiKey)) {
        return res.status(401).json({ 
            error: 'Invalid API key',
            message: 'Please include a valid API key in the X-API-Key header'
        });
    }
    const keyData = apiKeys.get(apiKey);
    keyData.calls++;
    next();
}

// Register endpoint - get API key
app.post('/register', (req, res) => {
    const apiKey = generateApiKey();
    apiKeys.set(apiKey, {
        createdAt: new Date(),
        calls: 0
    });
    res.json({ 
        apiKey,
        message: 'Save this API key securely. You cannot retrieve it later.',
        endpoints: {
            random_user: '/api/user',
            random_quote: '/api/quote',
            random_joke: '/api/joke',
            stats: '/api/stats'
        }
    });
});

// Random user endpoint
app.get('/api/user', validateApiKey, (req, res) => {
    res.json(generateRandomUser());
});

// Random quote endpoint
app.get('/api/quote', validateApiKey, (req, res) => {
    res.json({
        quote: quotes[Math.floor(Math.random() * quotes.length)]
    });
});

// Random joke endpoint
app.get('/api/joke', validateApiKey, (req, res) => {
    res.json({
        joke: jokes[Math.floor(Math.random() * jokes.length)]
    });
});

// API usage stats
app.get('/api/stats', validateApiKey, (req, res) => {
    const apiKey = req.header('X-API-Key');
    const keyData = apiKeys.get(apiKey);
    res.json({
        totalCalls: keyData.calls,
        createdAt: keyData.createdAt,
        status: 'active'
    });
});

// Home endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'Random Data API',
        version: '1.0.0',
        endpoints: ['/api/user', '/api/quote', '/api/joke', '/api/stats'],
        registration: 'POST to /register to get your API key'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});