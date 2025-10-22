const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  examTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExamType',
    required: true
  },
  score: {
    type: mongoose.Schema.Types.Mixed, // Can be number or "/" for absent
    required: true
  }
}, {
  timestamps: true
});

// Ensure unique combination - one grade per student/subject/exam
gradeSchema.index({ studentId: 1, subjectId: 1, examTypeId: 1 }, { unique: true });

module.exports = mongoose.model('Grade', gradeSchema);