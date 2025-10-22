const mongoose = require('mongoose');

const studentSubjectSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  }
}, {
  timestamps: true
});

// Ensure unique combination of student and subject
studentSubjectSchema.index({ studentId: 1, subjectId: 1 }, { unique: true });

module.exports = mongoose.model('StudentSubject', studentSubjectSchema);