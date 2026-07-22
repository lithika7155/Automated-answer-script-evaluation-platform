import React, { useState } from 'react';
import { 
  Award, 
  CheckCircle, 
  FileText, 
  Download, 
  BookOpen, 
  TrendingUp, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  BarChart2,
  FileCheck,
  User,
  GraduationCap
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function StudentDashboard({ student, questions, onOpenPdfReport }) {
  if (!student) return null;

  const [openQuestionId, setOpenQuestionId] = useState('Q1');

  // Download Transcript TXT
  const handleDownloadTranscriptTxt = () => {
    let text = `AUTOMATED ANSWER SCRIPT EVALUATION PLATFORM\nSTUDENT OFFICIAL TRANSCRIPT\n----------------------------------------\n`;
    text += `Student Name: ${student.name}\nRoll Number: ${student.rollNumber}\nClass: ${student.classId} (${student.section})\nTotal Score: ${student.overallMarks}/50 (${student.percentage}%)\nGrade: ${student.grade}\n----------------------------------------\n\n`;

    questions.forEach((q) => {
      const evalObj = student.evaluations?.[q.id];
      text += `QUESTION ${q.id}: ${q.title}\n`;
      text += `Prompt: ${q.prompt}\n`;
      text += `Score: ${evalObj ? evalObj.marks : 'N/A'} / 10\n`;
      text += `TrOCR Extracted Response:\n"${evalObj ? evalObj.trocrText : 'N/A'}"\n`;
      text += `AI Rationale: ${evalObj ? evalObj.aiRationale : 'N/A'}\n`;
      text += `Textbook Reference: ${evalObj ? evalObj.textbookRef : 'N/A'}\n\n`;
    });

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${student.name.replace(/\s+/g, '_')}_Transcript_${student.rollNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Compare student vs class average chart data
  const comparisonData = questions.map((q) => {
    const studentScore = student.evaluations?.[q.id]?.marks || 0;
    const classAvg = q.id === 'Q1' ? 8.7 : q.id === 'Q2' ? 8.2 : q.id === 'Q3' ? 7.9 : q.id === 'Q4' ? 8.2 : 8.3;
    return {
      name: q.id,
      YourScore: studentScore,
      ClassAvg: classAvg
    };
  });

  return (
    <div className="space-y-6">
      
      {/* Student Overview Header Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          {/* Profile Info */}
          <div className="flex items-center space-x-4">
            <img 
              src={student.avatar} 
              alt={student.name} 
              className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-glow"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-extrabold text-white">{student.name}</h1>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {student.grade} Grade
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Roll No: {student.rollNumber} • Class: {student.classId} ({student.section})
              </p>
              <div className="flex items-center space-x-2 mt-2 text-[11px] text-slate-300">
                <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Term Exam 2026 • Verified AI Evaluation</span>
              </div>
            </div>
          </div>

          {/* Marks Badge Stats */}
          <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-end">
            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 text-center min-w-[110px]">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Score</div>
              <div className="text-2xl font-extrabold text-white font-mono">{student.overallMarks} <span className="text-xs text-slate-400">/ 50</span></div>
              <div className="text-[10px] text-emerald-400 font-bold">{student.percentage}%</div>
            </div>

            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 text-center min-w-[110px]">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Class Rank</div>
              <div className="text-2xl font-extrabold text-indigo-400 font-mono">#1 <span className="text-xs text-slate-400">/ 48</span></div>
              <div className="text-[10px] text-indigo-300 font-bold">Top 5%</div>
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-800/80">
          <button
            onClick={handleDownloadTranscriptTxt}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download OCR Transcript (.txt)</span>
          </button>

          <button
            onClick={() => onOpenPdfReport(student)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold rounded-xl shadow-glow transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>Download Official PDF Marksheet</span>
          </button>
        </div>

      </div>

      {/* Main Grid: Per Question Feedback Accordion & Class Comparison Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 Cols): Per Question Feedback Accordion */}
        <div className="lg:col-span-8 space-y-4">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
            <FileCheck className="w-4 h-4 text-indigo-400" />
            <span>Question-wise Mark Breakdown & AI Feedback</span>
          </h2>

          <div className="space-y-3">
            {questions.map((q) => {
              const evalObj = student.evaluations?.[q.id];
              const isOpen = openQuestionId === q.id;

              return (
                <div 
                  key={q.id}
                  className="glass-panel rounded-2xl border border-slate-800 overflow-hidden transition-all"
                >
                  {/* Accordion Header */}
                  <button
                    onClick={() => setOpenQuestionId(isOpen ? null : q.id)}
                    className="w-full p-4 flex items-center justify-between bg-slate-900/60 hover:bg-slate-900 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-extrabold text-xs flex items-center justify-center font-mono">
                        {q.id}
                      </span>
                      <div>
                        <div className="font-bold text-slate-100 text-sm">{q.title}</div>
                        <div className="text-[11px] text-slate-400">{q.section} • Max 10 Marks</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-base font-extrabold font-mono text-emerald-400">
                        {evalObj ? evalObj.marks.toFixed(1) : '-'} / 10
                      </span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </button>

                  {/* Accordion Body */}
                  {isOpen && evalObj && (
                    <div className="p-5 border-t border-slate-800/80 space-y-4 bg-slate-950/40">
                      
                      {/* TrOCR Response */}
                      <div>
                        <span className="text-xs font-bold text-slate-300 block mb-1">Your Extracted Response (TrOCR OCR):</span>
                        <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-slate-200 text-xs font-mono leading-relaxed">
                          "{evalObj.trocrText}"
                        </div>
                      </div>

                      {/* Rubric Matrix */}
                      <div>
                        <span className="text-xs font-bold text-slate-300 block mb-2">Detailed Rubric Evaluation:</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {evalObj.rubric && Object.entries(evalObj.rubric).map(([crit, data]) => (
                            <div key={crit} className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                              <div className="flex justify-between font-semibold text-slate-300 text-[11px]">
                                <span className="capitalize">{crit}</span>
                                <span className="text-indigo-300 font-mono">{data.score}/5</span>
                              </div>
                              <p className="text-[10px] text-slate-400">{data.rationale}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* AI Rationale & Textbook Reference */}
                      <div className="bg-indigo-950/30 border border-indigo-500/20 p-3 rounded-xl space-y-1 text-xs">
                        <span className="font-bold text-indigo-300 flex items-center space-x-1">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Textbook Study Recommendation</span>
                        </span>
                        <p className="text-[11px] text-slate-300">{evalObj.textbookRef}</p>
                      </div>

                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (4 Cols): Class Average Comparison & Insights */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Performance Chart */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              <span>Score vs Class Average</span>
            </h3>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 10]} stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Bar dataKey="YourScore" name="Your Score" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="ClassAvg" name="Class Avg" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Key Strengths & AI Summary Card */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Personalized AI Learning Recommendations</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
                <span className="font-bold text-emerald-400 block mb-1">Strongest Concept:</span>
                <p className="text-slate-300 text-[11px]">
                  Exceptional performance on Dijkstra Shortest Path Algorithm (9.5/10) and Virtual Memory Paging (9.0/10).
                </p>
              </div>

              <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-xl">
                <span className="font-bold text-indigo-300 block mb-1">Suggested Review Area:</span>
                <p className="text-slate-300 text-[11px]">
                  Review B-Tree minimum key occupancy formulas in Database Concepts Ch. 14.3.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
