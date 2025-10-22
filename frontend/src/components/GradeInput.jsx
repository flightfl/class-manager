import React, { useState, useEffect } from 'react';
import { gradesAPI } from '../api';

const GradeInput = ({ 
  students,
  subjects,
  examTypes,
  semesters,
  studentSubjects,
  grades,
  setGrades,
  fetchAllData
}) => {
  const [selectedSubject, setSelectedSubject] = useState(
    localStorage.getItem('selectedSubject') || ''
  );
  const [selectedExamType, setSelectedExamType] = useState(
    localStorage.getItem('selectedExamType') || ''
  );
  const [gradeInputs, setGradeInputs] = useState({});
  const [batchInput, setBatchInput] = useState('');
  
  // Save selections to localStorage
  useEffect(() => {
    localStorage.setItem('selectedSubject', selectedSubject);
  }, [selectedSubject]);
  
  useEffect(() => {
    localStorage.setItem('selectedExamType', selectedExamType);
  }, [selectedExamType]);
  
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
  
  // Load existing grades when selection changes
  useEffect(() => {
    if (selectedSubject && selectedExamType) {
      const inputs = {};
      const studentsInSubject = getStudentsForSubject(selectedSubject);
      studentsInSubject.forEach(student => {
        const grade = grades.find(
          g => g.studentId === student._id && 
               g.subjectId === selectedSubject && 
               g.examTypeId === selectedExamType
        );
        if (grade) {
          inputs[student._id] = grade.score;
        }
      });
      setGradeInputs(inputs);
    }
  }, [selectedSubject, selectedExamType, students, grades, studentSubjects]);
  
  const updateGradeInput = (studentId, value) => {
    setGradeInputs({...gradeInputs, [studentId]: value});
  };
  
  const saveGrades = async () => {
    if (!selectedSubject || !selectedExamType) {
      alert('Please select subject and exam type');
      return;
    }
    
    try {
      const updates = [];
      Object.entries(gradeInputs).forEach(([studentId, score]) => {
        if (score !== undefined && score !== '') {
          updates.push(
            gradesAPI.upsert({
              studentId,
              subjectId: selectedSubject,
              examTypeId: selectedExamType,
              score
            })
          );
        }
      });
      
      await Promise.all(updates);
      await fetchAllData();
      alert('Grades saved successfully!');
    } catch (err) {
      console.error('Error saving grades:', err);
      alert('Error saving grades');
    }
  };
  
  const batchFillGrades = () => {
    const scores = batchInput.trim().split(/\s+/);
    const newInputs = {...gradeInputs};
    const studentsInSubject = getStudentsForSubject(selectedSubject);
    
    studentsInSubject.forEach((student, index) => {
      if (index < scores.length) {
        newInputs[student._id] = scores[index];
      }
    });
    
    setGradeInputs(newInputs);
    setBatchInput('');
  };
  
  const studentsInSubject = selectedSubject ? getStudentsForSubject(selectedSubject) : [];
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-6">Grade Input</h2>
      
      {/* Selection Section */}
      <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
        <div>
          <label className="block text-sm font-medium mb-2">Select Subject</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="">-- Please Select --</option>
            {subjects.filter(s => s.status === 'active').map(subject => (
              <option key={subject._id} value={subject._id}>
                {subject.name} ({getStudentsForSubject(subject._id).length} students)
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Select Exam Type</label>
          <select
            value={selectedExamType}
            onChange={(e) => setSelectedExamType(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="">-- Please Select --</option>
            {examTypes.filter(e => e.status === 'active').map(examType => {
              const semester = semesters.find(s => s._id === examType.semesterId);
              return (
                <option key={examType._id} value={examType._id}>
                  {semester?.name} - {examType.name}
                </option>
              );
            })}
          </select>
        </div>
      </div>
      
      {/* Grade Input Section */}
      {selectedSubject && selectedExamType ? (
        <>
          {studentsInSubject.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              This subject has no students. Please add students to this subject in "Subjects" settings.
            </div>
          ) : (
            <>
              {/* Individual Input */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Individual Input (Press Enter to jump to next)</h3>
                <div className="space-y-2">
                  {studentsInSubject.map((student, index) => (
                    <div key={student._id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                      <span className="w-32 font-medium">{student.name}</span>
                      <input
                        type="text"
                        placeholder="Enter grade or / (absent)"
                        value={gradeInputs[student._id] || ''}
                        onChange={(e) => updateGradeInput(student._id, e.target.value)}
                        className="flex-1 px-4 py-2 border rounded"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const nextIndex = index + 1;
                            if (nextIndex < studentsInSubject.length) {
                              const inputs = document.querySelectorAll('input[type="text"]');
                              inputs[nextIndex]?.focus();
                            }
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Batch Input */}
              <div className="mb-6 bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Quick Batch Input</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Enter all grades (space-separated), e.g.: 50 70 33 / 22 29
                </p>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="50 70 33 / 22 29"
                    value={batchInput}
                    onChange={(e) => setBatchInput(e.target.value)}
                    className="flex-1 px-4 py-2 border rounded-lg"
                  />
                  <button
                    onClick={batchFillGrades}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Auto Fill
                  </button>
                </div>
              </div>
              
              {/* Save Button */}
              <button
                onClick={saveGrades}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                Save Grades
              </button>
            </>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">
          Please select subject and exam type first
        </div>
      )}
    </div>
  );
};

export default GradeInput;