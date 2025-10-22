import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { examTypesAPI } from '../api';

const ExamTypeManager = ({ 
  examTypes, 
  setExamTypes,
  semesters,
  setGrades 
}) => {
  const [examTypeName, setExamTypeName] = useState('');
  const [selectedSemesterForExam, setSelectedSemesterForExam] = useState('');
  const [viewTab, setViewTab] = useState('active');
  
  const addExamType = async () => {
    if (!examTypeName.trim() || !selectedSemesterForExam) {
      alert('Please enter exam name and select a semester');
      return;
    }
    try {
      const response = await examTypesAPI.create({ 
        name: examTypeName, 
        semesterId: selectedSemesterForExam, 
        status: 'active' 
      });
      setExamTypes([...examTypes, response.data]);
      setExamTypeName('');
    } catch (err) {
      console.error('Error adding exam type:', err);
      alert('Error adding exam type');
    }
  };
  
  const toggleExamTypeStatus = async (id) => {
    const examType = examTypes.find(e => e._id === id);
    const newStatus = examType.status === 'active' ? 'archived' : 'active';
    try {
      await examTypesAPI.update(id, { status: newStatus });
      setExamTypes(examTypes.map(e => e._id === id ? {...e, status: newStatus} : e));
    } catch (err) {
      console.error('Error updating exam type:', err);
    }
  };
  
  const deleteExamType = async (id) => {
    if (!window.confirm('Are you sure? Related grades will be deleted.')) return;
    try {
      await examTypesAPI.delete(id);
      setExamTypes(examTypes.filter(e => e._id !== id));
      setGrades(prev => prev.filter(g => g.examTypeId !== id));
    } catch (err) {
      console.error('Error deleting exam type:', err);
    }
  };
  
  return (
    <div>
      {/* Add Exam Type Form */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-3">Add Exam Type</h3>
        <div className="flex gap-3">
          <select
            value={selectedSemesterForExam}
            onChange={(e) => setSelectedSemesterForExam(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">-- Select Semester --</option>
            {semesters.filter(s => s.status === 'active').map(semester => (
              <option key={semester._id} value={semester._id}>
                {semester.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Exam Name (e.g., Midterm, Final)"
            value={examTypeName}
            onChange={(e) => setExamTypeName(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg"
            onKeyPress={(e) => e.key === 'Enter' && addExamType()}
          />
          <button
            onClick={addExamType}
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
          Active Exams ({examTypes.filter(e => e.status === 'active').length})
        </button>
        <button
          onClick={() => setViewTab('archived')}
          className={`px-4 py-2 rounded-lg ${
            viewTab === 'archived' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Archived Exams ({examTypes.filter(e => e.status === 'archived').length})
        </button>
      </div>
      
      {/* Exam Type List */}
      <div className="space-y-2">
        {examTypes
          .filter(e => viewTab === 'active' ? e.status === 'active' : e.status === 'archived')
          .map(examType => {
            const semester = semesters.find(s => s._id === examType.semesterId);
            return (
              <div key={examType._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium">{examType.name}</span>
                  <span className="text-gray-500 ml-3">({semester?.name || 'Unknown Semester'})</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleExamTypeStatus(examType._id)}
                    className="text-blue-600 hover:text-blue-700 flex items-center gap-1 px-3 py-1 rounded hover:bg-blue-50"
                  >
                    <span className="text-sm">
                      {examType.status === 'active' ? 'Archive' : 'Restore'}
                    </span>
                  </button>
                  <button
                    onClick={() => deleteExamType(examType._id)}
                    className="text-red-600 hover:text-red-700 px-2"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        {examTypes.filter(e => viewTab === 'active' ? e.status === 'active' : e.status === 'archived').length === 0 && (
          <p className="text-gray-500 text-center py-8">
            {viewTab === 'active' ? 'No active exam types' : 'No archived exam types'}
          </p>
        )}
      </div>
    </div>
  );
};

export default ExamTypeManager;