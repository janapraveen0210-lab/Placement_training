import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import crypto from 'crypto';
import liveavatarRouter from './routes/liveavatar.js';
import codingRouter from './routes/coding.js';
import gamificationRouter from './routes/gamification.js';
import { db } from './database/db.js';
import { XP_CONFIG } from './config/gamification.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Mount API routes
app.use('/api/liveavatar', liveavatarRouter);
app.use('/api/coding', codingRouter);
app.use('/api', gamificationRouter);

// In-memory store for active sessions (can be replaced with Redis/Mongo)
const interviewSessions = new Map();

/**
 * Unified AI Caller: Supports Cloud Groq API (Qwen/Llama) or Local Python FastAPI (Qwen2.5-1.5B)
 */
async function callAI(message, conversation = []) {
  if (process.env.GROQ_API_KEY) {
    const groqModel = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
    const messages = [
      {
        role: 'system',
        content: `You are "Placement Twin AI", an elite, senior technical interviewer conducting a high-stakes campus placement interview for software engineering roles at top tech companies.
Your responsibilities:
1. Conduct an adaptive, realistic, 1-on-1 technical interview.
2. Ask exactly ONE clear question at a time.
3. Evaluate the candidate rigorously on each turn:
   - Technical Understanding (0-100)
   - Communication Clarity (0-100)
   - Answer Structure (STAR method / clear reasoning) (0-100)
   - Problem Solving & Critical Thinking (0-100)
   - Project Knowledge & Implementation Depth (0-100)
   - Overall Placement Readiness (0-100)
   - Key Strengths (array of strings)
   - Actionable Improvements (array of strings)
   - Rationale for the next follow-up question.

CRITICAL: Respond ONLY with a valid, parseable JSON object matching this schema:
{
  "response": "<Your professional interviewer dialogue addressing their answer and asking the next question>",
  "evaluation": {
    "next_question": "<The exact single question you are asking next>",
    "technical_score": 85,
    "communication_score": 80,
    "structure_score": 80,
    "problem_solving_score": 75,
    "project_score": 70,
    "overall_score": 80,
    "strengths": ["string"],
    "improvements": ["string"],
    "follow_up_reason": "string"
  }
}`
      },
      ...conversation.map(c => ({ role: c.role, content: c.content })),
      { role: 'user', content: message }
    ];

    const groqRes = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: groqModel,
      messages,
      response_format: { type: "json_object" },
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    const parsed = JSON.parse(groqRes.data.choices[0].message.content);
    return {
      response: parsed.response,
      evaluation: parsed.evaluation
    };
  }

  // Fallback to local Python FastAPI Qwen2.5 service
  const response = await axios.post(`${AI_SERVICE_URL}/ai/chat`, {
    message: message.trim(),
    conversation
  }, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 120000
  });

  return response.data;
}

// Health Check
app.get('/api/health', async (req, res) => {
  let aiHealth = { status: 'unreachable' };
  if (process.env.GROQ_API_KEY) {
    aiHealth = {
      status: 'online',
      provider: 'groq-cloud-llm',
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'
    };
  } else {
    try {
      const response = await axios.get(`${AI_SERVICE_URL}/health`, { timeout: 3000 });
      aiHealth = response.data;
    } catch (err) {
      aiHealth = { status: 'offline', error: err.message };
    }
  }

  res.json({
    status: 'ok',
    backendPort: PORT,
    aiServiceUrl: AI_SERVICE_URL,
    aiServiceStatus: aiHealth
  });
});

/**
 * POST /api/interview/start
 * Initializes a new interview session and generates the first question.
 */
