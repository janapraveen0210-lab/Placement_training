import React, { useState, useEffect } from 'react';
import {
  Video,
  Code2,
  Brain,
  FileText,
  Target,
  ArrowRight,
  TrendingUp,
  Award,
  Flame,
  CheckCircle2,
  Calendar,
  Sparkles,
  Trophy,
  UserCheck
} from 'lucide-react';
import { interviewApi } from '../api/interviewApi';

export default function Dashboard({ setActiveTab }) {
  const [profile, setProfile] = useState({
    name: "Alex Johnson",
    college: "Tier-1 Engineering Institute",
    targetRole: "Software Engineer",
    level: 3,
    levelTitle: "Placement Contender",
    xp: 450,
    streak: 4
  });

  const [progressData, setProgressData] = useState({
    level: 3,
    levelTitle: "Placement Contender",
    xp: 450,
    currentLevelMinXp: 300,
    nextLevelXp: 800,
    progressPercent: 30,
    streak: 4,
    problemsSolvedCount: 2,
    interviewsCompletedCount: 3,
    achievementsCount: 2
  });

  const [loading, setLoading] = useState(true);

  // Load real profile & gamification progress
  useEffect(() => {
    const fetchGamificationData = async () => {
      try {
        const [profRes, progRes] = await Promise.allSettled([
          interviewApi.getProfile(),
          interviewApi.getProgress()
        ]);

        if (profRes.status === 'fulfilled' && profRes.value?.success && profRes.value.profile) {
          setProfile(prev => ({ ...prev, ...profRes.value.profile }));
        }

        if (progRes.status === 'fulfilled' && progRes.value?.success) {
          const raw = progRes.value.progress || progRes.value.stats || progRes.value.profile || {};
          setProgressData(prev => ({
            ...prev,
            level: raw.level || prev.level,
            levelTitle: raw.levelTitle || prev.levelTitle,
            xp: raw.xp ?? raw.totalXp ?? prev.xp,
            currentLevelMinXp: raw.currentLevelMinXp ?? prev.currentLevelMinXp,
            nextLevelXp: raw.nextLevelXp ?? prev.nextLevelXp,
            progressPercent: raw.progressPercent ?? prev.progressPercent,
            streak: raw.streak ?? raw.currentStreak ?? prev.streak,
            problemsSolvedCount: raw.problemsSolvedCount ?? prev.problemsSolvedCount,
            interviewsCompletedCount: raw.interviewsCompletedCount ?? raw.interviewsCompleted ?? prev.interviewsCompletedCount,
            achievementsCount: raw.achievementsCount ?? raw.achievementsUnlocked ?? prev.achievementsCount
          }));
        }
      } catch (err) {
        console.warn("Could not fetch dashboard profile/progress:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGamificationData();
  }, []);

  const readinessIndex = 82;

  const quickActions = [
    {
      title: "AI Mock Interview",
      desc: "Practice with a real-time LiveAvatar interviewer powered by Qwen2.5-1.5B evaluating your answers live.",
      tab: "interview",
      icon: Video,
      color: "bg-blue-600 text-white",
      badge: "+150 XP"
    },
    {
      title: "Coding Practice",
      desc: "Solve curated placement coding questions with real Python/Java sandbox execution & test cases.",
      tab: "coding",
      icon: Code2,
      color: "bg-indigo-600 text-white",
      badge: "+50-200 XP"
    },
    {
      title: "Resume ATS Scanner",
      desc: "Analyze your tech resume against tier-1 software engineering job descriptions and key metrics.",
      tab: "resume",
      icon: FileText,
      color: "bg-sky-600 text-white",
      badge: "ATS 90+"
    },
    {
      title: "Communication Lab",
      desc: "Evaluate speaking speed, filler words ('um', 'actually'), and behavioral articulation.",
      tab: "communication",
      icon: Brain,
      color: "bg-teal-600 text-white",
      badge: "Speech"
    }
  ];

  const dreamCompanies = [
    { name: "Google", role: "Software Engineer", match: 86, status: "High Probability" },
    { name: "Microsoft", role: "SDE 1", match: 89, status: "Ready to Apply" },
    { name: "Amazon", role: "SDE 1", match: 81, status: "Focus on System Design" },
    { name: "Atlassian", role: "Graduate Developer", match: 88, status: "Ready to Apply" },
    { name: "TCS Digital", role: "Digital Cadre", match: 94, status: "Guaranteed Clear" }
  ];

  const recentSessions = [
    { role: "Full Stack Engineer", date: "Yesterday, 4:30 PM", score: 84, duration: "22 mins" },
    { role: "Backend Node.js Dev", date: "2 days ago", score: 79, duration: "18 mins" },
    { role: "Frontend React Specialist", date: "Sep 22, 2026", score: 88, duration: "25 mins" }
  ];

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Hero Welcome Card */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-block text-[11px] font-semibold uppercase tracking-wider bg-white/15 px-3 py-1 rounded-full">
                Campus Placement Season 2026
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-2.5 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3" /> Qwen Brain + LiveAvatar
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Welcome back, {profile.name} 👋
            </h1>
            <p className="text-sm text-blue-100 leading-relaxed">
              Placement Twin is primed for your interview practice. Connect with the real-time LiveAvatar interviewer powered by local <strong className="text-white">Qwen2.5-1.5B</strong> or sharpen your algorithms in the coding arena.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('interview')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs shadow-md transition cursor-pointer active:scale-98 shrink-0"
          >
            <Video className="w-4 h-4" />
            <span>Launch AI Interview</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Gamification Progress Summary Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          {/* Level Info */}
          <div className="flex items-center gap-3.5 md:border-r border-slate-100 pr-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-xs">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-blue-700">Level {progressData.level}</span>
                <span className="text-[10px] text-slate-400 font-medium">• Tier-1</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 leading-tight">
                {progressData.levelTitle}
              </h4>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="md:col-span-2 md:border-r border-slate-100 md:px-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Placement XP Progress</span>
              <span className="font-mono text-slate-500 text-[11px]">
                <strong className="text-blue-700">{progressData.xp}</strong>
                {progressData.nextLevelXp ? ` / ${progressData.nextLevelXp} XP` : ' (Max Level)'}
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(5, progressData.progressPercent))}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>Level {progressData.level} ({progressData.currentLevelMinXp} XP)</span>
              <span>
                {progressData.nextLevelXp
                  ? `${progressData.nextLevelXp - progressData.xp} XP to Level ${progressData.level + 1}`
                  : 'Highest Tier reached'}
              </span>
            </div>
          </div>

          {/* Daily Streak & Quick Stats */}
          <div className="flex items-center justify-between sm:justify-around pl-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
                <Flame className="w-5 h-5 fill-amber-500 text-amber-500" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-medium block">Daily Streak</span>
                <span className="text-xs font-bold text-slate-900">{progressData.streak} Days</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
                <Code2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-medium block">Coding Solved</span>
                <span className="text-xs font-bold text-slate-900">{progressData.problemsSolvedCount} Problems</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Placement Index & Dream Companies */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Placement Readiness Card */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Placement Readiness Index
              </span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Tier-1 Caliber
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-4xl font-extrabold text-blue-700">{readinessIndex}%</span>
              <span className="text-xs text-slate-500">Overall Benchmark</span>
            </div>

            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Calculated dynamically from your recent Qwen mock interview responses and coding accuracy.
            </p>
          </div>

          <div className="space-y-3 mt-6 pt-4 border-t border-slate-100 text-xs">
            <div>
              <div className="flex justify-between text-slate-600 mb-1">
                <span>Technical Knowledge</span>
                <span className="font-semibold text-slate-900">85%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: '85%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-600 mb-1">
                <span>Communication Clarity</span>
                <span className="font-semibold text-slate-900">80%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: '80%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-600 mb-1">
                <span>Problem Solving & CS Core</span>
                <span className="font-semibold text-slate-900">78%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: '78%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Dream Companies Card */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-slate-800">
                Dream Company Placement Match
              </h3>
            </div>
            <span className="text-xs text-slate-500">Season 2026</span>
          </div>

          <div className="space-y-2.5">
            {dreamCompanies.map((c, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-blue-200 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    {c.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900">{c.name}</h4>
                    <p className="text-[11px] text-slate-500">{c.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-600 hidden sm:inline">{c.status}</span>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                    {c.match}% Match
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Launch Cards */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
          Training Modules & Accelerators
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <div
                key={i}
                onClick={() => setActiveTab(action.tab)}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-sm transition cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-9 h-9 rounded-xl ${action.color} flex items-center justify-center shadow-xs`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-700 transition">
                      {action.badge}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    {action.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {action.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-medium">
                  <span>Open Module</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-800">
              Recent Placement Twin Sessions
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('progress')}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
          >
            View Full History & Leaderboard →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {recentSessions.map((s, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">{s.role}</span>
                <span className="font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {s.score}%
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>{s.date}</span>
                <span>{s.duration}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
