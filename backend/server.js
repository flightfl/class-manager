const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/grade-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Models
const Student = require('./models/Student');
const Subject = require('./models/Subject');
const Semester = require('./models/Semester');
const ExamType = require('./models/ExamType');
const StudentSubject = require('./models/StudentSubject');
const Grade = require('./models/Grade');

// ============ STUDENTS ROUTES ============
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find().sort({ order: 1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/students', async (req, res) => {
  try {
    const count = await Student.countDocuments();
    const student = new Student({ ...req.body, order: count });
    await student.save();
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/students/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/students/:id', async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    await StudentSubject.deleteMany({ studentId: req.params.id });
    await Grade.deleteMany({ studentId: req.params.id });
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ SUBJECTS ROUTES ============
app.get('/api/subjects', async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/subjects', async (req, res) => {
  try {
    const subject = new Subject(req.body);
    await subject.save();
    res.status(201).json(subject);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/subjects/:id', async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(subject);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/subjects/:id', async (req, res) => {
  try {
    await Subject.findByIdAndDelete(req.params.id);
    await StudentSubject.deleteMany({ subjectId: req.params.id });
    await Grade.deleteMany({ subjectId: req.params.id });
    res.json({ message: 'Subject deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ SEMESTERS ROUTES ============
app.get('/api/semesters', async (req, res) => {
  try {
    const semesters = await Semester.find();
    res.json(semesters);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/semesters', async (req, res) => {
  try {
    const semester = new Semester(req.body);
    await semester.save();
    res.status(201).json(semester);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/semesters/:id', async (req, res) => {
  try {
    const semester = await Semester.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(semester);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/semesters/:id', async (req, res) => {
  try {
    const examTypes = await ExamType.find({ semesterId: req.params.id });
    const examTypeIds = examTypes.map(e => e._id);
    
    await Semester.findByIdAndDelete(req.params.id);
    await ExamType.deleteMany({ semesterId: req.params.id });
    await Grade.deleteMany({ examTypeId: { $in: examTypeIds } });
    
    res.json({ message: 'Semester deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ EXAM TYPES ROUTES ============
app.get('/api/exam-types', async (req, res) => {
  try {
    const examTypes = await ExamType.find();
    res.json(examTypes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/exam-types', async (req, res) => {
  try {
    const examType = new ExamType(req.body);
    await examType.save();
    res.status(201).json(examType);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/exam-types/:id', async (req, res) => {
  try {
    const examType = await ExamType.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(examType);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/exam-types/:id', async (req, res) => {
  try {
    await ExamType.findByIdAndDelete(req.params.id);
    await Grade.deleteMany({ examTypeId: req.params.id });
    res.json({ message: 'Exam type deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ STUDENT-SUBJECT RELATIONS ============
app.get('/api/student-subjects', async (req, res) => {
  try {
    const relations = await StudentSubject.find();
    res.json(relations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/student-subjects', async (req, res) => {
  try {
    const relation = new StudentSubject(req.body);
    await relation.save();
    res.status(201).json(relation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/student-subjects/:id', async (req, res) => {
  try {
    await StudentSubject.findByIdAndDelete(req.params.id);
    res.json({ message: 'Relation deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete by studentId and subjectId
app.delete('/api/student-subjects/by-ids/:studentId/:subjectId', async (req, res) => {
  try {
    await StudentSubject.findOneAndDelete({
      studentId: req.params.studentId,
      subjectId: req.params.subjectId
    });
    res.json({ message: 'Relation deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ GRADES ROUTES ============
app.get('/api/grades', async (req, res) => {
  try {
    const grades = await Grade.find();
    res.json(grades);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/grades', async (req, res) => {
  try {
    const grade = new Grade(req.body);
    await grade.save();
    res.status(201).json(grade);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/grades/:id', async (req, res) => {
  try {
    const grade = await Grade.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(grade);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Upsert grade (update if exists, create if not)
app.post('/api/grades/upsert', async (req, res) => {
  try {
    const { studentId, subjectId, examTypeId, score } = req.body;
    
    const grade = await Grade.findOneAndUpdate(
      { studentId, subjectId, examTypeId },
      { score, updatedAt: new Date() },
      { new: true, upsert: true }
    );
    
    res.json(grade);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/grades/:id', async (req, res) => {
  try {
    await Grade.findByIdAndDelete(req.params.id);
    res.json({ message: 'Grade deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Grade Management API is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});