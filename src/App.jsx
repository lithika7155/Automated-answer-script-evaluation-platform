import React, { useState } from 'react';
import Header from './components/Header';
import PerformanceMatrix from './components/PerformanceMatrix';
import AnalyticsView from './components/AnalyticsView';
import GradingWorkbenchModal from './components/GradingWorkbenchModal';
import StudentDashboard from './components/StudentDashboard';
import UploadSimulatorModal from './components/UploadSimulatorModal';
import PDFReportModal from './components/PDFReportModal';
import { 
  INITIAL_CLASSES, 
  INITIAL_SECTIONS, 
  INITIAL_QUESTIONS, 
  INITIAL_STUDENTS, 
  INITIAL_ANALYTICS 
} from './data/mockData';
import { LayoutGrid, BarChart2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  // Global State
  const [activeRole, setActiveRole] = useState('FACULTY'); // 'FACULTY' | 'STUDENT'
  const [activeFacultyTab, setActiveFacultyTab] = useState('MATRIX'); // 'MATRIX' | 'ANALYTICS'

  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [questions, setQuestions] = useState(INITIAL_QUESTIONS);

  // Filters State
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedSection, setSelectedSection] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState(INITIAL_STUDENTS[0].id);

  // Modals State
  const [activeEvalModal, setActiveEvalModal] = useState(null); // { student, question }
  const [activePdfStudent, setActivePdfStudent] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Toast / System Notification State
  const [notification, setNotification] = useState(null);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Filtered Students Array
  const filteredStudents = students.filter(student => {
    if (selectedClass !== 'ALL' && student.classId !== selectedClass) return false;
    if (selectedSection !== 'ALL' && student.section !== selectedSection) return false;
    if (selectedStatus !== 'ALL' && student.status !== selectedStatus) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = student.name.toLowerCase().includes(q);
      const matchRoll = student.rollNumber.toLowerCase().includes(q);
      if (!matchName && !matchRoll) return false;
    }
    return true;
  });

  // Handle Save Manual Grade Override
  const handleSaveGradeOverride = (studentId, questionId, newMarks, overrideNote) => {
    setStudents(prevStudents => {
      return prevStudents.map(student => {
        if (student.id !== studentId) return student;

        const updatedEvals = { ...student.evaluations };
        if (updatedEvals[questionId]) {
          updatedEvals[questionId] = {
            ...updatedEvals[questionId],
            marks: newMarks,
            status: 'OVERRIDDEN',
            teacherOverrideNote: overrideNote
          };
        }

        // Recalculate Grand Total & Percentage
        const totalMarks = Object.values(updatedEvals).reduce((acc, curr) => acc + (curr.marks || 0), 0);
        const percentage = (totalMarks / 50) * 100;
        let grade = 'F';
        if (percentage >= 90) grade = 'A+';
        else if (percentage >= 80) grade = 'A';
        else if (percentage >= 70) grade = 'B+';
        else if (percentage >= 60) grade = 'C+';

        return {
          ...student,
          evaluations: updatedEvals,
          overallMarks: totalMarks,
          percentage: percentage,
          grade: grade,
          status: 'OVERRIDDEN'
        };
      });
    });

    setActiveEvalModal(null);
    showNotification(`Successfully updated grade for ${questionId} to ${newMarks}/10 with justification audit log!`);
  };

  // Bulk Approve Handler
  const handleBulkApprove = () => {
    setStudents(prev => prev.map(s => ({ ...s, status: 'APPROVED' })));
    showNotification('All pending student evaluations have been bulk approved!', 'success');
  };

  // Handle New Batch Upload Simulation
  const handleCompleteBatchUpload = (newStudent) => {
    setStudents(prev => [newStudent, ...prev]);
    setIsUploadModalOpen(false);
    showNotification(`New Answer Script processed for ${newStudent.name}! Added to matrix.`, 'success');
  };

  // Active Student for Student View
  const currentStudentObj = students.find(s => s.id === selectedStudentId) || students[0];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="bg-slate-950 text-slate-100 min-h-screen flex flex-col font-sans">
        
        {/* Top Header */}
        <Header 
          activeRole={activeRole}
          setActiveRole={setActiveRole}
          selectedStudentId={selectedStudentId}
          setSelectedStudentId={setSelectedStudentId}
          students={students}
          selectedClass={selectedClass}
          setSelectedClass={setSelectedClass}
          classes={INITIAL_CLASSES}
          selectedSection={selectedSection}
          setSelectedSection={setSelectedSection}
          sections={INITIAL_SECTIONS}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenUploadModal={() => setIsUploadModalOpen(true)}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
        />

        {/* Global Toast Notification */}
        {notification && (
          <div className="fixed bottom-6 right-6 z-50 animate-bounce">
            <div className={`px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 text-xs font-bold border ${
              notification.type === 'success' 
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50' 
                : 'bg-indigo-950/90 text-indigo-300 border-indigo-500/50'
            }`}>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{notification.msg}</span>
            </div>
          </div>
        )}

        {/* Main Content View Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          
          {/* FACULTY DASHBOARD VIEW */}
          {activeRole === 'FACULTY' && (
            <div className="space-y-6">
              
              {/* Faculty Navigation Tabs */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setActiveFacultyTab('MATRIX')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      activeFacultyTab === 'MATRIX'
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                    <span>Student Performance Matrix</span>
                  </button>

                  <button
                    onClick={() => setActiveFacultyTab('ANALYTICS')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      activeFacultyTab === 'ANALYTICS'
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <BarChart2 className="w-4 h-4" />
                    <span>Analytics & Class Insights</span>
                  </button>
                </div>

                <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-400 font-mono">
                  <span>Evaluating: {filteredStudents.length} Students</span>
                </div>
              </div>

              {/* Tab 1: Performance Matrix */}
              {activeFacultyTab === 'MATRIX' && (
                <PerformanceMatrix 
                  students={filteredStudents}
                  questions={questions}
                  selectedClass={selectedClass}
                  setSelectedClass={setSelectedClass}
                  classes={INITIAL_CLASSES}
                  selectedSection={selectedSection}
                  setSelectedSection={setSelectedSection}
                  sections={INITIAL_SECTIONS}
                  selectedStatus={selectedStatus}
                  setSelectedStatus={setSelectedStatus}
                  onOpenEvaluation={(student, q) => setActiveEvalModal({ student, question: q })}
                  onOpenPdfReport={(student) => setActivePdfStudent(student)}
                  onBulkApprove={handleBulkApprove}
                />
              )}

              {/* Tab 2: Analytics & Insights */}
              {activeFacultyTab === 'ANALYTICS' && (
                <AnalyticsView 
                  analyticsData={INITIAL_ANALYTICS}
                  students={students}
                />
              )}

            </div>
          )}

          {/* STUDENT DASHBOARD VIEW */}
          {activeRole === 'STUDENT' && (
            <StudentDashboard 
              student={currentStudentObj}
              questions={questions}
              onOpenPdfReport={(s) => setActivePdfStudent(s)}
            />
          )}

        </main>

        {/* AI Evaluation Workbench Drawer Modal */}
        {activeEvalModal && (
          <GradingWorkbenchModal 
            student={activeEvalModal.student}
            question={activeEvalModal.question}
            onClose={() => setActiveEvalModal(null)}
            onSaveOverride={handleSaveGradeOverride}
          />
        )}

        {/* Upload & AI Processing Pipeline Modal */}
        {isUploadModalOpen && (
          <UploadSimulatorModal 
            onClose={() => setIsUploadModalOpen(false)}
            onCompleteBatchProcessing={handleCompleteBatchUpload}
          />
        )}

        {/* PDF Marksheet Generator Modal */}
        {activePdfStudent && (
          <PDFReportModal 
            student={activePdfStudent}
            questions={questions}
            onClose={() => setActivePdfStudent(null)}
          />
        )}

      </div>
    </div>
  );
}
