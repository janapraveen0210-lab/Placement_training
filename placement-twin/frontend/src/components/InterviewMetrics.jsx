import React, { useState } from 'react';
import { Award, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

export default function InterviewMetrics({ metrics }) {
  const [activeTab, setActiveTab] = useState('scores'); // 'scores' | 'feedback'

  const current = metrics || {
    technical_score: 0,
    communication_score: 0,
    structure_score: 0,
    problem_solving_score: 0,
    project_score: 0,
    overall_score: 0,
    strengths: [],
    improvements: [],
    follow_up_reason: ""
  };

  const metricCards = [
    { label: "Technical Knowledge", key: "technical_score", color: "bg-blue-600" },
    { label: "Communication", key: "communication_score", color: "bg-emerald-600" },
    { label: "Answer Structure", key: "structure_score", color: "bg-amber-600" },
    { label: "Problem Solving", key: "problem_solving_score", color: "bg-indigo-600" },
    { label: "Project Knowledge", key: "project_score", color: "bg-sky-600" },
    { label: "Overall Placement Readiness", key: "overall_score", color: "bg-blue-700", prominent: true },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
      {/* Header */}
      <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-blue-600" />
          <span className="font-semibold text-xs text-slate-800 uppercase tracking-wider">
            Evaluation Metrics (Powered by Qwen AI)
          </span>
        </div>

        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('scores')}
            className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
              activeTab === 'scores' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Competency Scores
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
              activeTab === 'feedback' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Insights & Feedback
          </button>
        </div>
      </div>

      <div className="p-4 flex-1">
        {activeTab === 'scores' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {metricCards.map((m, idx) => {
              const score = current[m.key] || 0;
              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between ${
                    m.prominent ? 'bg-blue-50/50 border-blue-200 col-span-2 md:col-span-1' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-600">{m.label}</span>
                    <span className="text-base font-bold text-slate-900">
                      {score > 0 ? `${score}%` : '--'}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${m.color} transition-all duration-500`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {current.follow_up_reason && (
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 text-xs">
                <div className="flex items-center gap-1.5 text-blue-800 font-semibold mb-1">
                  <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                  <span>Evaluation Strategy</span>
                </div>
                <p className="text-slate-700 leading-relaxed">{current.follow_up_reason}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-700 font-semibold mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Demonstrated Strengths</span>
                </div>
                {current.strengths && current.strengths.length > 0 ? (
                  <ul className="space-y-1.5 text-slate-700">
                    {current.strengths.map((str, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500 italic">Strengths will appear after your first evaluated response.</p>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex items-center gap-1.5 text-amber-800 font-semibold mb-2">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Areas for Improvement</span>
                </div>
                {current.improvements && current.improvements.length > 0 ? (
                  <ul className="space-y-1.5 text-slate-700">
                    {current.improvements.map((imp, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500 italic">Technical gap analysis will populate dynamically.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
