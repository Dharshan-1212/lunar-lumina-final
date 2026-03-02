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
const Groq = require("groq");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory user progress storage (for demonstration)
// In production, use proper database
const userProgressStore = new Map();

// AI Challenge Generator with Level Progression
app.post("/generate-challenge", async (req, res) => {
  try {
    const { level, userId, questionIndex } = req.body;

    if (!level || level < 1 || level > 20) {
      return res.status(400).json({ error: "Level must be between 1 and 20" });
    }

    // Check if level is unlocked (user must complete all previous levels)
    if (level > 1 && userId) {
      try {
        const userProgress = userProgressStore.get(userId) || { highestCompleted: 0, completedLevels: [] };
        
        if (level > userProgress.highestCompleted + 1) {
          return res.status(403).json({ 
            error: "Level locked", 
            message: `Complete level ${userProgress.highestCompleted} to unlock level ${userProgress.highestCompleted + 1}`,
            requiredLevel: userProgress.highestCompleted + 1
          });
        }
      } catch (error) {
        console.error("Progress check error:", error);
      }
    }

    // Determine difficulty based on level
    let difficulty;
    if (level <= 5) difficulty = "Easy";
    else if (level <= 10) difficulty = "Medium";
    else if (level <= 15) difficulty = "Hard";
    else difficulty = "Expert";

    // Different domains for variety
    const domains = [
      "Data Structures & Algorithms",
      "Database Management Systems", 
      "Operating Systems",
      "Computer Networks",
      "Artificial Intelligence & Machine Learning",
      "Web Development",
      "Cybersecurity",
      "Cloud Computing",
      "Mobile Development",
      "Software Engineering Principles",
      "DevOps & CI/CD",
      "System Design"
    ];
    
    const selectedDomain = domains[Math.floor(Math.random() * domains.length)];

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const prompt = `
Generate a unique multiple-choice challenge question for level ${level} (${difficulty} difficulty).

Focus Domain: ${selectedDomain}

Requirements:
- Must be solvable within 10 seconds
- Clear, unambiguous wording
- Only 1 correct answer
- Short and focused question
- AVOID basic definitions like "What does CPU stand for?"
- Focus on practical concepts, algorithms, or problem-solving
- Create realistic scenarios or technical problems
- Ensure to question tests understanding, not just memorization

Return ONLY this exact JSON structure:
{
  "level": "${level}",
  "difficulty": "${difficulty}",
  "question": "Your question here",
  "options": {
    "A": "Option A text",
    "B": "Option B text", 
    "C": "Option C text",
    "D": "Option D text"
  },
  "correctAnswer": "A",
  "explanation": "Brief explanation of why the correct answer is right"
}

Only valid JSON. No extra text.
`;

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = response.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      return res.status(500).json({ error: "Failed to parse AI response" });
    }

    const challengeData = JSON.parse(jsonMatch[0]);
    res.json(challengeData);

  } catch (error) {
    console.error("CHALLENGE GENERATION ERROR:", error);
    res.status(500).json({ error: "Failed to generate challenge" });
  }
});

// Evaluate Challenge Answer
app.post("/evaluate-challenge", async (req, res) => {
  try {
    const { challenge, userAnswer, userId, timeTaken } = req.body;

    if (!challenge || !userAnswer) {
      return res.status(400).json({ error: "Missing challenge or userAnswer" });
    }

    const isCorrect = userAnswer === challenge.correctAnswer;
    const timeBonus = timeTaken && timeTaken < 5 ? 10 : 0;

    // Update user progress if correct answer and userId provided
    let nextLevelUnlocked = false;
    if (isCorrect && userId) {
      try {
        const userProgress = userProgressStore.get(userId) || { highestCompleted: 0, completedLevels: [] };
        
        // Update progress if this level is higher than previously completed
        if (challenge.level > userProgress.highestCompleted) {
          userProgress.highestCompleted = challenge.level;
          userProgress.completedLevels = userProgress.completedLevels || [];
          
          if (!userProgress.completedLevels.includes(challenge.level)) {
            userProgress.completedLevels.push(challenge.level);
            userProgress.completedLevels.sort((a, b) => a - b);
          }
          
          userProgressStore.set(userId, userProgress);
          nextLevelUnlocked = true;
        }
      } catch (error) {
        console.error("Progress save error:", error);
      }
    }

    const result = {
      isCorrect,
      correctAnswer: challenge.correctAnswer,
      userAnswer,
      explanation: challenge.explanation,
      timeBonus,
      nextLevelUnlocked
    };

    res.json(result);

  } catch (error) {
    console.error("CHALLENGE EVALUATION ERROR:", error);
    res.status(500).json({ error: "Challenge evaluation failed" });
  }
});

// Update User Challenge Progress
app.post("/update-challenge-progress", async (req, res) => {
  try {
    const { userId, level, score, totalQuestions, passed } = req.body;
    
    if (!userId || !level) {
      return res.status(400).json({ error: "Missing userId or level" });
    }

    const userProgress = userProgressStore.get(userId) || { highestCompleted: 0, completedLevels: [] };
    
    // Only update if this level was passed and is higher than previously completed
    if (passed && level > userProgress.highestCompleted) {
      userProgress.highestCompleted = level;
      userProgress.completedLevels = userProgress.completedLevels || [];
      
      if (!userProgress.completedLevels.includes(level)) {
        userProgress.completedLevels.push(level);
        userProgress.completedLevels.sort((a, b) => a - b);
      }
      
      userProgressStore.set(userId, userProgress);
    }
    
    const updatedProgress = {
      ...userProgress,
      totalLevels: 20,
      unlockedLevels: Array.from({ length: userProgress.highestCompleted + 1 }, (_, i) => i + 1)
    };
    
    res.json(updatedProgress);

  } catch (error) {
    console.error("PROGRESS UPDATE ERROR:", error);
    res.status(500).json({ error: "Failed to update progress" });
  }
});

