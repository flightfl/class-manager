import React, { useState } from 'react';
import { Plus, Users } from 'lucide-react';
import { subjectsAPI, studentSubjectsAPI } from '../api';

const SubjectManager = ({ 
  subjects, 
  setSubjects,
  students,
  studentSubjects,
  setStudentSubjects,
  setGrades 
}) => {
  const [subjectName, setSubjectName] = useState('');
  const [viewTab, setViewTab] = useState('active');
  const [managingSubjectId, setManagingSubjectId] = useState(null);
  
  const addSubject = async () => {
    if (!subjectName.trim()) return;
    try {
      const response = await subjectsAPI.create({ name: subjectName, status: 'active' });
      setSubjects([...subjects, response.data]);
      setSubjectName('');
    } catch (err) {
      console.error('Error adding subject:', err);
      alert('Error adding subject');
    }
  };
  
  const toggleSubjectStatus = async (id) => {
    const subject = subjects.find(s => s._id === id);
    const newStatus = subject.status === 'active' ? 'archived' : 'active';
    try {
      await subjectsAPI.update(id, { status: newStatus });
      setSubjects(subjects.map(s => s._id === id ? {...s, status: newStatus} : s));
    } catch (err) {
      console.error('Error updating subject:', err);
    }
  };
  
  const deleteSubject = async (id) => {
    if (!window.confirm('Are you sure? Related grades and enrollments will be deleted.')) return;
    try {
      await subjectsAPI.delete(id);
      setSubjects(subjects.filter(s => s._id !== id));
      setStudentSubjects(studentSubjects.filter(ss => ss.subjectId !== id));
      setGrades(prev => prev.filter(g => g.subjectId !== id));
    } catch (err) {
      console.error('Error deleting subject:', err);
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
  
  const getStudentsForSubject = (subjectId) => {
    return students.filter(student => 
      isStudentInSubject(student._id, subjectId) && student.status === 'active'
    );
  };
  
  return (
    <div>
      {/* Add Subject Form */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-3">Add Subject</h3>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Subject Name (e.g., Math, Physics)"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg"
            onKeyPress={(e) => e.key === 'Enter' && addSubject()}
          />
          <button
            onClick={addSubject}
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
          Active Subjects ({subjects.filter(s => s.status === 'active').length})
        </button>
        <button
          onClick={() => setViewTab('archived')}
          className={`px-4 py-2 rounded-lg ${
            viewTab === 'archived' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Archived Subjects ({subjects.filter(s => s.status === 'archived').length})
        </button>
      </div>
      
      {/* Subject List */}
      <div className="space-y-2">
        {subjects
          .filter(s => viewTab === 'active' ? s.status === 'active' : s.status === 'archived')
          .map(subject => (
            <div key={subject._id} className="bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between p-3">
                <div>
                  <span className="font-medium">{subject.name}</span>
                  <span className="text-sm text-gray-400 ml-3">
                    ({getStudentsForSubject(subject._id).length} students)
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setManagingSubjectId(
                      managingSubjectId === subject._id ? null : subject._id
                    )}
                    className="text-purple-600 hover:text-purple-700 flex items-center gap-1 px-3 py-1 rounded hover:bg-purple-50"
                    title="Manage Students"
                  >
                    <Users size={18} />
                    <span className="text-sm">Manage Students</span>
                  </button>
                  <button
                    onClick={() => toggleSubjectStatus(subject._id)}
                    className="text-blue-600 hover:text-blue-700 flex items-center gap-1 px-3 py-1 rounded hover:bg-blue-50"
                  >
                    <span className="text-sm">
                      {subject.status === 'active' ? 'Archive' : 'Restore'}
                    </span>
                  </button>
                  <button
                    onClick={() => deleteSubject(subject._id)}
                    className="text-red-600 hover:text-red-700 px-2"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              {/* Manage Students Panel */}
              {managingSubjectId === subject._id && (
                <div className="border-t p-4 bg-white">
                  <h4 className="font-semibold mb-3 text-sm">Select students for this subject:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {students.filter(s => s.status === 'active').map(student => (
                      <label 
                        key={student._id} 
                        className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isStudentInSubject(student._id, subject._id)}
                          onChange={() => toggleStudentSubject(student._id, subject._id)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{student.name}</span>
                      </label>
                    ))}
                  </div>
                  {students.filter(s => s.status === 'active').length === 0 && (
                    <p className="text-gray-500 text-sm">
                      No students available. Please add students first.
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        {subjects.filter(s => viewTab === 'active' ? s.status === 'active' : s.status === 'archived').length === 0 && (
          <p className="text-gray-500 text-center py-8">
            {viewTab === 'active' ? 'No active subjects' : 'No archived subjects'}
          </p>
        )}
      </div>
    </div>
  );
};

export default SubjectManager;