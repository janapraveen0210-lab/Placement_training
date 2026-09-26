import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { XP_CONFIG, calculateLevel, ACHIEVEMENTS } from '../config/gamification.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'data.json');

const INITIAL_DB = {
  profile: {
    id: 'user_candidate',
    name: 'Candidate Student',
    college: 'College of Engineering & Technology',
    department: 'Computer Science & Engineering',
    year: 'Final Year (2026)',
    targetRole: 'Software Engineer - Full Stack',
    xp: 450,
    level: 2,
    levelTitle: 'Learner',
    currentStreak: 3,
    longestStreak: 5,
    lastActiveDate: new Date().toISOString().split('T')[0],
    problemsSolved: ['two-sum'],
    interviewsCompleted: 1,
    assessmentsCompleted: 1,
    communicationCompleted: 1,
    resumeScansCompleted: 1,
    unlockedAchievements: ['first_problem', 'streak_3', 'interview_ready']
  },
  leaderboard: [
    { id: 'lead_1', name: 'Aarav Sharma', college: 'IIT Madras', level: 6, xp: 2850, problemsSolved: 24, streak: 8 },
    { id: 'lead_2', name: 'Priya Patel', college: 'NIT Trichy', level: 5, xp: 2150, problemsSolved: 19, streak: 6 },
    { id: 'lead_3', name: 'Rohan Verma', college: 'BITS Pilani', level: 4, xp: 1650, problemsSolved: 14, streak: 5 },
    { id: 'lead_4', name: 'Ananya Iyer', college: 'PSG Tech', level: 3, xp: 950, problemsSolved: 8, streak: 4 },
    { id: 'user_candidate', name: 'Candidate Student', college: 'College of Engineering & Technology', level: 2, xp: 450, problemsSolved: 1, streak: 3 },
    { id: 'lead_5', name: 'Karthik Raja', college: 'VIT Vellore', level: 2, xp: 350, problemsSolved: 3, streak: 2 }
  ],
  submissions: []
};

// Safe load or initialize DB
function loadDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      saveDb(INITIAL_DB);
      return JSON.parse(JSON.stringify(INITIAL_DB));
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('[DB] Failed to load database file, resetting to initial defaults:', err.message);
    saveDb(INITIAL_DB);
    return JSON.parse(JSON.stringify(INITIAL_DB));
  }
}

// Atomic synchronous save
function saveDb(data) {
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('[DB] Failed to save database file:', err.message);
  }
}

