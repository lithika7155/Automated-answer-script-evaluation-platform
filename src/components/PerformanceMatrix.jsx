import React from 'react';
import { 
  FileSpreadsheet, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  FileText, 
  Filter, 
  Download, 
  Eye, 
  Edit3,
  SlidersHorizontal,
  Layers
} from 'lucide-react';
import { exportPerformanceMatrixCSV } from '../utils/csvExporter';

export default function PerformanceMatrix({
  students,
  questions,
  selectedClass,
  setSelectedClass,
  classes,
  selectedSection,
  setSelectedSection,
  sections,
  selectedStatus,
  setSelectedStatus,
  onOpenEvaluation,
  onOpenPdfReport,
  onBulkApprove
}) {

  // Score Heatmap Helper
  const getScoreColor = (marks, maxMarks = 10) => {
    if (marks === undefined || marks === null) return 'bg-slate-900 text-slate-500';
    const pct = (marks / maxMarks) * 100;
    if (pct >= 85) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20';
    if (pct >= 70) return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/20';
    if (pct >= 60) return 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20';
    return 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20';
  };

  const handleExportCSV = () => {
    exportPerformanceMatrixCSV(students, questions);
  };

  return (
    <div className="space-y-4">
      {/* Matrix Controls & Filters */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800">
        
        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <span>Filters:</span>
          </div>

          {/* Class Filter */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-slate-900 text-slate-200 text-xs py-1.5 px-3 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="ALL">All Classes</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Section Filter */}
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="bg-slate-900 text-slate-200 text-xs py-1.5 px-3 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="ALL">All Sections</option>
            {sections.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-900 text-slate-200 text-xs py-1.5 px-3 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="OVERRIDDEN">Teacher Overridden</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <button
            onClick={onBulkApprove}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold rounded-lg transition-colors"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Bulk Approve Pending</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold rounded-lg transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>

      </div>

      {/* Interactive Matrix Table Grid */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            
            {/* Table Header */}
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
                <th className="py-3.5 px-4 font-semibold">Student Info</th>
                <th className="py-3.5 px-2 font-semibold">Class / Sec</th>
                {questions.map((q) => (
                  <th key={q.id} className="py-3.5 px-2 text-center font-semibold min-w-[90px]">
                    <div>{q.id}</div>
                    <div className="text-[9px] text-slate-500 capitalize font-normal truncate max-w-[100px]" title={q.title}>
                      {q.title}
                    </div>
                  </th>
                ))}
                <th className="py-3.5 px-3 text-center font-semibold">Total (/50)</th>
                <th className="py-3.5 px-3 text-center font-semibold">% Score</th>
                <th className="py-3.5 px-3 text-center font-semibold">Grade</th>
                <th className="py-3.5 px-3 text-center font-semibold">Status</th>
                <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={questions.length + 6} className="py-12 text-center text-slate-500">
                    No matching student evaluation records found. Try adjusting filters.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr 
                    key={student.id} 
                    className="hover:bg-slate-900/40 transition-colors group"
                  >
                    
                    {/* Student Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={student.avatar} 
                          alt={student.name} 
                          className="w-8 h-8 rounded-full object-cover border border-indigo-500/30"
                        />
                        <div>
                          <div className="font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                            {student.name}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {student.rollNumber}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Class / Sec */}
                    <td className="py-3 px-2 text-slate-400 font-medium">
                      <div>{student.classId}</div>
                      <div className="text-[10px] text-slate-500">{student.section}</div>
                    </td>

                    {/* Question Marks Cells */}
                    {questions.map((q) => {
                      const evalItem = student.evaluations?.[q.id];
                      const marks = evalItem ? evalItem.marks : null;
                      const status = evalItem ? evalItem.status : 'PENDING_REVIEW';
                      
                      return (
                        <td key={q.id} className="py-3 px-2 text-center">
                          <button
                            onClick={() => onOpenEvaluation(student, q)}
                            className={`w-full py-1.5 px-2 rounded-lg border text-xs font-bold font-mono transition-all transform hover:scale-105 ${getScoreColor(marks)}`}
                            title={`Click to inspect OCR & AI Evaluation for ${q.id}`}
                          >
                            <div className="flex items-center justify-center space-x-1">
                              <span>{marks !== null ? marks.toFixed(1) : '-'}</span>
                              {status === 'OVERRIDDEN' && (
                                <Edit3 className="w-2.5 h-2.5 text-amber-400" />
                              )}
                            </div>
                          </button>
                        </td>
                      );
                    })}

                    {/* Grand Total */}
                    <td className="py-3 px-3 text-center font-bold text-slate-100 font-mono">
                      {student.overallMarks.toFixed(1)}
                    </td>

                    {/* Percentage */}
                    <td className="py-3 px-3 text-center font-bold">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] ${
                        student.percentage >= 85 ? 'bg-emerald-500/20 text-emerald-300' :
                        student.percentage >= 70 ? 'bg-indigo-500/20 text-indigo-300' :
                        'bg-amber-500/20 text-amber-300'
                      }`}>
                        {student.percentage.toFixed(1)}%
                      </span>
                    </td>

                    {/* Grade */}
                    <td className="py-3 px-3 text-center font-bold font-mono text-indigo-300">
                      {student.grade}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3 text-center">
                      {student.status === 'APPROVED' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle className="w-3 h-3 mr-1" /> Approved
                        </span>
                      )}
                      {student.status === 'PENDING_REVIEW' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20 animate-pulse">
                          <Clock className="w-3 h-3 mr-1" /> Pending
                        </span>
                      )}
                      {student.status === 'OVERRIDDEN' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          <Edit3 className="w-3 h-3 mr-1" /> Overridden
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => onOpenEvaluation(student, questions[0])}
                          className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-colors"
                          title="Review AI Evaluation"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onOpenPdfReport(student)}
                          className="p-1.5 text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors"
                          title="Generate Student PDF Marksheet"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
