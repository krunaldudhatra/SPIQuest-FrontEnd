import mongoose from 'mongoose';

const branchSchema = new mongoose.Schema({
  branchName: { type: String, required: true },
  semesters: [
    {
      semesterNo: { type: Number, required: true },
      subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubjectData' }]
    }
  ]
}, { timestamps: true });

export default mongoose.model('Branch', branchSchema);
