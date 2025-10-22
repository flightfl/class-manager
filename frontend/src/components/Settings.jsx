import React, { useState, useEffect } from 'react';
import StudentManager from './StudentManager';
import SubjectManager from './SubjectManager';
import SemesterManager from './SemesterManager';
import ExamTypeManager from './ExamTypeManager';

const Settings = ({ 
  students, 
  setStudents,
  subjects,
  setSubjects,
  semesters,
  setSemesters,
  examTypes,
  setExamTypes,
  studentSubjects,
  setStudentSubjects,
  grades,
  setGrades 
}) => {
  const [settingsTab, setSettingsTab] = useState(
    localStorage.getItem('settingsTab') || 'students'
  );
  
  // Save settings tab to localStorage
  useEffect(() => {
    localStorage.setItem('settingsTab', settingsTab);
  }, [settingsTab]);
  
  return (
    <div>
      <div className="bg-white rounded-lg shadow mb-4">
        {/* Settings Navigation */}
        <div className="flex border-b overflow-x-auto">
          <button
            onClick={() => setSettingsTab('students')}
            className={`px-6 py-3 font-medium whitespace-nowrap ${
              settingsTab === 'students' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600'
            }`}
          >
            Students
          </button>
          <button
            onClick={() => setSettingsTab('subjects')}
            className={`px-6 py-3 font-medium whitespace-nowrap ${
              settingsTab === 'subjects' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600'
            }`}
          >
            Subjects
          </button>
          <button
            onClick={() => setSettingsTab('semesters')}
            className={`px-6 py-3 font-medium whitespace-nowrap ${
              settingsTab === 'semesters' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600'
            }`}
          >
            Semesters
          </button>
          <button
            onClick={() => setSettingsTab('examTypes')}
            className={`px-6 py-3 font-medium whitespace-nowrap ${
              settingsTab === 'examTypes' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600'
            }`}
          >
            Exam Types
          </button>
        </div>
        
        {/* Settings Content */}
        <div className="p-6">
          {settingsTab === 'students' && (
            <StudentManager
              students={students}
              setStudents={setStudents}
              subjects={subjects}
              studentSubjects={studentSubjects}
              setStudentSubjects={setStudentSubjects}
              setGrades={setGrades}
            />
          )}
          
          {settingsTab === 'subjects' && (
            <SubjectManager
              subjects={subjects}
              setSubjects={setSubjects}
              students={students}
              studentSubjects={studentSubjects}
              setStudentSubjects={setStudentSubjects}
              setGrades={setGrades}
            />
          )}
          
          {settingsTab === 'semesters' && (
            <SemesterManager
              semesters={semesters}
              setSemesters={setSemesters}
              examTypes={examTypes}
              setExamTypes={setExamTypes}
              setGrades={setGrades}
            />
          )}
          
          {settingsTab === 'examTypes' && (
            <ExamTypeManager
              examTypes={examTypes}
              setExamTypes={setExamTypes}
              semesters={semesters}
              setGrades={setGrades}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;