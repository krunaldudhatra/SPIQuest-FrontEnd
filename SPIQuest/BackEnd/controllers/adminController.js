// controllers/adminController.js
import Branch from '../models/Branch.js';
import SubjectData from '../models/SubjectData.js';

// Create a new branch
// Create a branch with semesters and subjects
export const createBranch = async (req, res) => {
  try {
    let { branchName, semesters } = req.body;

    // 🔁 If semesters is a number, auto-generate that many empty semesters
    if (typeof semesters === 'number') {
      semesters = Array.from({ length: semesters }, (_, i) => ({
        semesterNo: i + 1,
        subjects: []
      }));
    }

    // ✅ Validate subjectIds if semesters were passed manually
    if (Array.isArray(semesters)) {
      for (const sem of semesters) {
        for (const id of sem.subjects) {
          const subject = await SubjectData.findById(id);
          if (!subject) {
            return res.status(400).json({ message: `Subject with ID ${id} not found` });
          }
        }
      }
    } else {
      return res.status(400).json({ message: 'Invalid semesters format' });
    }

    const newBranch = new Branch({
      branchName,
      semesters
    });

    await newBranch.save();

    const populated = await Branch.findById(newBranch._id).populate('semesters.subjects');

    res.status(201).json({
      message: 'Branch with semesters created successfully',
      branch: populated
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a branch
export const updateBranch = async (req, res) => {
  try {
    const { id } = req.params;
    let { branchName, semesters } = req.body;

    const branch = await Branch.findById(id);
    if (!branch) return res.status(404).json({ message: 'Branch not found' });

    // 🛠️ If semesters is a number, generate semester stubs (with existing subjects if present)
    if (typeof semesters === 'number') {
      const generatedSemesters = [];
      for (let i = 1; i <= semesters; i++) {
        // Try to find existing semester
        const existing = branch.semesters.find(s => s.semesterNo === i);
        generatedSemesters.push({
          semesterNo: i,
          subjects: existing ? existing.subjects : []
        });
      }
      semesters = generatedSemesters;
    }

    // ✅ Validate each subject ID (only if semesters is an array)
    for (const sem of semesters) {
      for (const subjectId of sem.subjects || []) {
        const exists = await SubjectData.findById(subjectId);
        if (!exists) {
          return res.status(400).json({ message: `Invalid subject ID: ${subjectId}` });
        }
      }
    }

    // ✅ Update branch name
    branch.branchName = branchName || branch.branchName;

    // 🧠 Merge semesters
    const updatedSemesters = semesters.map(newSem => {
      const existing = branch.semesters.find(s => s.semesterNo === newSem.semesterNo);
      return {
        semesterNo: newSem.semesterNo,
        subjects: newSem.subjects.length > 0
          ? newSem.subjects
          : (existing ? existing.subjects : [])
      };
    });

    branch.semesters = updatedSemesters;

    await branch.save();

    const updated = await Branch.findById(id).populate('semesters.subjects');

    res.status(200).json({
      message: 'Branch with semesters updated successfully',
      branch: updated
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// Delete a branch
export const deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;
    await Branch.findByIdAndDelete(id);
    res.json({ message: 'Branch deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Create or reuse a subject
export const createSubject = async (req, res) => {
  try {
    const { subjectCode, subjectName, subjectCredit, totalMarks, termWorkMark, sessionalMark, externalMark, attendance } = req.body;

    let subject = await SubjectData.findOne({ subjectCode });
    if (!subject) {
      subject = new SubjectData({ subjectCode, subjectName, subjectCredit, totalMarks, termWorkMark, sessionalMark, externalMark, attendance });
      await subject.save();
    }

    res.status(201).json(subject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET all subjects
export const getAllSubjects = async (req, res) => {
  try {
    const subjects = await SubjectData.find();
    res.status(200).json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAssignedSubjects = async (req, res) => {
  try {
    const { branch_id, semester_no } = req.params;

    const branch = await Branch.findById(branch_id).populate('semesters.subjects');
    if (!branch) return res.status(404).json({ message: 'Branch not found' });

    const semester = branch.semesters.find(s => s.semesterNo === Number(semester_no));
    if (!semester) return res.status(404).json({ message: 'Semester not found' });

    res.status(200).json({
      semesterNo: semester.semesterNo,
      subjects: semester.subjects
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const assignSubjectsToSemester = async (req, res) => {
  try {
    const { branch_id, semester_no } = req.params;
    const { subjectIds } = req.body;

    const branch = await Branch.findById(branch_id);
    if (!branch) return res.status(404).json({ message: 'Branch not found' });

    // Find or add the semester
    let semester = branch.semesters.find(s => s.semesterNo === Number(semester_no));

    if (semester) {
      semester.subjects = subjectIds;
    } else {
      branch.semesters.push({
        semesterNo: Number(semester_no),
        subjects: subjectIds
      });
    }

    await branch.save();

    // 🔥 Re-fetch the updated branch and populate nested subjects
    const updatedBranch = await Branch.findById(branch._id).populate('semesters.subjects');

    res.status(200).json({
      message: 'Subjects assigned to semester successfully',
      branch: updatedBranch
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Update subject
export const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await SubjectData.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Subject not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete subject
export const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    await SubjectData.findByIdAndDelete(id);
    res.json({ message: 'Subject deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