// Get User Challenge Progress
app.get("/challenge-progress/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const userProgress = userProgressStore.get(userId) || {
      highestCompleted: 0,
      completedLevels: []
    };
    
    const progress = {
      ...userProgress,
      totalLevels: 20,
      unlockedLevels: Array.from({ length: userProgress.highestCompleted + 1 }, (_, i) => i + 1)
    };
    
    res.json(progress);

  } catch (error) {
    console.error("PROGRESS FETCH ERROR:", error);
    res.status(500).json({ error: "Failed to fetch progress" });
  }
});

// Generate Quiz from Syllabus
app.post("/generate-quiz", async (req, res) => {
  try {
    const { difficulty, syllabus } = req.body;

    if (!difficulty || !syllabus) {
      return res.status(400).json({ error: "Missing difficulty or syllabus" });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const prompt = `
Generate 10 multiple-choice questions from this syllabus: "${syllabus}"

Difficulty: ${difficulty}

Requirements:
- Questions must be based on the syllabus content
- Each question must have 4 options (A, B, C, D)
- Only one correct answer per question
- Questions should be clear and unambiguous
- Include a brief explanation for each correct answer

Return ONLY this JSON format:
{
  "questions": [
    {
      "question": "Question text here",
      "options": {
        "A": "Option A",
        "B": "Option B", 
        "C": "Option C",
        "D": "Option D"
      },
      "correctAnswer": "A",
      "explanation": "Brief explanation"
    }
  ]
}

Only valid JSON. No extra text.
`;

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      return res.status(500).json({ error: "Failed to parse AI response" });
    }

    const quizData = JSON.parse(jsonMatch[0]);
    res.json(quizData);

  } catch (error) {
    console.error("QUIZ GENERATION ERROR:", error);
    res.status(500).json({ error: "Failed to generate quiz" });
  }
});

// Evaluate Quiz Answers
app.post("/evaluate-quiz", async (req, res) => {
  try {
    const { questions, userAnswers } = req.body;

    if (!questions || !userAnswers) {
      return res.status(400).json({ error: "Missing questions or userAnswers" });
    }

    let score = 0;
    const results = questions.map((question, index) => {
      const userAnswer = userAnswers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      if (isCorrect) score++;
      
      return {
        question: question.question,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation
      };
    });

    const totalQuestions = questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);

    res.json({
      score,
      totalQuestions,
      percentage,
      results
    });

  } catch (error) {
    console.error("QUIZ EVALUATION ERROR:", error);
    res.status(500).json({ error: "Failed to evaluate quiz" });
  }
});

// AI Tutor Endpoint
app.post("/ai-tutor", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Missing message" });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const prompt = `
You are an expert AI tutor specializing in programming and computer science concepts.

User question: "${message}"

Provide a clear, concise, and helpful explanation. Focus on:
- Understanding the core concept
- Practical examples
- Common mistakes to avoid
- Best practices

Keep your response under 200 words and be conversational.
`;

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    });

    const aiResponse = response.choices[0].message.content;
    res.json({ message: aiResponse });

  } catch (error) {
    console.error("AI TUTOR ERROR:", error);
    res.status(500).json({ error: "Failed to get AI response" });
  }
});

// Analyze Performance
app.post("/analyze-performance", async (req, res) => {
  try {
    const { quizAttempts, topics } = req.body;

    if (!quizAttempts) {
      return res.status(400).json({ error: "Missing quizAttempts" });
    }

    // Calculate basic metrics
    const totalQuizzes = quizAttempts.length;
    const averageScore = quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / totalQuizzes;
    const latestScore = quizAttempts[quizAttempts.length - 1]?.score || 0;

    // Generate insights
    const insights = {
      totalQuizzes,
      averageScore: Math.round(averageScore),
      latestScore,
      improvement: latestScore > averageScore ? "Improving" : "Needs Practice",
      weakTopics: Object.keys(topics).filter(topic => topics[topic].accuracy < 70),
      strongTopics: Object.keys(topics).filter(topic => topics[topic].accuracy > 80)
    };

    res.json(insights);

  } catch (error) {
    console.error("PERFORMANCE ANALYSIS ERROR:", error);
    res.status(500).json({ error: "Failed to analyze performance" });
  }
});

// Explain Wrong Answers
app.post("/explain-wrong", async (req, res) => {
  try {
    const { wrongAnswers } = req.body;

    if (!wrongAnswers) {
      return res.status(400).json({ error: "Missing wrongAnswers" });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const prompt = `
Explain these incorrect answers in a simple, educational way:

${wrongAnswers.map((item, index) => 
  `${index + 1}. Question: ${item.question}\n   User Answer: ${item.userAnswer}\n   Correct Answer: ${item.correctAnswer}`
).join('\n')}

For each explanation:
- Why the user's answer is incorrect
- Why the correct answer is right
- Key concept to remember
- Keep it concise (under 100 words per explanation)
`;

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const explanations = response.choices[0].message.content;
    res.json({ explanations });

  } catch (error) {
    console.error("EXPLAIN WRONG ERROR:", error);
    res.status(500).json({ error: "Failed to generate explanations" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
