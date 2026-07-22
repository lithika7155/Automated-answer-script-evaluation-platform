import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { BarChart3, PieChart as PieIcon, Award, Cpu, Sparkles, TrendingUp } from 'lucide-react';

export default function AnalyticsView({ analyticsData, students }) {
  const { questionStats, sectionPerformance, gradeDistribution } = analyticsData;

  // Custom Tooltip for Charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs">
          <p className="font-bold text-slate-200 mb-1">{label || payload[0].name}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color || '#6366f1' }} className="font-semibold">
              {entry.name}: {entry.value} {entry.unit || ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Stat Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">Class Average Score</div>
            <div className="text-2xl font-extrabold text-white">41.8 <span className="text-xs text-slate-400 font-normal">/ 50</span></div>
            <div className="text-[10px] text-emerald-400 font-medium">+4.2% vs previous term</div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">TrOCR OCR Accuracy</div>
            <div className="text-2xl font-extrabold text-white">97.8%</div>
            <div className="text-[10px] text-slate-400">Handwriting Confidence</div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">SBERT Similarity Avg</div>
            <div className="text-2xl font-extrabold text-white">0.89</div>
            <div className="text-[10px] text-cyan-400">Semantic Alignment</div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">Pass Rate (&gt; 60%)</div>
            <div className="text-2xl font-extrabold text-white">100%</div>
            <div className="text-[10px] text-emerald-400">0 Failing Scripts</div>
          </div>
        </div>

      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Average Marks per Question */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-slate-100 text-sm">Average Marks Per Question (Max 10)</h3>
            </div>
            <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
              Target: 8.0
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={questionStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="questionId" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 10]} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="avgMarks" name="Avg Score" radius={[6, 6, 0, 0]}>
                  {questionStats.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.avgMarks >= 8.5 ? '#10b981' : entry.avgMarks >= 7.5 ? '#6366f1' : '#f59e0b'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Grade Distribution Breakdown */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <PieIcon className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-slate-100 text-sm">Grade Distribution Breakdown</h3>
            </div>
            <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
              Total: {students.length} Students
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gradeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="range"
                >
                  {gradeDistribution.map((entry, index) => (
                    <Cell key={`pie-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Section-Wise Comparison Matrix Table */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800">
        <h3 className="font-bold text-slate-100 text-sm mb-3">Section-Wise Performance Comparison</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sectionPerformance.map((sec, idx) => (
            <div key={idx} className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 text-xs">{sec.section}</span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono">
                  {sec.totalStudents} Students
                </span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-extrabold text-white">{sec.avgPercentage}%</span>
                <span className="text-xs text-slate-400">Class Average</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full" 
                  style={{ width: `${sec.avgPercentage}%` }}
                ></div>
              </div>
              <div className="text-[10px] text-slate-400 pt-1">
                {sec.flagCount > 0 ? (
                  <span className="text-amber-400">⚠️ {sec.flagCount} scripts flagged for review</span>
                ) : (
                  <span className="text-emerald-400">✓ All scripts verified</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
