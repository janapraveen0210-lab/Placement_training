import express from 'express';
import { codeExecutionService } from '../services/codeExecutionService.js';
import { db } from '../database/db.js';

const router = express.Router();

/**
 * GET /api/coding/problems
 * Returns list of available coding practice problems
 */
router.get('/problems', (req, res) => {
  try {
    const problems = codeExecutionService.getProblems();
    const profile = db.getProfile();
    const solvedSet = new Set(profile.problemsSolved || []);

    const enriched = problems.map(p => ({
      ...p,
      isSolved: solvedSet.has(p.id)
    }));

    res.json({
      success: true,
      problems: enriched
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/coding/problem/:id
 * Get details and starter code for a specific problem
 */
router.get('/problem/:id', (req, res) => {
  try {
    const problem = codeExecutionService.getProblemById(req.params.id);
    if (!problem) {
      return res.status(404).json({ success: false, error: 'Problem not found' });
    }
    const profile = db.getProfile();
    const isSolved = (profile.problemsSolved || []).includes(problem.id);

    res.json({
      success: true,
      problem: {
        ...problem,
        testCases: problem.testCases.filter(tc => !tc.isHidden), // Don't expose hidden test cases
        isSolved
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/coding/run
 * Runs student code against sample test cases (or custom input) without submitting for XP
 */
router.post('/run', async (req, res) => {
  try {
    const { language, code, problemId, customInput } = req.body;
    if (!code || !problemId) {
      return res.status(400).json({ success: false, error: 'Code and problemId are required' });
    }

    const result = await codeExecutionService.executeCode({
      language,
      code,
      problemId,
      isSubmission: false,
      customInput: customInput || null
    });

    res.json({
      success: true,
      result
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/coding/submit
 * Submits student code against ALL test cases (including hidden).
 * If all pass and problem wasn't previously solved, awards XP and updates streak/achievements!
 */
router.post('/submit', async (req, res) => {
  try {
    const { language, code, problemId } = req.body;
    if (!code || !problemId) {
      return res.status(400).json({ success: false, error: 'Code and problemId are required' });
    }

    const result = await codeExecutionService.executeCode({
      language,
      code,
      problemId,
      isSubmission: true
    });

    // Record submission
    db.recordSubmission({
      problemId,
      language,
      status: result.status,
      passedCount: result.passedCount,
      totalCount: result.totalCount,
      runtime: result.runtime
    });

    let xpAwardResult = null;

    // Check if fully accepted
    if (result.status === 'Accepted' && result.passedCount === result.totalCount) {
      const profile = db.getProfile();
      const alreadySolved = (profile.problemsSolved || []).includes(problemId);

      if (!alreadySolved) {
        // Award XP for solving the problem
        xpAwardResult = db.awardXp({
          type: 'coding',
          amount: result.xpReward,
          reason: `Solved problem: ${problemId}`,
          problemId
        });
      }
    }

    res.json({
      success: true,
      result,
      gamification: xpAwardResult ? {
        xpGained: xpAwardResult.xpGained,
        currentXp: xpAwardResult.profile.xp,
        currentLevel: xpAwardResult.profile.level,
        levelTitle: xpAwardResult.profile.levelTitle,
        newlyUnlockedAchievements: xpAwardResult.newlyUnlocked,
        streak: xpAwardResult.profile.currentStreak
      } : null
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
