import mongoose from 'mongoose';

const subjectDataSchema = new mongoose.Schema({
  subjectCode: { type: String, required: true, unique: true },
  subjectName: { type: String, required: true },
  subjectCredit: { type: Number, required: true },
  totalMarks: { type: Number, default: null },
  termWorkMark: { type: Number, default: null },
  sessionalMark: { type: Number, default: null },
  externalMark: { type: Number, default: null },
  attendance: { type: Number, default: null }
}, { timestamps: true });

export default mongoose.model('SubjectData', subjectDataSchema);
