require("dotenv").config();

if (!process.env.GROQ_API_KEY) {
  console.error("\n❌ GROQ_API_KEY is missing!");
  console.error("Create a .env file in the backend folder with:");
  console.error("  GROQ_API_KEY=your_key_here\n");
  console.error("Get a free API key at: https://console.groq.com/keys\n");
  process.exit(1);
}

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const Groq = require("groq-sdk");

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});
app.post("/generate-quiz", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const difficulty = req.body.difficulty || "medium";
    const syllabusText = req.file.buffer.toString();

    const prompt = `
Generate 10 ${difficulty} level multiple choice questions 
from this syllabus:

${syllabusText}

Return ONLY valid JSON in this format:
[
  {
    "question": "string",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "one of the options exactly"
  }
]
Only JSON. No explanation.
`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "user", content: prompt }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
    });

    const text = completion.choices[0].message.content;

    // Extract JSON safely
    const jsonStart = text.indexOf("[");
    const jsonEnd = text.lastIndexOf("]") + 1;

    if (jsonStart === -1 || jsonEnd === -1) {
      return res.status(500).json({ error: "AI did not return valid JSON" });
    }

    const jsonString = text.slice(jsonStart, jsonEnd);
    const questions = JSON.parse(jsonString);

    res.json(questions);

  } catch (error) {
    console.error("GROQ ERROR:", error);
    res.status(500).json({ error: "AI generation failed" });
  }
});

app.post("/analyze-performance", async (req, res) => {
  try {
    const { currentQuiz, previousQuizzes } = req.body;

    if (!currentQuiz) {
      return res.status(400).json({ error: "Missing currentQuiz data" });
    }

    const prompt = `
You are an Advanced AI Learning Intelligence Engine.

Analyze this student's quiz performance and return ONLY valid JSON.

Input:
${JSON.stringify({ currentQuiz, previousQuizzes }, null, 2)}

Your tasks:
1. Calculate topic-wise accuracy percentage.
2. Detect weak (<50%), moderate (50-75%), and strong (>75%) topics.
3. Analyze trend using previous quiz scores (improving / stagnating / declining).
4. Predict learning velocity (fast learner / moderate learner / at-risk learner).
5. Detect early stagnation if performance plateaued for 3 attempts.
6. Decide next difficulty:
   - If improving consistently and score > 75% -> increase
   - If stagnating -> keep same
   - If declining -> reduce
7. Generate a 3-day study plan targeting weak areas.
8. Return structured JSON.

Return ONLY this JSON format, no explanation:
{
  "performanceSummary": "string",
  "topicAccuracy": { "topicName": number },
  "weakTopics": ["string"],
  "moderateTopics": ["string"],
  "strongTopics": ["string"],
  "trendAnalysis": "string",
  "learningVelocity": "string",
  "riskLevel": "Low | Medium | High",
  "recommendedDifficulty": "string",
  "studyPlan": {
    "day1": "string",
    "day2": "string",
    "day3": "string"
  },
  "improvementStrategies": ["string", "string", "string"],
  "motivation": "string"
}
`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      temperature: 0.5,
    });

    const text = completion.choices[0].message.content;

    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}") + 1;

    if (jsonStart === -1 || jsonEnd === 0) {
      return res.status(500).json({ error: "AI did not return valid JSON" });
    }

    const analysis = JSON.parse(text.slice(jsonStart, jsonEnd));
    res.json(analysis);

  } catch (error) {
    console.error("ANALYZE ERROR:", error);
    res.status(500).json({ error: "Analysis failed" });
  }
});

app.post("/explain-wrong", async (req, res) => {
  try {
    const { wrongAnswers } = req.body;

    if (!wrongAnswers || wrongAnswers.length === 0) {
      return res.json({ explanations: [] });
    }

    const prompt = `
For each question below, the student chose the wrong answer. Explain briefly why the correct answer is right and why their answer is wrong. Return ONLY a JSON array of explanation strings, one per question. No extra text.

Questions:
${wrongAnswers.map((w, i) => `${i + 1}. Question: "${w.question}" | Student answered: "${w.userAnswer}" | Correct answer: "${w.correctAnswer}"`).join("\n")}

Return ONLY a JSON array like: ["explanation1", "explanation2", ...]
`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      temperature: 0.3,
    });

    const text = completion.choices[0].message.content;

    const jsonStart = text.indexOf("[");
    const jsonEnd = text.lastIndexOf("]") + 1;

    if (jsonStart === -1 || jsonEnd === 0) {
      return res.status(500).json({ error: "AI did not return valid JSON" });
    }

    const explanations = JSON.parse(text.slice(jsonStart, jsonEnd));
    res.json({ explanations });

  } catch (error) {
    console.error("EXPLAIN ERROR:", error);
    res.status(500).json({ error: "Explanation failed" });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
