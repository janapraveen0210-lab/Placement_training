import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Trophy,
  Award,
  Flame,
  Code2,
  Video,
  User,
  Edit3,
  CheckCircle2,
  Lock,
  Sparkles,
  ChevronRight,
  TrendingUp,
  X
} from 'lucide-react';
import { interviewApi } from '../api/interviewApi';

export default function MyProgress() {
  const [profile, setProfile] = useState({
    name: "Alex Johnson",
    college: "Tier-1 Engineering Institute",
    branch: "Computer Science and Engineering",
    graduationYear: 2026,
    targetRole: "Software Engineer",
    level: 3,
    levelTitle: "Placement Contender",
    xp: 450,
    streak: 4
  });

  const [progress, setProgress] = useState({
    level: 3,
    levelTitle: "Placement Contender",
    xp: 450,
    nextLevelXp: 800,
    progressPercent: 30,
    streak: 4,
    problemsSolvedCount: 2,
    interviewsCompletedCount: 3,
    achievementsCount: 2
  });

  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(4);
  const [achievements, setAchievements] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    college: "",
    branch: "",
    graduationYear: 2026
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const sessionHistory = [
    { date: "Sep 25, 2026", role: "SDE 1 (Full Stack)", score: 84, tech: 88, comm: 80, dsa: 85 },
    { date: "Sep 22, 2026", role: "Backend Node.js Dev", score: 79, tech: 82, comm: 76, dsa: 78 },
    { date: "Sep 18, 2026", role: "Frontend React Specialist", score: 88, tech: 90, comm: 85, dsa: 89 },
    { date: "Sep 12, 2026", role: "Associate Software Engineer", score: 72, tech: 70, comm: 74, dsa: 72 },
  ];

  // Fetch gamification & progress data
  const loadData = async () => {
    try {
      const [profRes, progRes, leadRes, achRes] = await Promise.allSettled([
        interviewApi.getProfile(),
        interviewApi.getProgress(),
        interviewApi.getLeaderboard(),
        interviewApi.getAchievements()
      ]);

      if (profRes.status === 'fulfilled' && profRes.value?.success) {
        setProfile(profRes.value.profile);
        setEditFormData({
          name: profRes.value.profile.name || "",
          college: profRes.value.profile.college || "",
          branch: profRes.value.profile.branch || "",
          graduationYear: profRes.value.profile.graduationYear || 2026
        });
      }

      if (progRes.status === 'fulfilled' && progRes.value?.success) {
        setProgress(progRes.value.progress);
      }

      if (leadRes.status === 'fulfilled' && leadRes.value?.success) {
        setLeaderboard(leadRes.value.leaderboard || []);
        setUserRank(leadRes.value.userRank || 4);
      }

      if (achRes.status === 'fulfilled' && achRes.value?.success) {
        setAchievements(achRes.value.achievements || []);
      }
    } catch (err) {
      console.warn("Could not load gamification center data:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenEdit = () => {
    setEditFormData({
      name: profile.name,
      college: profile.college,
      branch: profile.branch,
      graduationYear: profile.graduationYear
    });
    setSaveSuccess(false);
    setShowEditModal(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await interviewApi.updateProfile(editFormData);
      if (res && res.success) {
        setProfile(res.profile);
        setSaveSuccess(true);
        setTimeout(() => {
          setShowEditModal(false);
          setSaveSuccess(false);
        }, 800);
      }
    } catch (err) {
      console.error("Error saving profile:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header with Edit Profile Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Placement Readiness Progress & Analytics</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track your gamified skill tier, competitive campus leaderboard rank, and historical mock evaluations.
          </p>
        </div>

        <button
          onClick={handleOpenEdit}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-200 font-semibold text-xs shadow-2xs transition cursor-pointer self-start sm:self-auto"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Student Profile</span>
        </button>
      </div>

      {/* Student Profile Card + Gamification Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-xs">
                {profile.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{profile.name}</h3>
                <p className="text-xs text-slate-500">{profile.college}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    Class of {profile.graduationYear}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {profile.branch}
                  </span>
                </div>
              </div>
            </div>

            {/* Level & Progress */}
            <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-blue-700">Level {progress.level}</span>
                  <span className="text-slate-500 font-medium ml-1.5">• {progress.levelTitle}</span>
                </div>
                <span className="font-mono text-xs font-semibold text-slate-700">{progress.xp} Total XP</span>
              </div>

              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(5, progress.progressPercent))}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-400">
                {progress.nextLevelXp
                  ? `${progress.nextLevelXp - progress.xp} XP needed to reach Level ${progress.level + 1}`
                  : "Maximum Level Mastered!"}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-slate-100 text-center">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-center gap-1 text-amber-500 font-bold text-sm">
                <Flame className="w-3.5 h-3.5 fill-amber-500" />
                <span>{progress.streak}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">Day Streak</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-center gap-1 text-blue-600 font-bold text-sm">
                <Code2 className="w-3.5 h-3.5" />
                <span>{progress.problemsSolvedCount}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">Solved</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-center gap-1 text-emerald-600 font-bold text-sm">
                <Video className="w-3.5 h-3.5" />
                <span>{progress.interviewsCompletedCount}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">Interviews</span>
            </div>
          </div>
        </div>

        {/* Campus Placement Leaderboard */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-slate-900">Campus Placement Leaderboard</h3>
            </div>
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
              Your Rank: #{userRank}
            </span>
          </div>

          <div className="p-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider border-b border-slate-100 pb-2">
                <tr>
                  <th className="py-2 px-3">Rank</th>
                  <th className="py-2 px-3">Candidate</th>
                  <th className="py-2 px-3">Level</th>
                  <th className="py-2 px-3">Streak</th>
                  <th className="py-2 px-3 text-right">Placement XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-sans">
                {leaderboard.map((item, idx) => {
                  const isUser = item.isCurrentUser;
                  return (
                    <tr
                      key={item.id || idx}
                      className={`transition ${isUser ? 'bg-blue-50/70 font-semibold' : 'hover:bg-slate-50/60'}`}
                    >
                      <td className="py-2.5 px-3">
                        {item.rank === 1 ? (
                          <span className="text-amber-500 font-bold">🥇 #1</span>
                        ) : item.rank === 2 ? (
                          <span className="text-slate-400 font-bold">🥈 #2</span>
                        ) : item.rank === 3 ? (
                          <span className="text-amber-700 font-bold">🥉 #3</span>
                        ) : (
                          <span className="text-slate-500">#{item.rank}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-900 font-medium">
                            {item.name} {isUser && <span className="text-blue-600 text-[10px] font-bold">(You)</span>}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block">{item.college}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                        Lvl {item.level}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        <span className="flex items-center gap-1 text-[11px]">
                          <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                          {item.streak}d
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700">
                        {item.xp} XP
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Ranks refresh dynamically based on verified mock interviews & coding solves.</span>
            <span className="font-medium text-blue-700">Top 5% Tier</span>
          </div>
        </div>
      </div>

      {/* Unlocked Badges & Achievements */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-900">Placement Achievements & Badges</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {achievements.filter(a => a.unlocked).length} / {achievements.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                ach.unlocked
                  ? 'bg-gradient-to-b from-blue-50/50 to-white border-blue-200 shadow-2xs'
                  : 'bg-slate-50/60 border-slate-200/70 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{ach.icon || "🏆"}</span>
                  {ach.unlocked ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" /> UNLOCKED
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> LOCKED
                    </span>
                  )}
                </div>

                <h4 className="text-xs font-bold text-slate-900">{ach.title}</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{ach.description}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span>Reward</span>
                <span className="font-bold text-blue-700">+{ach.xpReward} XP</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Evaluation Log */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-900">Historical Evaluation Log</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">Qwen AI + LiveAvatar</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-6">Date</th>
                <th className="py-3 px-6">Target Role</th>
                <th className="py-3 px-6">Technical</th>
                <th className="py-3 px-6">Communication</th>
                <th className="py-3 px-6">DSA Depth</th>
                <th className="py-3 px-6">Overall Readiness</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sessionHistory.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-6 text-slate-500 font-medium">{row.date}</td>
                  <td className="py-3.5 px-6 font-semibold text-slate-900">{row.role}</td>
                  <td className="py-3.5 px-6 font-semibold text-blue-700">{row.tech}%</td>
                  <td className="py-3.5 px-6 font-semibold text-emerald-700">{row.comm}%</td>
                  <td className="py-3.5 px-6 font-semibold text-indigo-700">{row.dsa}%</td>
                  <td className="py-3.5 px-6">
                    <span className="font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                      {row.score}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                Edit Student Profile
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">College / University</label>
                <input
                  type="text"
                  required
                  value={editFormData.college}
                  onChange={(e) => setEditFormData({ ...editFormData, college: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Branch / Major</label>
                  <input
                    type="text"
                    required
                    value={editFormData.branch}
                    onChange={(e) => setEditFormData({ ...editFormData, branch: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Graduation Year</label>
                  <input
                    type="number"
                    required
                    value={editFormData.graduationYear}
                    onChange={(e) => setEditFormData({ ...editFormData, graduationYear: parseInt(e.target.value) || 2026 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {saveSuccess && (
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
