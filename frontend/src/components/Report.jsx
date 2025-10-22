import React, { useState, useEffect } from 'react';
import { Download, Filter } from 'lucide-react';

const Report = ({ 
  students,
  subjects,
  examTypes,
  semesters,
  studentSubjects,
  grades 
}) => {
  const [showFilterPanel, setShowFilterPanel] = useState(
    localStorage.getItem('showFilterPanel') === 'true'
  );
  const [selectedSubjectForReport, setSelectedSubjectForReport] = useState(
    localStorage.getItem('selectedSubjectForReport') || ''
  );
  const [selectedSemestersFilter, setSelectedSemestersFilter] = useState(
    JSON.parse(localStorage.getItem('selectedSemestersFilter') || '[]')
  );
  
  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('showFilterPanel', showFilterPanel);
  }, [showFilterPanel]);
  
  useEffect(() => {
    localStorage.setItem('selectedSubjectForReport', selectedSubjectForReport);
  }, [selectedSubjectForReport]);
  
  useEffect(() => {
    localStorage.setItem('selectedSemestersFilter', JSON.stringify(selectedSemestersFilter));
  }, [selectedSemestersFilter]);
  
  // Initialize filters
  useEffect(() => {
    const activeSemesters = semesters.filter(s => s.status !== 'archived');
    if (selectedSemestersFilter.length === 0 && activeSemesters.length > 0) {
      setSelectedSemestersFilter(activeSemesters.map(s => s._id));
    }
  }, [semesters]);
  
  // Helper functions
  const isStudentInSubject = (studentId, subjectId) => {
    return studentSubjects.some(
      ss => ss.studentId === studentId && ss.subjectId === subjectId
    );
  };
  
  const getStudentsForSubject = (subjectId) => {
    return students.filter(student => 
      isStudentInSubject(student._id, subjectId) && student.status === 'active'
    );
  };
  
  const toggleSemesterFilter = (semesterId) => {
    setSelectedSemestersFilter(prev => 
      prev.includes(semesterId)
        ? prev.filter(id => id !== semesterId)
        : [...prev, semesterId]
    );
  };
  
  const selectAllFilters = () => {
    setSelectedSemestersFilter(semesters.map(s => s._id));
  };
  
  const clearAllFilters = () => {
    setSelectedSemestersFilter([]);
  };
  
  const exportToExcel = () => {
    alert('Excel export feature coming soon!');
  };
  
  // Generate report data
  const filteredExamTypesForReport = examTypes.filter(e => 
    selectedSemestersFilter.includes(e.semesterId) && e.status === 'active'
  );
  
  const generateReportData = () => {
    if (!selectedSubjectForReport) return [];
    
    const studentsInSubject = getStudentsForSubject(selectedSubjectForReport);
    
    return studentsInSubject.map(student => {
      const row = {
        name: student.name,
        grade: student.grade
      };
      
      filteredExamTypesForReport.forEach(examType => {
        const grade = grades.find(
          g => g.studentId === student._id && 
               g.subjectId === selectedSubjectForReport && 
               g.examTypeId === examType._id
        );
        const semester = semesters.find(s => s._id === examType.semesterId);
        const key = `${semester?.name || ''}-${examType.name}`;
        row[key] = grade ? grade.score : '-';
      });
      
      return row;
    });
  };
  
  const reportData = generateReportData();
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Grade Report</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <Filter size={18} /> {showFilterPanel ? 'Hide Filter' : 'Show Filter'}
          </button>
          <button
            onClick={exportToExcel}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            disabled={!selectedSubjectForReport}
          >
            <Download size={18} /> Export Excel
          </button>
        </div>
      </div>
      
      {/* Subject Selection */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <label className="block text-sm font-medium mb-2">Select Subject (Required)</label>
        <select
          value={selectedSubjectForReport}
          onChange={(e) => setSelectedSubjectForReport(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        >
          <option value="">-- Please Select Subject --</option>
          {subjects.filter(s => s.status === 'active').map(subject => (
            <option key={subject._id} value={subject._id}>
              {subject.name} ({getStudentsForSubject(subject._id).length} students)
            </option>
          ))}
        </select>
      </div>
      
      {/* Filter Panel */}
      {showFilterPanel && selectedSubjectForReport && (
        <div className="mb-6 bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Semester Filter</h3>
            <div className="flex gap-2">
              <button
                onClick={selectAllFilters}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Select All
              </button>
              <button
                onClick={clearAllFilters}
                className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Clear All
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            {semesters.map(semester => {
              const examCount = examTypes.filter(
                e => e.semesterId === semester._id && e.status === 'active'
              ).length;
              return (
                <label 
                  key={semester._id} 
                  className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={selectedSemestersFilter.includes(semester._id)}
                    onChange={() => toggleSemesterFilter(semester._id)}
                    className="w-4 h-4"
                  />
                  <span className={semester.status === 'archived' ? 'text-gray-400' : ''}>
                    {semester.name}
                    {semester.status === 'archived' && ' (Archived)'}
                    <span className="text-sm text-gray-500 ml-2">({examCount} exams)</span>
                  </span>
                </label>
              );
            })}
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            Selected: {selectedSemestersFilter.length} semesters, {filteredExamTypesForReport.length} exams total
          </div>
        </div>
      )}
      
      {/* Report Table */}
      {!selectedSubjectForReport ? (
        <div className="text-center py-12 text-gray-500">
          Please select a subject first
        </div>
      ) : getStudentsForSubject(selectedSubjectForReport).length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          This subject has no students. Please add students to this subject in settings.
        </div>
      ) : selectedSemestersFilter.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Please select at least one semester
        </div>
      ) : filteredExamTypesForReport.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Selected semesters have no exam types. Please add exam types in settings.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left font-semibold sticky left-0 bg-gray-100">Name</th>
                <th className="border p-2 text-left font-semibold">Grade</th>
                {filteredExamTypesForReport.map(examType => {
                  const semester = semesters.find(s => s._id === examType.semesterId);
                  return (
                    <th 
                      key={examType._id} 
                      className="border p-2 text-center font-semibold whitespace-nowrap"
                    >
                      {semester?.name}-{examType.name}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {reportData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border p-2 font-medium sticky left-0 bg-white">{row.name}</td>
                  <td className="border p-2">{row.grade}</td>
                  {filteredExamTypesForReport.map(examType => {
                    const semester = semesters.find(s => s._id === examType.semesterId);
                    const key = `${semester?.name || ''}-${examType.name}`;
                    return (
                      <td key={examType._id} className="border p-2 text-center">
                        {row[key]}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Report;