app.post('/api/interview/start', async (req, res) => {
  try {
    const {
      candidateName = 'Candidate',
      role = 'Full Stack Software Engineer',
      techStack = 'React, Node.js, Python, SQL',
      experienceLevel = 'Fresher / College Graduate'
    } = req.body;

    const sessionId = crypto.randomUUID();

    const initialQuestion = `Hello ${candidateName}! Welcome to your technical interview for the ${role} position. To get started, please introduce yourself, share your primary technical background, and tell me about a project you recently built using ${techStack}.`;

    const sessionData = {
      sessionId,
      candidateName,
      role,
      techStack,
      experienceLevel,
      startedAt: new Date().toISOString(),
      conversation: [
        {
          role: 'assistant',
          content: initialQuestion
        }
      ],
      metricsHistory: [],
      currentMetrics: {
        technical_score: 75,
        communication_score: 80,
        structure_score: 75,
        problem_solving_score: 75,
        project_score: 70,
        overall_score: 75
      }
    };

    interviewSessions.set(sessionId, sessionData);

    return res.status(201).json({
      success: true,
      sessionId,
      message: initialQuestion,
      question: initialQuestion,
      currentMetrics: sessionData.currentMetrics,
      sessionData: {
        candidateName,
        role,
        techStack,
        startedAt: sessionData.startedAt
      }
    });
  } catch (error) {
    console.error('Error starting interview session:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to start interview session',
      details: error.message
    });
  }
});

/**
 * POST /api/interview/message
 * Forwards candidate's answer and previous context to Python FastAPI AI service (Qwen2.5-1.5B-Instruct).
 */
app.post('/api/interview/message', async (req, res) => {
  try {
    const { sessionId, message, conversation = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Message cannot be empty' });
    }

    const session = sessionId ? interviewSessions.get(sessionId) : null;
    const history = conversation.length > 0 ? conversation : (session ? session.conversation : []);

    // Forward request to AI (Groq cloud LLM or local Python FastAPI Qwen2.5)
    let aiResponse;
    try {
      aiResponse = await callAI(message.trim(), history);
    } catch (aiErr) {
      console.error('Error from AI Service:', aiErr.response?.data || aiErr.message);

      if (aiErr.code === 'ECONNREFUSED' || aiErr.code === 'ETIMEDOUT') {
        return res.status(503).json({
          success: false,
          error: 'AI service is currently unavailable. Set GROQ_API_KEY in environment or run local FastAPI on port 8000.',
          details: aiErr.message
        });
      }

      return res.status(500).json({
        success: false,
        error: 'AI service encountered an inference error',
        details: aiErr.response?.data?.detail || aiErr.message
      });
    }

    // Update in-memory session if sessionId was passed
    if (session) {
      session.conversation.push({ role: 'user', content: message.trim() });
      session.conversation.push({ role: 'assistant', content: aiResponse.response });
      if (aiResponse.evaluation) {
        session.metricsHistory.push(aiResponse.evaluation);
        session.currentMetrics = {
          technical_score: aiResponse.evaluation.technical_score,
          communication_score: aiResponse.evaluation.communication_score,
          structure_score: aiResponse.evaluation.structure_score,
          problem_solving_score: aiResponse.evaluation.problem_solving_score,
          project_score: aiResponse.evaluation.project_score,
          overall_score: aiResponse.evaluation.overall_score
        };
      }
    }

    return res.json({
      success: true,
      sessionId: sessionId || null,
      response: aiResponse.response,
      evaluation: aiResponse.evaluation
    });
  } catch (error) {
    console.error('Server error handling interview message:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error processing interview message',
      details: error.message
    });
  }
});

/**
 * POST /api/interview/evaluate
 * Returns aggregated evaluation and insights for the current session or supplied metrics.
 */
