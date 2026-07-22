// Utility to generate and download CSV of Student Performance Matrix

export const exportPerformanceMatrixCSV = (students, questions) => {
  // Construct CSV Header
  const headers = [
    'Student Roll No',
    'Student Name',
    'Class',
    'Section',
    ...questions.map(q => `${q.id} (${q.title}) - Max 10`),
    'Grand Total (/50)',
    'Percentage (%)',
    'Grade',
    'Review Status'
  ];

  // Construct Rows
  const rows = students.map(student => {
    const questionScores = questions.map(q => {
      const evalObj = student.evaluations?.[q.id];
      return evalObj ? evalObj.marks : 'N/A';
    });

    return [
      `"${student.rollNumber}"`,
      `"${student.name}"`,
      `"${student.classId}"`,
      `"${student.section}"`,
      ...questionScores,
      student.overallMarks,
      `${student.percentage}%`,
      `"${student.grade}"`,
      `"${student.status}"`
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Create Blob and Download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `AutoGrade_Performance_Matrix_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
