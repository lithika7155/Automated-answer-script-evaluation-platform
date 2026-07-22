import React from 'react';
import { X, Printer, Download, Sparkles, Award, BookOpen, CheckCircle } from 'lucide-react';

export default function PDFReportModal({ student, questions, onClose }) {
  if (!student) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:static">
      
      {/* Container */}
      <div className="relative w-full max-w-4xl glass-panel rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-0 print:rounded-none">
        
        {/* Header Bar (Hidden on print) */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-900/90 print:hidden">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-indigo-400" />
            <span className="font-extrabold text-white text-sm">Official Student Evaluation Marksheet Preview</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Marksheet Body */}
        <div className="p-8 bg-white text-slate-900 overflow-y-auto space-y-6 print:p-6 print:overflow-visible">
          
          {/* Institution Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                Department of Computer Science & Engineering
              </h1>
              <p className="text-xs font-bold text-indigo-700">AUTOMATED ANSWER SCRIPT EVALUATION PLATFORM</p>
              <p className="text-[11px] text-slate-600">TrOCR Neural OCR & Multi-Criteria Rubric Transcript</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-800 font-mono font-bold text-xs rounded border border-indigo-200">
                OFFICIAL REPORT
              </span>
              <p className="text-[10px] text-slate-500 mt-1 font-mono">Date: {new Date().toISOString().slice(0, 10)}</p>
            </div>
          </div>

          {/* Student & Course Details Table */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
            <div>
              <p className="text-slate-500 font-medium">Student Name:</p>
              <p className="font-bold text-slate-900 text-sm">{student.name}</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium">Roll Number:</p>
              <p className="font-bold text-slate-900 font-mono text-sm">{student.rollNumber}</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium">Course / Class:</p>
              <p className="font-bold text-slate-900">{student.classId} ({student.section})</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium">Grade & Percentage:</p>
              <p className="font-bold text-emerald-700 text-sm">{student.grade} ({student.percentage}%)</p>
            </div>
          </div>

          {/* Marks Breakdown Table */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Evaluation Breakdown By Question</h3>
            
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-y border-slate-300">
                  <th className="py-2 px-3">Q#</th>
                  <th className="py-2 px-3">Question Title</th>
                  <th className="py-2 px-3 text-center">Max</th>
                  <th className="py-2 px-3 text-center">Awarded</th>
                  <th className="py-2 px-3">AI Evaluation Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {questions.map((q) => {
                  const evalObj = student.evaluations?.[q.id];
                  return (
                    <tr key={q.id}>
                      <td className="py-2 px-3 font-bold font-mono text-slate-900">{q.id}</td>
                      <td className="py-2 px-3 font-semibold text-slate-800">{q.title}</td>
                      <td className="py-2 px-3 text-center text-slate-600">10.0</td>
                      <td className="py-2 px-3 text-center font-bold font-mono text-indigo-700">
                        {evalObj ? evalObj.marks.toFixed(1) : '-'}
                      </td>
                      <td className="py-2 px-3 text-[11px] text-slate-600">{evalObj?.aiRationale || 'N/A'}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-indigo-50 font-bold border-t-2 border-slate-900 text-slate-900">
                  <td colSpan={3} className="py-2.5 px-3 text-right">Grand Total Score:</td>
                  <td className="py-2.5 px-3 text-center font-mono text-indigo-900 text-sm">
                    {student.overallMarks.toFixed(1)} / 50.0
                  </td>
                  <td className="py-2.5 px-3 text-xs text-indigo-800">Status: {student.status}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Signature & Verification Seal */}
          <div className="pt-8 border-t border-slate-200 flex justify-between items-end text-xs">
            <div>
              <p className="font-bold text-slate-800">Evaluator System Signature</p>
              <p className="text-[10px] text-slate-500">AutoGrade AI Core Engine v2.4 (Sha-256 Verified)</p>
            </div>
            <div className="text-center">
              <div className="w-32 border-b border-slate-400 mb-1"></div>
              <p className="font-bold text-slate-800">Dr. Robert Vance</p>
              <p className="text-[10px] text-slate-500">Course Coordinator Signature</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
