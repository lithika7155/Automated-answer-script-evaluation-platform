import React, { useState, useEffect } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  Cpu, 
  Sparkles, 
  CheckCircle2, 
  Loader2, 
  ArrowRight,
  Layers,
  Image as ImageIcon
} from 'lucide-react';

export default function UploadSimulatorModal({ onClose, onCompleteBatchProcessing }) {
  const [selectedPreset, setSelectedPreset] = useState('CS-101');
  const [studentName, setStudentName] = useState('Elena Rostova');
  const [rollNumber, setRollNumber] = useState('2026-CS-089');
  
  // Pipeline animation steps
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { title: 'OpenCV Preprocessing', desc: 'Denoising, Deskewing & Contrast Binarization' },
    { title: 'TrOCR Neural Extraction', desc: 'Transforming handwritten ink to clean digital text' },
    { title: 'Sentence-BERT Vector Match', desc: 'Computing semantic embedding cosine similarity' },
    { title: 'LLM Multi-Criteria Rubric', desc: 'Evaluating Accuracy, Completeness & Reasoning' }
  ];

  const handleStartProcessing = () => {
    setIsProcessing(true);
    setCurrentStep(1);

    setTimeout(() => setCurrentStep(2), 1200);
    setTimeout(() => setCurrentStep(3), 2400);
    setTimeout(() => setCurrentStep(4), 3600);

    setTimeout(() => {
      setIsProcessing(false);
      // Construct new evaluated student object
      const newStudent = {
        id: `STU-${Date.now().toString().slice(-3)}`,
        name: studentName,
        rollNumber: rollNumber,
        classId: selectedPreset,
        section: 'Sec A',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
        email: `${studentName.toLowerCase().replace(/\s+/g, '.')}@university.edu`,
        overallMarks: 44.0,
        percentage: 88.0,
        grade: 'A',
        status: 'APPROVED',
        evaluations: {
          Q1: {
            marks: 9.0,
            sbertScore: 0.92,
            status: 'APPROVED',
            trocrText: "Dijkstra's shortest path algorithm maintains distance bounds dist[u]. Relaxes edges using priority queue min-heap. Time complexity is O((V+E) log V).",
            rubric: {
              accuracy: { score: 4.5, rationale: 'Accurate pseudocode' },
              completeness: { score: 4.5, rationale: 'Includes heap queue' },
              reasoning: { score: 4.5, rationale: 'Sound edge relaxation' },
              relevance: { score: 5, rationale: 'Direct' },
              clarity: { score: 4.5, rationale: 'Clean formatting' }
            },
            strengths: ['Great priority queue breakdown'],
            weaknesses: [],
            aiRationale: 'Evaluated automatically via TrOCR batch model.',
            textbookRef: 'CLRS 4th Ed. Ch. 24.3'
          },
          Q2: { marks: 8.5, sbertScore: 0.88, status: 'APPROVED', trocrText: 'Process address space vs thread heap sharing.', rubric: { accuracy: { score: 4.5, rationale: 'Spot on' }, completeness: { score: 4, rationale: 'Good' }, reasoning: { score: 4, rationale: 'Good' }, relevance: { score: 4.5, rationale: 'Relevant' }, clarity: { score: 4, rationale: 'Clear' } }, strengths: ['Shared memory IPC'], weaknesses: [], aiRationale: 'Good OS concept answer.', textbookRef: 'Silberschatz Ch 3.4' },
          Q3: { marks: 8.5, sbertScore: 0.87, status: 'APPROVED', trocrText: 'B-Tree node branching order m for page block I/O.', rubric: { accuracy: { score: 4.5, rationale: 'Accurate' }, completeness: { score: 4, rationale: 'Good' }, reasoning: { score: 4, rationale: 'Good' }, relevance: { score: 4.5, rationale: 'Relevant' }, clarity: { score: 4, rationale: 'Clear' } }, strengths: ['Disk page block alignment'], weaknesses: [], aiRationale: 'Accurate indexing logic.', textbookRef: 'Korth Ch 14.3' },
          Q4: { marks: 9.0, sbertScore: 0.90, status: 'APPROVED', trocrText: 'Virtual memory MMU trap, swap partition fetch, TLB reload.', rubric: { accuracy: { score: 4.5, rationale: 'Accurate' }, completeness: { score: 4.5, rationale: 'Thorough' }, reasoning: { score: 4.5, rationale: 'Good' }, relevance: { score: 5, rationale: 'Relevant' }, clarity: { score: 4.5, rationale: 'Clear' } }, strengths: ['Page fault interrupt'], weaknesses: [], aiRationale: 'Clear trap handler flow.', textbookRef: 'Tanenbaum Ch 3.3' },
          Q5: { marks: 9.0, sbertScore: 0.89, status: 'APPROVED', trocrText: 'ACID transaction properties: WAL undo log for atomicity.', rubric: { accuracy: { score: 4.5, rationale: 'Accurate' }, completeness: { score: 4.5, rationale: 'Good' }, reasoning: { score: 4.5, rationale: 'Good' }, relevance: { score: 5, rationale: 'Relevant' }, clarity: { score: 4.5, rationale: 'Clear' } }, strengths: ['WAL logging'], weaknesses: [], aiRationale: 'Strong transaction guarantees.', textbookRef: 'Elmasri Ch 20.1' }
        }
      };

      onCompleteBatchProcessing(newStudent);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl glass-panel rounded-2xl border border-slate-700 shadow-2xl overflow-hidden p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-white">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-white text-base">Batch Script AI Evaluation Engine</h2>
              <p className="text-xs text-slate-400">TrOCR OCR & Sentence-BERT Automated Grading Simulator</p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Dropzones */}
        {!isProcessing && currentStep === 0 && (
          <div className="space-y-4">
            
            {/* Student Info Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Student Name:</label>
                <input 
                  type="text" 
                  value={studentName} 
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Roll Number:</label>
                <input 
                  type="text" 
                  value={rollNumber} 
                  onChange={(e) => setRollNumber(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Drop Zone Box */}
            <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500/60 rounded-2xl p-8 text-center bg-slate-900/40 transition-colors cursor-pointer space-y-3">
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div>
                <span className="font-bold text-slate-200 text-sm block">Drag & Drop Scanned Answer Scripts Here</span>
                <span className="text-xs text-slate-400">Supports JPEG, PNG, TIFF, PDF (300 DPI handwriting scans)</span>
              </div>
              <div className="inline-block px-3 py-1 bg-slate-800 rounded-md text-[10px] font-mono text-cyan-300 border border-slate-700">
                Simulated Batch File: CS101_Final_Elena_Rostova.pdf (5 pages)
              </div>
            </div>

            {/* Pipeline Configuration Options */}
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300 font-semibold">
                <span>OCR Pipeline Architecture:</span>
                <span className="text-cyan-400 font-mono">TrOCR-Large-Handwritten</span>
              </div>
              <div className="flex justify-between text-slate-300 font-semibold">
                <span>Semantic Embedder:</span>
                <span className="text-indigo-400 font-mono">all-mpnet-base-v2 (Sentence-BERT)</span>
              </div>
              <div className="flex justify-between text-slate-300 font-semibold">
                <span>Rubric Evaluator:</span>
                <span className="text-emerald-400 font-mono">GPT-4-Turbo (5 Criteria Scale)</span>
              </div>
            </div>

            {/* Trigger Button */}
            <button
              onClick={handleStartProcessing}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-extrabold text-sm rounded-xl shadow-glow transition-all transform hover:scale-[1.01]"
            >
              Start Automated AI Evaluation Pipeline
            </button>

          </div>
        )}

        {/* Live Processing Pipeline Animation Progress */}
        {(isProcessing || currentStep > 0) && (
          <div className="py-6 space-y-6">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center space-x-2 text-xs font-bold text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/30">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
                <span>AI Pipeline Active • Processing Script...</span>
              </div>
              <h3 className="text-lg font-extrabold text-white">{studentName} ({rollNumber})</h3>
            </div>

            {/* Step List */}
            <div className="space-y-3">
              {steps.map((s, idx) => {
                const stepNum = idx + 1;
                const isCompleted = currentStep > stepNum || (!isProcessing && currentStep === 4);
                const isCurrent = currentStep === stepNum && isProcessing;

                return (
                  <div 
                    key={idx}
                    className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                      isCompleted ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' :
                      isCurrent ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-200 animate-pulse' :
                      'bg-slate-900/40 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center space-x-3 text-xs">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono">
                        {isCompleted ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> :
                         isCurrent ? <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" /> :
                         stepNum}
                      </div>
                      <div>
                        <div className="font-bold">{s.title}</div>
                        <div className="text-[10px] opacity-80">{s.desc}</div>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-bold">
                      {isCompleted ? '100% DONE' : isCurrent ? 'PROCESSING...' : 'WAITING'}
                    </span>
                  </div>
                );
              })}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
