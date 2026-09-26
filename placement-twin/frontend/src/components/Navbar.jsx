import React from 'react';
import {
  LayoutDashboard,
  Video,
  CheckSquare,
  Code2,
  Brain,
  Mic2,
  FileText,
  LineChart,
  Compass,
  GraduationCap
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, backendStatus = "online" }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'interview', label: 'AI Interview', icon: Video, badge: 'LiveAvatar' },
    { id: 'skills', label: 'Skill Assessment', icon: CheckSquare },
    { id: 'coding', label: 'Coding Practice', icon: Code2 },
    { id: 'aptitude', label: 'Aptitude Practice', icon: Brain },
    { id: 'communication', label: 'Communication Lab', icon: Mic2 },
    { id: 'resume', label: 'Resume Analyzer', icon: FileText },
    { id: 'progress', label: 'My Progress', icon: LineChart },
    { id: 'roadmap', label: 'Personalized Roadmap', icon: Compass },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Name */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-slate-900 tracking-tight">
                  Placement Twin
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  AI Interview
                </span>
              </div>
              <p className="text-[11px] text-slate-500">College Placement Preparation Platform</p>
            </div>
          </div>

          {/* Engine Status */}
          <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs">
            <span className="flex h-2 w-2 relative">
              <span className={`inline-flex rounded-full h-2 w-2 ${backendStatus === 'online' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            </span>
            <span className="text-slate-600 text-[11px]">
              Engine: <strong className="text-slate-800 font-semibold">Qwen2.5-1.5B</strong> + <strong className="text-blue-700 font-semibold">LiveAvatar</strong>
            </span>
          </div>
        </div>

        {/* Scrollable Navigation Bar */}
        <nav className="flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 text-xs scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