app.post('/api/interview/evaluate', (req, res) => {
  try {
    const { sessionId, evaluations = [] } = req.body;
    let evalList = evaluations;

    if (sessionId && interviewSessions.has(sessionId)) {
      const session = interviewSessions.get(sessionId);
      if (evalList.length === 0) {
        evalList = session.metricsHistory;
      }
    }

    if (evalList.length === 0) {
      return res.json({
        success: true,
        summary: {
          totalQuestions: 0,
          averageOverallScore: 0,
          technicalScore: 0,
          communicationScore: 0,
          structureScore: 0,
          problemSolvingScore: 0,
          projectScore: 0,
          readinessStatus: 'Pending Evaluation'
        }
      });
    }

    const n = evalList.length;
    const avg = (key) => Math.round(evalList.reduce((acc, curr) => acc + (curr[key] || 0), 0) / n);

    const technicalAvg = avg('technical_score');
    const commAvg = avg('communication_score');
    const structAvg = avg('structure_score');
    const probAvg = avg('problem_solving_score');
    const projAvg = avg('project_score');
    const overallAvg = avg('overall_score');

    let readinessStatus = 'Needs Foundation Building';
    if (overallAvg >= 85) readinessStatus = 'Top Tier - Day 1 Offer Ready';
    else if (overallAvg >= 75) readinessStatus = 'Placement Ready (Product Companies)';
    else if (overallAvg >= 65) readinessStatus = 'Good Potential (Services & Mid-size IT)';

    return res.json({
      success: true,
      summary: {
        totalRounds: n,
        technicalScore: technicalAvg,
        communicationScore: commAvg,
        structureScore: structAvg,
        problemSolvingScore: probAvg,
        projectScore: projAvg,
        averageOverallScore: overallAvg,
        readinessStatus,
        history: evalList
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to evaluate interview metrics',
      details: error.message
    });
  }
});

/**
 * POST /api/interview/end
 * Concludes the interview and produces a final detailed placement scorecard.
 */
app.post('/api/interview/end', (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = sessionId ? interviewSessions.get(sessionId) : null;

    const evalList = session ? session.metricsHistory : [];
    const n = evalList.length || 1;
    const avg = (key, fallback = 75) => 
      evalList.length > 0 
        ? Math.round(evalList.reduce((acc, curr) => acc + (curr[key] || 0), 0) / n)
        : fallback;

    const finalReport = {
      sessionId,
      candidateName: session?.candidateName || 'Candidate',
      role: session?.role || 'Software Engineer',
      durationMinutes: session ? Math.max(1, Math.round((new Date() - new Date(session.startedAt)) / 60000)) : 15,
      totalQuestionsAnswered: evalList.length,
      finalScores: {
        technicalKnowledge: avg('technical_score', 78),
        communication: avg('communication_score', 82),
        answerStructure: avg('structure_score', 74),
        problemSolving: avg('problem_solving_score', 79),
        projectKnowledge: avg('project_score', 73),
        overallPlacementReadiness: avg('overall_score', 77)
      },
      allStrengths: Array.from(new Set(evalList.flatMap(e => e.strengths || []))),
      allImprovements: Array.from(new Set(evalList.flatMap(e => e.improvements || []))),
      recommendations: [
        'Practice structured STAR method for technical problem breakdown.',
        'Review database indexing and distributed caching mechanisms before final round.',
        'Highlight measurable metrics and impact in project descriptions.'
      ],
      completedAt: new Date().toISOString()
    };

    if (session) {
      session.isCompleted = true;
      session.finalReport = finalReport;

      // Atomically award interview completion XP if not already awarded
      if (!session.xpAwarded && evalList.length >= 1) {
        session.xpAwarded = true;
        const xpResult = db.awardXp({
          type: 'interview',
          amount: XP_CONFIG.INTERVIEW_COMPLETED,
          reason: `Completed AI placement interview for ${session.role}`
        });
        finalReport.xpGained = XP_CONFIG.INTERVIEW_COMPLETED;
        finalReport.newLevel = xpResult.profile.level;
        finalReport.totalXp = xpResult.profile.xp;
      }
    }

    return res.json({
      success: true,
      message: 'Interview session ended successfully.',
      report: finalReport
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to conclude interview session',
      details: error.message
    });
  }
});

// Export the Express app for Vercel
export default app;

// Run normally when developing locally
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(` Placement Twin Express Backend running on port ${PORT}`);
    console.log(` AI Service configured at: ${AI_SERVICE_URL}`);
    console.log(`=================================================`);
  });
}
