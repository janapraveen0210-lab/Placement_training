import React, { useState } from 'react';
import { X, Play, Award, CheckCircle, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';

export function StartInterviewModal({ isOpen, onClose, onStart, availableAvatars = [] }) {
  const [candidateName, setCandidateName] = useState("Alex Johnson");
  const [role, setRole] = useState("Software Engineer - Full Stack");
  const [techStack, setTechStack] = useState("React, Node.js, Python, PostgreSQL, System Design");
  const [experienceLevel, setExperienceLevel] = useState("Final Year Student / Graduate Fresher");
  const [selectedAvatarId, setSelectedAvatarId] = useState("513fd1b7-7ef9-466d-9af2-344e51eeb833");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onStart({ candidateName, role, techStack, experienceLevel, avatarId: selectedAvatarId });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden relative">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Start AI Placement Interview</h3>
              <p className="text-xs text-slate-500">LiveAvatar Video + Qwen AI Brain</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Candidate Full Name
            </label>
            <input
              type="text"
              required
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
              placeholder="e.g. Alex Johnson"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Target Placement Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
            >
              <option value="Software Engineer - Full Stack">Software Engineer (Full Stack)</option>
              <option value="Software Engineer - Frontend">Software Engineer (Frontend)</option>
              <option value="Software Engineer - Backend">Software Engineer (Backend)</option>
              <option value="Associate Software Engineer (Campus Fresher)">Associate Software Engineer (Campus Fresher)</option>
              <option value="Data Engineer / Python Developer">Data Engineer / Python Developer</option>
              <option value="Cloud & DevOps Engineer">Cloud & DevOps Engineer</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Primary Tech Stack / Coursework
            </label>
            <input
              type="text"
              required
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
              placeholder="e.g. React, Node.js, Python, SQL"
            />
          </div>

          {availableAvatars && availableAvatars.length > 0 && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                AI Interviewer Avatar (LiveAvatar)
              </label>
              <select
                value={selectedAvatarId}
                onChange={(e) => setSelectedAvatarId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
              >
                {availableAvatars.map((av) => (
                  <option key={av.id} value={av.id}>
                    {av.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Experience Level
            </label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
            >
              <option value="Final Year Student / Graduate Fresher">Final Year Student / Graduate Fresher (0-1 yrs)</option>
              <option value="Pre-Final Year (Internship Candidate)">Pre-Final Year (Internship Candidate)</option>
              <option value="Experienced Graduate (1-2 yrs)">Experienced Graduate (1-2 yrs)</option>
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Connect LiveAvatar & Start Interview</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function EndInterviewModal({ isOpen, onClose, report, onRestart }) {
  if (!isOpen || !report) return null;

  const scores = report.finalScores || {
    overallPlacementReadiness: 78,
    technicalKnowledge: 75,
    communication: 82,
    answerStructure: 74,
    problemSolving: 79,
    projectKnowledge: 73
  };

  const getVerdict = (val) => {
    if (val >= 85) return { text: "Tier 1 Product Ready (Strong Hire)", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    if (val >= 75) return { text: "Placement Ready (Hire)", color: "text-blue-700 bg-blue-50 border-blue-200" };
    if (val >= 60) return { text: "Competitive Candidate (Borderline)", color: "text-amber-700 bg-amber-50 border-amber-200" };
    return { text: "Further Preparation Recommended", color: "text-red-700 bg-red-50 border-red-200" };
  };

  const verdict = getVerdict(scores.overallPlacementReadiness);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Placement Evaluation Scorecard</h3>
              <p className="text-xs text-slate-500">Autonomous evaluation by Qwen2.5-1.5B</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-xs">
          {/* Top Score Banner */}
          <div className="p-5 rounded-xl bg-blue-50/60 border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Overall Placement Readiness
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-bold text-blue-700">
                  {scores.overallPlacementReadiness}%
                </span>
                <span className="text-xs text-slate-500">/ 100</span>
              </div>
              <div className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-semibold border ${verdict.color}`}>
                <span>{verdict.text}</span>
              </div>
            </div>

            <div className="text-right text-xs text-slate-600 space-y-1">
              <div>Candidate: <span className="text-slate-900 font-semibold">{report.candidateName}</span></div>
              <div>Role: <span className="text-slate-900 font-semibold">{report.role}</span></div>
              <div>Questions Evaluated: <span className="text-blue-700 font-bold">{report.totalQuestionsAnswered || 1}</span></div>
            </div>
          </div>

          {/* Breakdown Grid */}
          <div>
            <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-3">
              Competency Breakdown
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "Technical Knowledge", val: scores.technicalKnowledge },
                { label: "Communication", val: scores.communication },
                { label: "Answer Structure", val: scores.answerStructure },
                { label: "Problem Solving", val: scores.problemSolving },
                { label: "Project Knowledge", val: scores.projectKnowledge },
                { label: "Overall Score", val: scores.overallPlacementReadiness },
              ].map((item, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-slate-500 font-medium">{item.label}</div>
                  <div className="text-lg font-bold text-slate-900 mt-0.5">{item.val}%</div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: `${item.val}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
              <div className="flex items-center gap-1.5 text-emerald-800 font-semibold mb-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Demonstrated Strengths</span>
              </div>
              <ul className="text-slate-700 space-y-1.5">
                {(report.allStrengths && report.allStrengths.length > 0 ? report.allStrengths : [
                  "Strong articulation of project responsibilities",
                  "Good grasp of asynchronous web architectures"
                ]).map((s, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100">
              <div className="flex items-center gap-1.5 text-amber-800 font-semibold mb-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Areas for Improvement</span>
              </div>
              <ul className="text-slate-700 space-y-1.5">
                {(report.allImprovements && report.allImprovements.length > 0 ? report.allImprovements : [
                  "Mention algorithmic edge cases (e.g. null inputs)",
                  "State Big-O time and space complexity explicitly"
                ]).map((imp, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl font-medium text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            Close Report
          </button>
          <button
            onClick={() => {
              onClose();
              if (onRestart) onRestart();
            }}
            className="px-4 py-2 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition cursor-pointer"
          >
            Start Another Session
          </button>
        </div>
      </div>
    </div>
  );
}
