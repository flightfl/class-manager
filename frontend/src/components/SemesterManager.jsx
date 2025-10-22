import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import ItemList from './ItemList';
import { semestersAPI } from '../api';

const SemesterManager = ({ 
  semesters, 
  setSemesters,
  examTypes,
  setExamTypes,
  setGrades 
}) => {
  const [semesterName, setSemesterName] = useState('');
  const [semesterYear, setSemesterYear] = useState(new Date().getFullYear());
  const [semesterTerm, setSemesterTerm] = useState('Spring');
  const [viewTab, setViewTab] = useState('active');
  
  const addSemester = async () => {
    if (!semesterName.trim()) return;
    try {
      const response = await semestersAPI.create({ 
        name: semesterName, 
        year: semesterYear, 
        term: semesterTerm, 
        status: 'active' 
      });
      setSemesters([...semesters, response.data]);
      setSemesterName('');
    } catch (err) {
      console.error('Error adding semester:', err);
      alert('Error adding semester');
    }
  };
  
  const toggleSemesterStatus = async (id) => {
    const semester = semesters.find(s => s._id === id);
    const newStatus = semester.status === 'active' ? 'archived' : 'active';
    try {
      await semestersAPI.update(id, { status: newStatus });
      setSemesters(semesters.map(s => s._id === id ? {...s, status: newStatus} : s));
    } catch (err) {
      console.error('Error updating semester:', err);
    }
  };
  
  const deleteSemester = async (id) => {
    if (!window.confirm('Are you sure? Related exam types and grades will be deleted.')) return;
    try {
      await semestersAPI.delete(id);
      const removedExamTypes = examTypes.filter(e => e.semesterId === id);
      const removedExamTypeIds = removedExamTypes.map(e => e._id);
      
      setSemesters(semesters.filter(s => s._id !== id));
      setExamTypes(examTypes.filter(e => e.semesterId !== id));
      setGrades(prev => prev.filter(g => !removedExamTypeIds.includes(g.examTypeId)));
    } catch (err) {
      console.error('Error deleting semester:', err);
    }
  };
  
  return (
    <div>
      {/* Add Semester Form */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-3">Add Semester</h3>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Semester Name (e.g., 2024 Spring)"
            value={semesterName}
            onChange={(e) => setSemesterName(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg"
            onKeyPress={(e) => e.key === 'Enter' && addSemester()}
          />
          <input
            type="number"
            placeholder="Year"
            value={semesterYear}
            onChange={(e) => setSemesterYear(parseInt(e.target.value))}
            className="w-24 px-4 py-2 border rounded-lg"
          />
          <select
            value={semesterTerm}
            onChange={(e) => setSemesterTerm(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="Spring">Spring</option>
            <option value="Fall">Fall</option>
          </select>
          <button
            onClick={addSemester}
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
          Active Semesters ({semesters.filter(s => s.status === 'active').length})
        </button>
        <button
          onClick={() => setViewTab('archived')}
          className={`px-4 py-2 rounded-lg ${
            viewTab === 'archived' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Archived Semesters ({semesters.filter(s => s.status === 'archived').length})
        </button>
      </div>
      
      {/* Semester List */}
      <div className="space-y-2">
        <ItemList
          items={semesters}
          viewTab={viewTab}
          onToggleStatus={toggleSemesterStatus}
          onDelete={deleteSemester}
          type="semesters"
        />
      </div>
    </div>
  );
};

export default SemesterManager;