import React, { useState } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

export default function PersonalizedRoadmap() {
  const [weeks, setWeeks] = useState([
    {
      week: "Week 1",
      title: "Core Data Structures & Algorithm Patterns",
      desc: "Arrays, Two Pointers, Sliding Window, Hash Maps, and Binary Search.",
      tasks: [
        { id: "w1-1", title: "Solve Blind 75 Two Pointers & Sliding Window", completed: true },
        { id: "w1-2", title: "Implement Hash Map from scratch with collision handling", completed: true },
        { id: "w1-3", title: "Complete 1 Mock AI Interview on DSA fundamentals", completed: false }
      ]
    },
    {
      week: "Week 2",
      title: "Trees, Graphs & Dynamic Programming",
      desc: "Binary Trees, BFS/DFS Traversal, Dijkstra's algorithm, and 1D/2D DP.",
      tasks: [
        { id: "w2-1", title: "Master Lowest Common Ancestor & Tree Serializing", completed: true },
        { id: "w2-2", title: "Solve Coin Change & Longest Increasing Subsequence", completed: false },
        { id: "w2-3", title: "Run Aptitude Logical Reasoning Timed Sprint", completed: false }
      ]
    },
    {
      week: "Week 3",
      title: "Operating Systems, DBMS & Low-Level Design",
      desc: "Deadlocks, Concurrency, Virtual Memory, B+ Trees, Indexing, and Schema Design.",
      tasks: [
        { id: "w3-1", title: "Review Coffman deadlock conditions and ACID properties", completed: false },
        { id: "w3-2", title: "Design database schema for an E-commerce inventory system", completed: false },
        { id: "w3-3", title: "Run Resume ATS Scanner to optimize project bullet points", completed: true }
      ]
    },
    {
      week: "Week 4",
      title: "High-Level System Design & Full Mock Interview Marathon",
      desc: "URL Shortener, Distributed Caching (Redis), Load Balancing, and Behavioral STAR.",
      tasks: [
        { id: "w4-1", title: "Study CAP Theorem and Master-Slave DB Replication", completed: false },
        { id: "w4-2", title: "Conduct 3 Full-Length Placement Twin AI Mock Interviews", completed: false },
        { id: "w4-3", title: "Practice 60-Second Elevator Pitch in Communication Lab", completed: false }
      ]
    }
  ]);

  const toggleTask = (weekIdx, taskId) => {
    setWeeks(prev => {
      const copy = [...prev];
      const targetWeek = { ...copy[weekIdx] };
      targetWeek.tasks = targetWeek.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
      copy[weekIdx] = targetWeek;
      return copy;
    });
  };

  const totalTasks = weeks.reduce((acc, w) => acc + w.tasks.length, 0);
  const completedTasks = weeks.reduce((acc, w) => acc + w.tasks.filter(t => t.completed).length, 0);
  const progressPercent = Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Personalized Placement Roadmap</h1>
          <p className="text-xs text-slate-500 mt-1">
            Structured 4-week preparation sprint tuned to eliminate skill gaps evaluated by Qwen AI.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] uppercase font-semibold text-slate-500">Completion</span>
            <div className="font-bold text-blue-700 text-sm">{progressPercent}%</div>
          </div>
          <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
            <div className="bg-blue-600 h-full rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {weeks.map((w, wIdx) => (
          <div key={wIdx} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {w.week}
                </span>
                <h3 className="text-sm font-semibold text-slate-900">{w.title}</h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {w.tasks.filter(t => t.completed).length} / {w.tasks.length} Done
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{w.desc}</p>

            <div className="space-y-2 pt-1">
              {w.tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(wIdx, task.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs transition cursor-pointer ${
                    task.completed
                      ? 'bg-slate-50/70 border-slate-200 text-slate-400 line-through'
                      : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {task.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <span>{task.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
