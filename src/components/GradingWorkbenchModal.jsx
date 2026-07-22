import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  BookOpen, 
  Edit3, 
  Sliders, 
  Eye, 
  Maximize2, 
  RotateCw, 
  Layers, 
  Scale,
  Brain,
  MessageSquare,
  FileCheck
} from 'lucide-react';

export default function GradingWorkbenchModal({
  student,
  question,
  onClose,
  onSaveOverride
}) {
  if (!student || !question) return null;

  const evaluation = student.evaluations?.[question.id] || {
    marks: 8.0,
    sbertScore: 0.85,
    status: 'PENDING_REVIEW',
    trocrText: 'Transcribed student answer text sample...',
    rubric: {
      accuracy: { score: 4, rationale: 'Accurate concepts' },
      completeness: { score: 4, rationale: 'Good coverage' },
      reasoning: { score: 4, rationale: 'Sound reasoning' },
      relevance: { score: 4, rationale: 'Relevant' },
      clarity: { score: 4, rationale: 'Clear' }
    },
    strengths: ['Clear concept understanding'],
    weaknesses: ['Could expand on edge cases'],
    aiRationale: 'Strong performance on core problem.',
    textbookRef: 'Standard textbook chapter reference'
  };

  // Image Filter Simulator State
  const [activeFilter, setActiveFilter] = useState('original');
  const [showTrocrOverlay, setShowTrocrOverlay] = useState(true);
  
  // Teacher Override Form State
  const [isOverriding, setIsOverriding] = useState(false);
  const [overrideMarks, setOverrideMarks] = useState(evaluation.marks);
  const [overrideNote, setOverrideNote] = useState(evaluation.teacherOverrideNote || '');

  const handleSave = () => {
    onSaveOverride(student.id, question.id, parseFloat(overrideMarks), overrideNote);
    setIsOverriding(false);
  };

  // Calculate 5-criteria average out of 25 & percentage
  const rubricScores = evaluation.rubric ? Object.values(evaluation.rubric) : [];
  const totalRubricScore = rubricScores.reduce((acc, curr) => acc + (curr.score || 0), 0);
  const rubricPercentage = ((totalRubricScore / 25) * 100).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-6xl glass-panel rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <img 
              src={student.avatar} 
              alt={student.name} 
              className="w-10 h-10 rounded-full object-cover border border-indigo-500/40" 
            />
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-extrabold text-slate-100 text-base">{student.name}</h2>
                <span className="text-xs text-slate-400 font-mono">({student.rollNumber})</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {question.id}: {question.title}
                </span>
              </div>
              <p className="text-xs text-slate-400">Class: {student.classId} • {student.section}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800/80 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Content: Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          
          {/* Left Column (5 Cols): Scanned Image & OpenCV Preprocessing Filters */}
          <div className="lg:col-span-5 p-5 bg-slate-950/50 flex flex-col space-y-4">
            
            {/* Filter Toolbar */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                <span>OpenCV Preprocessing Simulation</span>
              </span>

              <button
                onClick={() => setShowTrocrOverlay(!showTrocrOverlay)}
                className={`text-[10px] px-2 py-1 rounded-md font-semibold border transition-all ${
                  showTrocrOverlay 
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' 
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                TrOCR Bounding Boxes: {showTrocrOverlay ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Filter Presets */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 text-[11px]">
              {['original', 'contrast', 'binarize', 'grayscale', 'deskew'].map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`capitalize px-2.5 py-1 rounded-lg font-medium transition-all ${
                    activeFilter === f 
                      ? 'bg-indigo-600 text-white font-bold shadow' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Image Viewer Frame */}
            <div className="relative flex-1 min-h-[300px] bg-slate-900 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center p-2">
              {evaluation.scannedImageUrl ? (
                <img 
                  src={evaluation.scannedImageUrl} 
                  alt="Scanned Student Answer" 
                  className={`max-w-full max-h-[360px] object-contain rounded transition-all duration-300 ${
                    activeFilter === 'binarize' ? 'filter-binarize' :
                    activeFilter === 'contrast' ? 'filter-contrast' :
                    activeFilter === 'grayscale' ? 'filter-grayscale' :
                    activeFilter === 'deskew' ? 'filter-deskew' : ''
                  }`}
                />
              ) : (
                <div className="text-center p-6 text-slate-500 text-xs">
                  Scanned Script Preview Not Loaded
                </div>
              )}

              {/* OpenCV Watermark Tag */}
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[9px] font-mono text-cyan-300 border border-cyan-500/30">
                OpenCV: {activeFilter.toUpperCase()} • 300 DPI
              </div>
            </div>

            {/* Question Prompt Preview */}
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
              <span className="font-bold text-indigo-300">Question Prompt:</span>
              <p className="text-slate-300 text-[11px] leading-relaxed">{question.prompt}</p>
            </div>

          </div>

          {/* Right Column (7 Cols): AI Evaluation & Teacher Manual Override */}
          <div className="lg:col-span-7 p-6 space-y-5 overflow-y-auto">
            
            {/* Top Score Summary Banner */}
            <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900">
              
              <div>
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                  <span className="text-xs font-extrabold text-slate-300 uppercase tracking-wide">Assigned Score</span>
                  {evaluation.status === 'OVERRIDDEN' && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Teacher Overridden
                    </span>
                  )}
                </div>
                <div className="flex items-baseline space-x-2 mt-1">
                  <span className="text-3xl font-extrabold text-white font-mono">
                    {evaluation.marks.toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">/ {question.maxMarks}.0 Marks</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Sentence-BERT Similarity</div>
                <div className="text-xl font-bold text-cyan-400 font-mono">
                  {(evaluation.sbertScore * 100).toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-500">Vector Embeddings Match</div>
              </div>

              <button
                onClick={() => setIsOverriding(!isOverriding)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isOverriding ? 'Cancel' : 'Override Mark'}</span>
              </button>

            </div>

            {/* Manual Override Editor Box */}
            {isOverriding && (
              <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 flex items-center space-x-1.5">
                    <Scale className="w-4 h-4 text-amber-400" />
                    <span>Faculty Mark Override Workbench</span>
                  </span>
                  <span className="text-[10px] text-amber-400">0.5 increment scale</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      New Score (out of 10):
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.5"
                      value={overrideMarks}
                      onChange={(e) => setOverrideMarks(e.target.value)}
                      className="w-full bg-slate-900 border border-amber-500/40 rounded-lg px-3 py-1.5 text-xs text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Justification Rationale:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Student provided valid margin diagram..."
                      value={overrideNote}
                      onChange={(e) => setOverrideNote(e.target.value)}
                      className="w-full bg-slate-900 border border-amber-500/40 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-1">
                  <button
                    onClick={handleSave}
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors"
                  >
                    Save & Update Performance Matrix
                  </button>
                </div>
              </div>
            )}

            {/* TrOCR Extracted Text vs Model Answer Comparison */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Brain className="w-4 h-4 text-indigo-400" />
                <span>TrOCR Handwriting Extraction vs Model Answer</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                
                {/* TrOCR Transcribed */}
                <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-cyan-300 text-[11px]">TrOCR Neural Extraction:</span>
                    <span className="text-[9px] text-emerald-400 font-mono">Conf: 97.8%</span>
                  </div>
                  <p className="text-slate-200 text-[11px] leading-relaxed font-mono bg-slate-950/60 p-2.5 rounded-lg border border-slate-850">
                    "{evaluation.trocrText}"
                  </p>
                </div>

                {/* Model Answer */}
                <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-indigo-300 text-[11px]">Official Model Answer:</span>
                    <span className="text-[9px] text-indigo-400 font-mono">Benchmark</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-850">
                    "{question.modelAnswer}"
                  </p>
                </div>

              </div>
            </div>

            {/* 5-Criteria Multi-Rubric Breakdown */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  <span>5-Criteria Multi-Rubric Breakdown</span>
                </h4>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  Total Rubric: {totalRubricScore}/25 ({rubricPercentage}%)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {evaluation.rubric && Object.entries(evaluation.rubric).map(([criterion, data]) => (
                  <div key={criterion} className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 flex flex-col justify-between space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="capitalize font-bold text-slate-200 text-[11px]">
                        {criterion === 'accuracy' ? 'Factual Accuracy' :
                         criterion === 'completeness' ? 'Completeness' :
                         criterion === 'reasoning' ? 'Reasoning Quality' :
                         criterion === 'relevance' ? 'Relevance' : 'Clarity'}
                      </span>
                      <span className="font-mono font-bold text-indigo-300 text-xs bg-indigo-500/20 px-2 py-0.5 rounded">
                        {data.score}/5
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">{data.rationale}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Strengths & Weaknesses Bullet Lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl space-y-1.5">
                <span className="font-bold text-emerald-400 text-[11px] flex items-center space-x-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Key Strengths Identified</span>
                </span>
                <ul className="list-disc list-inside text-[11px] text-slate-300 space-y-0.5">
                  {evaluation.strengths?.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl space-y-1.5">
                <span className="font-bold text-amber-300 text-[11px] flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Areas for Improvement</span>
                </span>
                <ul className="list-disc list-inside text-[11px] text-slate-300 space-y-0.5">
                  {evaluation.weaknesses?.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Textbook Context Citation (RAG Alignment) */}
            <div className="bg-indigo-950/40 border border-indigo-500/20 p-3.5 rounded-xl space-y-1 text-xs">
              <div className="flex items-center space-x-1.5 font-bold text-indigo-300">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>Textbook Context RAG Alignment</span>
              </div>
              <p className="text-[11px] text-slate-300 italic leading-relaxed">
                "{question.textbookContext}"
              </p>
              <div className="text-[10px] text-indigo-400 font-semibold pt-1">
                Ref: {evaluation.textbookRef}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
