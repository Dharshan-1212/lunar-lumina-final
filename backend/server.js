const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Groq = require('groq');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Endpoint to generate quiz
app.post('/generate-quiz', (req, res) => {
    // Logic to generate quiz based on request data
    res.json({ message: 'Quiz generated successfully!' });
});

// Endpoint to analyze performance
app.post('/analyze-performance', (req, res) => {
    // Logic to analyze user performance
    res.json({ message: 'Performance analysis complete!' });
});

// Endpoint to explain wrong answers
app.post('/explain-wrong', (req, res) => {
    // Logic to explain wrong answers
    res.json({ message: 'Explanations provided!' });
});

// Endpoint for AI Tutor using Groq
app.post('/ai-tutor', async (req, res) => {
    const userMessage = req.body.message;
    try {
        const response = await Groq.chatCompletion({ prompt: userMessage });
        res.json({ message: response });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while processing the request.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});