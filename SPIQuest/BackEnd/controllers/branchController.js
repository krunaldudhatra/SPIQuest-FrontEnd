import Branch from '../models/Branch.js';
import SubjectData from '../models/SubjectData.js';
import mongoose from 'mongoose';


export const getAllBranches = async (req, res) => {
  try {
    const branches = await Branch.find();
    res.json(branches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// GET semesters (with subject details) for a branch
export const getSemesterData = async (req, res) => {
  try {
    const { branch_id } = req.params;

    const branch = await Branch.findById(branch_id).lean();

    if (!branch) return res.status(404).json({ message: 'Branch not found' });

    // Populate subjects manually for each semester
    const semestersWithSubjects = await Promise.all(
      branch.semesters.map(async (semester) => {
        const subjects = await SubjectData.find({ _id: { $in: semester.subjects } });
        return {
          semesterNo: semester.semesterNo,
          _id: semester._id,
          subjects,
        };
      })
    );

    res.json(semestersWithSubjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET subject data for a specific branch and semester
export const getSubjectData = async (req, res) => {
  try {
    const { branch_id, semester_no } = req.params;

    // Use aggregation to match the specific semester and populate subjects
    const branchWithSubjects = await Branch.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(branch_id) } },
      { $unwind: "$semesters" },
      { $match: { "semesters.semesterNo": Number(semester_no) } },
      {
        $lookup: {
          from: "subjectdatas", // ⚠️ Collection name in lowercase plural
          localField: "semesters.subjects",
          foreignField: "_id",
          as: "semesters.subjectsDetails"
        }
      },
      {
        $project: {
          _id: 0,
          semesterNo: "$semesters.semesterNo",
          subjects: "$semesters.subjectsDetails"
        }
      }
    ]);

    if (!branchWithSubjects.length) {
      return res.status(404).json({ message: 'Semester not found' });
    }

    res.json(branchWithSubjects[0].subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
