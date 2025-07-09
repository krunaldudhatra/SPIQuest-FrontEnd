import express from 'express'
import {
  createBranch, updateBranch, deleteBranch,
  createSubject, assignSubjectsToSemester,
  updateSubject, deleteSubject,getAllSubjects,getAssignedSubjects
} from '../controllers/adminController.js'

const router = express.Router()

// Branch routes
router.post('/branches',createBranch)
router.put('/branches/:id', updateBranch)
router.delete('/branches/:id', deleteBranch)

// Subject routes
router.get('/allsubjects', getAllSubjects);
router.post('/subjects', createSubject)
router.put('/subjects/:id', updateSubject)
router.delete('/subjects/:id', deleteSubject)

// Assign subjects to semester
router.post('/branches/:branch_id/semester/:semester_no/assign', assignSubjectsToSemester)
router.get('/branches/:branch_id/semester/:semester_no/assign', getAssignedSubjects);

export default router
