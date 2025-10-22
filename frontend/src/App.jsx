import React, { useState, useEffect } from 'react';
import Settings from './components/Settings';
import GradeInput from './components/GradeInput';
import Report from './components/Report';
import { 
  studentsAPI, 
  subjectsAPI, 
  semestersAPI, 
  examTypesAPI, 
  studentSubjectsAPI, 
  gradesAPI 
} from './api';

const App = () => {
  const [activeTab, setActiveTab] = useState(localStorage.getItem('activeTab') || 'settings');
  const [loading, setLoading] = useState(false);
  
  // All data states
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [examTypes, setExamTypes] = useState([]);
  const [studentSubjects, setStudentSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  
  // Fetch all data on mount
  useEffect(() => {
    fetchAllData();
  }, []);
  
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [studentsRes, subjectsRes, semestersRes, examTypesRes, relationsRes, gradesRes] = 
        await Promise.all([
          studentsAPI.getAll(),
          subjectsAPI.getAll(),
          semestersAPI.getAll(),
          examTypesAPI.getAll(),
          studentSubjectsAPI.getAll(),
          gradesAPI.getAll()
        ]);
      
      setStudents(studentsRes.data);
      setSubjects(subjectsRes.data);
      setSemesters(semestersRes.data);
      setExamTypes(examTypesRes.data);
      setStudentSubjects(relationsRes.data);
      setGrades(gradesRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      alert('Error connecting to server. Make sure the backend is running on port 5000.');
    }
    setLoading(false);
  };
  
  // Save active tab to localStorage
  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 mb-4">Loading...</div>
          <p className="text-gray-600">Connecting to database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-lg">
        <h1 className="text-2xl font-bold">Student Grade Management System</h1>
        <p className="text-blue-100 text-sm">High School Teacher Edition - With Semesters, Enrollment & Archiving</p>
      </div>
      
      {/* Navigation */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'settings' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Settings
            </button>
            <button
              onClick={() => setActiveTab('input')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'input' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Grade Input
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'report' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Grade Report
            </button>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {activeTab === 'settings' && (
          <Settings
            students={students}
            setStudents={setStudents}
            subjects={subjects}
            setSubjects={setSubjects}
            semesters={semesters}
            setSemesters={setSemesters}
            examTypes={examTypes}
            setExamTypes={setExamTypes}
            studentSubjects={studentSubjects}
            setStudentSubjects={setStudentSubjects}
            grades={grades}
            setGrades={setGrades}
          />
        )}
        
        {activeTab === 'input' && (
          <GradeInput
            students={students}
            subjects={subjects}
            examTypes={examTypes}
            semesters={semesters}
            studentSubjects={studentSubjects}
            grades={grades}
            setGrades={setGrades}
            fetchAllData={fetchAllData}
          />
        )}
        
        {activeTab === 'report' && (
          <Report
            students={students}
            subjects={subjects}
            examTypes={examTypes}
            semesters={semesters}
            studentSubjects={studentSubjects}
            grades={grades}
          />
        )}
      </div>
    </div>
  );
};

export default App;