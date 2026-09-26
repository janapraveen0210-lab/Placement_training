/**
 * Central Gamification & XP Configuration
 * All XP values, levels, and achievement requirements are defined here.
 */

export const XP_CONFIG = {
  CODING_EASY: 50,
  CODING_MEDIUM: 100,
  CODING_HARD: 200,
  INTERVIEW_COMPLETED: 150,
  SKILL_ASSESSMENT_COMPLETED: 100,
  APTITUDE_COMPLETED: 75,
  COMMUNICATION_COMPLETED: 75,
  RESUME_ANALYZER_COMPLETED: 50
};

export const LEVELS = [
  { level: 1, title: 'Beginner', minXp: 0, maxXp: 299 },
  { level: 2, title: 'Learner', minXp: 300, maxXp: 699 },
  { level: 3, title: 'Explorer', minXp: 700, maxXp: 1199 },
  { level: 4, title: 'Problem Solver', minXp: 1200, maxXp: 1799 },
  { level: 5, title: 'Interview Ready', minXp: 1800, maxXp: 2499 },
  { level: 6, title: 'Placement Pro', minXp: 2500, maxXp: 3499 },
  { level: 7, title: 'Placement Champion', minXp: 3500, maxXp: Infinity }
];

export const ACHIEVEMENTS = [
  {
    id: 'first_problem',
    title: 'First Problem',
    icon: '🎯',
    description: 'Solve your first coding problem with all test cases passed.',
    category: 'coding'
  },
  {
    id: 'streak_3',
    title: '3-Day Streak',
    icon: '🔥',
    description: 'Practice for 3 consecutive days.',
    category: 'consistency'
  },
  {
    id: 'coding_starter',
    title: 'Coding Starter',
    icon: '💻',
    description: 'Solve 3 or more placement coding problems.',
    category: 'coding'
  },
  {
    id: 'interview_ready',
    title: 'Interview Ready',
    icon: '🧠',
    description: 'Complete a full AI mock interview session.',
    category: 'interview'
  },
  {
    id: 'problem_solver',
    title: 'Problem Solver',
    icon: '🏆',
    description: 'Reach Level 4 or solve 5 coding problems.',
    category: 'level'
  },
  {
    id: 'consistent_learner',
    title: 'Consistent Learner',
    icon: '🚀',
    description: 'Earn 1,000 or more total XP.',
    category: 'xp'
  },
  {
    id: 'communication_master',
    title: 'Speech Pro',
    icon: '🎙️',
    description: 'Complete a session in the Communication Lab.',
    category: 'communication'
  },
  {
    id: 'ats_optimized',
    title: 'ATS Optimized',
    icon: '📄',
    description: 'Audit your resume with the Resume ATS Scanner.',
    category: 'resume'
  }
];

export function calculateLevel(xp) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) {
      const currentLevel = LEVELS[i];
      const nextLevel = LEVELS[i + 1] || null;
      const progressInLevel = nextLevel 
        ? Math.min(100, Math.round(((xp - currentLevel.minXp) / (currentLevel.maxXp - currentLevel.minXp + 1)) * 100))
        : 100;
      const xpToNext = nextLevel ? (currentLevel.maxXp + 1 - xp) : 0;
      
      return {
        level: currentLevel.level,
        title: currentLevel.title,
        progressPercent: progressInLevel,
        xpToNext,
        minXp: currentLevel.minXp,
        maxXp: currentLevel.maxXp
      };
    }
  }
  return {
    level: 1,
    title: 'Beginner',
    progressPercent: 0,
    xpToNext: 300,
    minXp: 0,
    maxXp: 299
  };
}
