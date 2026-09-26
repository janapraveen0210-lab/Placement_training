import express from 'express';
import { db } from '../database/db.js';
import { XP_CONFIG } from '../config/gamification.js';

const router = express.Router();

/**
 * GET /api/profile
 * Get current student profile with level, streak, and XP
 */
router.get('/profile', (req, res) => {
  try {
    const profile = db.getProfile();
    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/profile
 * Update student profile information
 */
router.put('/profile', (req, res) => {
  try {
    const updated = db.updateProfile(req.body);
    res.json({ success: true, profile: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/leaderboard
 * Get sorted leaderboard with privacy protection
 */
router.get('/leaderboard', (req, res) => {
  try {
    const leaderboardData = db.getLeaderboard();
    res.json({ success: true, ...leaderboardData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/achievements
 * Get all achievements and unlock status
 */
router.get('/achievements', (req, res) => {
  try {
    const achievements = db.getAchievements();
    res.json({ success: true, achievements });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/progress
 * Get overall progress metrics, stats, and motivation message
 */
router.get('/progress', (req, res) => {
  try {
    const progressData = db.getProgress();
    res.json({ success: true, ...progressData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/xp/award
 * Generic XP award endpoint for activities like assessments, communication lab, etc.
 */
router.post('/xp/award', (req, res) => {
  try {
    const { activityType, customAmount } = req.body;
    let amount = customAmount;

    if (!amount) {
      if (activityType === 'skill_assessment') amount = XP_CONFIG.SKILL_ASSESSMENT_COMPLETED;
      else if (activityType === 'aptitude') amount = XP_CONFIG.APTITUDE_COMPLETED;
      else if (activityType === 'communication') amount = XP_CONFIG.COMMUNICATION_COMPLETED;
      else if (activityType === 'resume') amount = XP_CONFIG.RESUME_ANALYZER_COMPLETED;
      else amount = 25;
    }

    const awardResult = db.awardXp({
      type: activityType,
      amount,
      reason: `Completed ${activityType}`
    });

    res.json({
      success: true,
      ...awardResult
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