export const db = {
  getProfile() {
    const data = loadDb();
    const p = data.profile;
    const levelInfo = calculateLevel(p.xp);
    return {
      ...p,
      level: levelInfo.level,
      levelTitle: levelInfo.title,
      progressPercent: levelInfo.progressPercent,
      xpToNext: levelInfo.xpToNext,
      minXp: levelInfo.minXp,
      maxXp: levelInfo.maxXp
    };
  },

  updateProfile(fields) {
    const data = loadDb();
    const allowed = ['name', 'college', 'department', 'year', 'targetRole'];
    allowed.forEach(k => {
      if (fields[k] !== undefined && typeof fields[k] === 'string') {
        data.profile[k] = fields[k].trim();
      }
    });

    // Update name on leaderboard
    const userInLeaderboard = data.leaderboard.find(u => u.id === data.profile.id);
    if (userInLeaderboard) {
      userInLeaderboard.name = data.profile.name;
      userInLeaderboard.college = data.profile.college;
    }

    saveDb(data);
    return this.getProfile();
  },

  /**
   * Award XP and atomically check level, streak, achievements, and leaderboard
   */
  awardXp({ type, amount, reason, problemId }) {
    const data = loadDb();
    const p = data.profile;

    const gained = Number(amount) || 0;
    if (gained > 0) {
      p.xp += gained;
    }

    // Update Streak logic
    const today = new Date().toISOString().split('T')[0];
    if (p.lastActiveDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (p.lastActiveDate === yesterday) {
        p.currentStreak += 1;
      } else {
        p.currentStreak = 1; // Reset streak if missed more than 1 day
      }
      p.longestStreak = Math.max(p.longestStreak, p.currentStreak);
      p.lastActiveDate = today;
    }

    // Category increments
    if (type === 'coding' && problemId) {
      if (!p.problemsSolved.includes(problemId)) {
        p.problemsSolved.push(problemId);
      }
    } else if (type === 'interview') {
      p.interviewsCompleted += 1;
    } else if (type === 'skill_assessment') {
      p.assessmentsCompleted += 1;
    } else if (type === 'communication') {
      p.communicationCompleted += 1;
    } else if (type === 'resume') {
      p.resumeScansCompleted += 1;
    }

    // Recalculate level
    const levelInfo = calculateLevel(p.xp);
    p.level = levelInfo.level;
    p.levelTitle = levelInfo.title;

    // Evaluate Achievements
    const newlyUnlocked = [];
    if (!p.unlockedAchievements.includes('first_problem') && p.problemsSolved.length >= 1) {
      p.unlockedAchievements.push('first_problem');
      newlyUnlocked.push('first_problem');
    }
    if (!p.unlockedAchievements.includes('streak_3') && p.currentStreak >= 3) {
      p.unlockedAchievements.push('streak_3');
      newlyUnlocked.push('streak_3');
    }
    if (!p.unlockedAchievements.includes('coding_starter') && p.problemsSolved.length >= 3) {
      p.unlockedAchievements.push('coding_starter');
      newlyUnlocked.push('coding_starter');
    }
    if (!p.unlockedAchievements.includes('interview_ready') && p.interviewsCompleted >= 1) {
      p.unlockedAchievements.push('interview_ready');
      newlyUnlocked.push('interview_ready');
    }
    if (!p.unlockedAchievements.includes('problem_solver') && (p.problemsSolved.length >= 5 || p.level >= 4)) {
      p.unlockedAchievements.push('problem_solver');
      newlyUnlocked.push('problem_solver');
    }
    if (!p.unlockedAchievements.includes('consistent_learner') && p.xp >= 1000) {
      p.unlockedAchievements.push('consistent_learner');
      newlyUnlocked.push('consistent_learner');
    }
    if (!p.unlockedAchievements.includes('communication_master') && p.communicationCompleted >= 1) {
      p.unlockedAchievements.push('communication_master');
      newlyUnlocked.push('communication_master');
    }
    if (!p.unlockedAchievements.includes('ats_optimized') && p.resumeScansCompleted >= 1) {
      p.unlockedAchievements.push('ats_optimized');
      newlyUnlocked.push('ats_optimized');
    }

    // Update leaderboard record
    let userEntry = data.leaderboard.find(u => u.id === p.id);
    if (!userEntry) {
      userEntry = { id: p.id, name: p.name, college: p.college, level: p.level, xp: p.xp, problemsSolved: p.problemsSolved.length, streak: p.currentStreak };
      data.leaderboard.push(userEntry);
    } else {
      userEntry.name = p.name;
      userEntry.college = p.college;
      userEntry.level = p.level;
      userEntry.xp = p.xp;
      userEntry.problemsSolved = p.problemsSolved.length;
      userEntry.streak = p.currentStreak;
    }

    saveDb(data);

    return {
      profile: this.getProfile(),
      xpGained: gained,
      reason,
      newlyUnlocked
    };
  },

  recordSubmission(record) {
    const data = loadDb();
    data.submissions.unshift({
      id: `sub_${Date.now()}`,
      ...record,
      timestamp: new Date().toISOString()
    });
    // Keep last 50 submissions
    if (data.submissions.length > 50) {
      data.submissions = data.submissions.slice(0, 50);
    }
    saveDb(data);
  },

  getLeaderboard() {
    const data = loadDb();
    // Sort descending by XP, then streak
    const sorted = [...data.leaderboard].sort((a, b) => b.xp - a.xp || b.streak - a.streak);
    
    // Add Rank and identify current user
    const ranked = sorted.map((user, idx) => ({
      rank: idx + 1,
      id: user.id,
      name: user.name,
      college: user.college,
      level: user.level,
      xp: user.xp,
      problemsSolved: user.problemsSolved,
      streak: user.streak,
      isCurrentUser: user.id === data.profile.id
    }));

    // Find current user's motivation message
    const currentUserIdx = ranked.findIndex(u => u.isCurrentUser);
    const userRank = currentUserIdx !== -1 ? currentUserIdx + 1 : ranked.length;
    let motivation = `You are currently rank #${userRank}. Complete daily challenges to climb!`;

    if (currentUserIdx > 0) {
      const ahead = ranked[currentUserIdx - 1];
      const xpDiff = ahead.xp - ranked[currentUserIdx].xp;
      motivation = `You are only ${xpDiff} XP away from #${ahead.rank} (${ahead.name})!`;
    }

    return {
      leaderboard: ranked,
      userRank,
      motivation
    };
  },

  getAchievements() {
    const data = loadDb();
    const unlockedSet = new Set(data.profile.unlockedAchievements || []);
    return ACHIEVEMENTS.map(a => ({
      ...a,
      isUnlocked: unlockedSet.has(a.id)
    }));
  },

  getProgress() {
    const p = this.getProfile();
    const achievements = this.getAchievements();
    const unlockedCount = achievements.filter(a => a.isUnlocked).length;
    const { leaderboard, userRank, motivation } = this.getLeaderboard();

    return {
      profile: p,
      stats: {
        totalXp: p.xp,
        level: p.level,
        levelTitle: p.levelTitle,
        progressPercent: p.progressPercent,
        xpToNext: p.xpToNext,
        currentStreak: p.currentStreak,
        longestStreak: p.longestStreak,
        problemsSolvedCount: p.problemsSolved.length,
        interviewsCompleted: p.interviewsCompleted,
        assessmentsCompleted: p.assessmentsCompleted,
        communicationCompleted: p.communicationCompleted,
        resumeScansCompleted: p.resumeScansCompleted,
        achievementsUnlocked: unlockedCount,
        totalAchievements: achievements.length,
        userRank
      },
      motivation,
      recentAchievements: achievements.filter(a => a.isUnlocked).slice(0, 4),
      compactLeaderboard: leaderboard.slice(0, 5)
    };
  }
};
