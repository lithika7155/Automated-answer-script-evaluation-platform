import React from 'react';
import { 
  Sparkles, 
  GraduationCap, 
  UserCheck, 
  Upload, 
  Search, 
  Sun, 
  Moon, 
  CheckCircle2, 
  FileSpreadsheet,
  ChevronDown
} from 'lucide-react';

export default function Header({
  activeRole,
  setActiveRole,
  selectedStudentId,
  setSelectedStudentId,
  students,
  selectedClass,
  setSelectedClass,
  classes,
  selectedSection,
  setSelectedSection,
  sections,
  searchQuery,
  setSearchQuery,
  onOpenUploadModal,
  isDarkMode,
  setIsDarkMode
}) {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-glow">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
                  AutoGrade
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  AI Platform v2.4
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">TrOCR • Sentence-BERT • LLM Evaluation</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-xs mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search students, roll no, questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-900/80 text-slate-200 placeholder-slate-500 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Controls & Role Switcher */}
          <div className="flex items-center space-x-3">
            
            {/* Role Switcher Pill */}
            <div className="bg-slate-900/90 p-1 rounded-xl border border-slate-800 flex items-center">
              <button
                onClick={() => setActiveRole('FACULTY')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeRole === 'FACULTY'
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Faculty View</span>
              </button>

              <button
                onClick={() => setActiveRole('STUDENT')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeRole === 'STUDENT'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Student View</span>
              </button>
            </div>

            {/* Role Specific User Dropdown */}
            {activeRole === 'STUDENT' ? (
              <div className="relative">
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="bg-slate-900 text-slate-200 text-xs font-medium py-1.5 pl-3 pr-8 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500 cursor-pointer appearance-none"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.rollNumber})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            ) : (
              <div className="hidden lg:flex items-center space-x-2 text-xs text-slate-300 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="font-semibold text-slate-200">Dr. Vance</span>
                <span className="text-slate-500">(Professor)</span>
              </div>
            )}

            {/* Upload Action Button */}
            {activeRole === 'FACULTY' && (
              <button
                onClick={onOpenUploadModal}
                className="flex items-center space-x-2 px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold rounded-xl shadow-glow transition-all transform hover:scale-105 active:scale-95"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Upload & Grade Scripts</span>
              </button>
            )}

            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-900/80 border border-slate-800 transition-colors"
              title="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </button>

          </div>

        </div>
      </div>
    </header>
  );
}
