import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import AIInterview from './pages/AIInterview';
import SkillAssessment from './pages/SkillAssessment';
import CodingPractice from './pages/CodingPractice';
import AptitudePractice from './pages/AptitudePractice';
import CommunicationLab from './pages/CommunicationLab';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import MyProgress from './pages/MyProgress';
import PersonalizedRoadmap from './pages/PersonalizedRoadmap';
import { interviewApi } from './api/interviewApi';

export default function App() {
  const [activeTab, setActiveTab] = useState('interview'); // Default to flagship AI Interview
  const [backendStatus, setBackendStatus] = useState('checking');

  useEffect(() => {
    const checkConnection = async () => {
      const res = await interviewApi.checkHealth();
      if (res && res.status === 'ok') {
        setBackendStatus('online');
      } else {
        setBackendStatus('offline');
      }
    };
    checkConnection();
    const interval = setInterval(checkConnection, 15000);
    return () => clearInterval(interval);
  }, []);

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'interview':
        return <AIInterview />;
      case 'skills':
        return <SkillAssessment />;
      case 'coding':
        return <CodingPractice />;
      case 'aptitude':
        return <AptitudePractice />;
      case 'communication':
        return <CommunicationLab />;
      case 'resume':
        return <ResumeAnalyzer />;
      case 'progress':
        return <MyProgress />;
      case 'roadmap':
        return <PersonalizedRoadmap />;
      default:
        return <AIInterview />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Top Professional Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        backendStatus={backendStatus}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {renderActivePage()}
      </main>

      {/* Professional Footer */}
      <footer className="w-full bg-white border-t border-slate-200 py-4 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span className="font-semibold text-slate-700">Placement Twin</span>
            <span>• Next-Gen College Placement & Career Acceleration Platform</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Brain: <strong className="text-slate-700">Qwen2.5-1.5B-Instruct</strong> • Real-Time Face: <strong className="text-blue-700">LiveAvatar</strong>
          </div>
        </div>
      </footer>
    </div>
  );
}
