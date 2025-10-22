import React, { useState } from 'react';
import { Plus, BookOpen } from 'lucide-react';
import ItemList from './ItemList';
import { studentsAPI, studentSubjectsAPI } from '../api';

const StudentManager = ({ 
  students, 
  setStudents, 
  subjects,
  studentSubjects,
  setStudentSubjects,
  setGrades 
}) => {
  const [studentName, setStudentName] = useState('');
  const [studentGrade, setStudentGrade] = useState('Grade 10');
  const [viewTab, setViewTab] = useState('active');
  const [managingStudentId, setManagingStudentId] = useState(null);
  
  const addStudent = async () => {
    if (!studentName.trim()) return;
    try {
      const response = await studentsAPI.create({ 
        name: studentName, 
        grade: studentGrade, 
        status: 'active' 
      });
      setStudents([...students, response.data]);
      setStudentName('');
    } catch (err) {
      console.error('Error adding student:', err);
      alert('Error adding student');
    }
  };
  
  const toggleStudentStatus = async (id) => {
    const student = students.find(s => s._id === id);
    const newStatus = student.status === 'active' ? 'archived' : 'active';
    try {
      await studentsAPI.update(id, { status: newStatus });
      setStudents(students.map(s => s._id === id ? {...s, status: newStatus} : s));
    } catch (err) {
      console.error('Error updating student:', err);
    }
  };
  
  const deleteStudent = async (id) => {
    if (!window.confirm('Are you sure? Related grades and enrollments will be deleted.')) return;
    try {
      await studentsAPI.delete(id);
      setStudents(students.filter(s => s._id !== id));
      setStudentSubjects(studentSubjects.filter(ss => ss.studentId !== id));
      setGrades(prev => prev.filter(g => g.studentId !== id));
    } catch (err) {
      console.error('Error deleting student:', err);
    }
  };
  
  const toggleStudentSubject = async (studentId, subjectId) => {
    const existing = studentSubjects.find(
      ss => ss.studentId === studentId && ss.subjectId === subjectId
    );
    
    try {
      if (existing) {
        await studentSubjectsAPI.deleteByIds(studentId, subjectId);
        setStudentSubjects(studentSubjects.filter(ss => ss._id !== existing._id));
      } else {
        const response = await studentSubjectsAPI.create({ studentId, subjectId });
        setStudentSubjects([...studentSubjects, response.data]);
      }
    } catch (err) {
      console.error('Error toggling student-subject:', err);
    }
  };
  
  const isStudentInSubject = (studentId, subjectId) => {
    return studentSubjects.some(
      ss => ss.studentId === studentId && ss.subjectId === subjectId
    );
  };
  
  const getSubjectsForStudent = (studentId) => {
    return subjects.filter(subject => 
      isStudentInSubject(studentId, subject._id)
    );
  };
  
  return (
    <div>
      {/* Add Student Form */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-3">Add Student</h3>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Student Name"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg"
            onKeyPress={(e) => e.key === 'Enter' && addStudent()}
          />
          <select
            value={studentGrade}
            onChange={(e) => setStudentGrade(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option>Grade 10</option>
            <option>Grade 11</option>
            <option>Grade 12</option>
          </select>
          <button
            onClick={addStudent}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={18} /> Add
          </button>
        </div>
      </div>
      
      {/* View Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setViewTab('active')}
          className={`px-4 py-2 rounded-lg ${
            viewTab === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Active Students ({students.filter(s => s.status === 'active').length})
        </button>
        <button
          onClick={() => setViewTab('archived')}
          className={`px-4 py-2 rounded-lg ${
            viewTab === 'archived' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Archived Students ({students.filter(s => s.status === 'archived').length})
        </button>
      </div>
      
      {/* Student List */}
      <div className="space-y-2">
        {students
          .filter(s => viewTab === 'active' ? s.status === 'active' : s.status === 'archived')
          .map(student => (
            <div key={student._id} className="bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between p-3">
                <div>
                  <span className="font-medium">{student.name}</span>
                  <span className="text-gray-500 ml-3">{student.grade}</span>
                  <span className="text-sm text-gray-400 ml-3">
                    ({getSubjectsForStudent(student._id).length} subjects)
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setManagingStudentId(
                      managingStudentId === student._id ? null : student._id
                    )}
                    className="text-purple-600 hover:text-purple-700 flex items-center gap-1 px-3 py-1 rounded hover:bg-purple-50"
                    title="Manage Subjects"
                  >
                    <BookOpen size={18} />
                    <span className="text-sm">Manage Subjects</span>
                  </button>
                  <button
                    onClick={() => toggleStudentStatus(student._id)}
                    className="text-blue-600 hover:text-blue-700 flex items-center gap-1 px-3 py-1 rounded hover:bg-blue-50"
                  >
                    <span className="text-sm">
                      {student.status === 'active' ? 'Archive' : 'Restore'}
                    </span>
                  </button>
                  <button
                    onClick={() => deleteStudent(student._id)}
                    className="text-red-600 hover:text-red-700 px-2"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              {/* Manage Subjects Panel */}
              {managingStudentId === student._id && (
                <div className="border-t p-4 bg-white">
                  <h4 className="font-semibold mb-3 text-sm">Select subjects for this student:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {subjects.filter(s => s.status === 'active').map(subject => (
                      <label 
                        key={subject._id} 
                        className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isStudentInSubject(student._id, subject._id)}
                          onChange={() => toggleStudentSubject(student._id, subject._id)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{subject.name}</span>
                      </label>
                    ))}
                  </div>
                  {subjects.filter(s => s.status === 'active').length === 0 && (
                    <p className="text-gray-500 text-sm">
                      No subjects available. Please add subjects first.
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        {students.filter(s => viewTab === 'active' ? s.status === 'active' : s.status === 'archived').length === 0 && (
          <p className="text-gray-500 text-center py-8">
            {viewTab === 'active' ? 'No active students' : 'No archived students'}
          </p>
        )}
      </div>
    </div>
  );
};

export default StudentManager;