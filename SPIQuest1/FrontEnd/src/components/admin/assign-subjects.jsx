"use client"

import { useState, useEffect } from "react"
import { FaSearch, FaCheck } from "react-icons/fa"
import { showToast } from "../toast"

const BASE_URL = "https://backend-spiquest-1.onrender.com"

export default function AssignSubjects() {
  const [branches, setBranches] = useState([])
  const [subjects, setSubjects] = useState([])
  const [filteredSubjects, setFilteredSubjects] = useState([])
  const [selectedBranch, setSelectedBranch] = useState("")
  const [selectedSemester, setSelectedSemester] = useState("")
  const [selectedSubjects, setSelectedSubjects] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [assignedSubjects, setAssignedSubjects] = useState([])

  useEffect(() => {
    fetchBranches()
    fetchAllSubjects()
  }, [])

  useEffect(() => {
    const filtered = subjects.filter(
      (subject) =>
        (subject.subjectCode && subject.subjectCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (subject.subjectName && subject.subjectName.toLowerCase().includes(searchTerm.toLowerCase())),
    )
    setFilteredSubjects(filtered)
  }, [subjects, searchTerm])

  useEffect(() => {
    if (selectedBranch && selectedSemester) {
      fetchAssignedSubjects()
    }
  }, [selectedBranch, selectedSemester])

  const fetchBranches = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/branches`)
      if (!response.ok) throw new Error("Failed to fetch branches")
      const data = await response.json()
      setBranches(data)
    } catch (error) {
      showToast(error.message, "error")
    }
  }

  const fetchAllSubjects = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/allsubjects`)
      if (!response.ok) throw new Error("Failed to fetch subjects")
      const data = await response.json()

      // Ensure all subjects have required properties
      const safeSubjects = data.map((subject) => ({
        _id: subject._id,
        subjectCode: subject.subjectCode || "",
        subjectName: subject.subjectName || "",
        subjectCredit: subject.subjectCredit || 0,
        totalMarks: subject.totalMarks || 0,
        termWorkMark: subject.termWorkMark || 0,
        sessionalMark: subject.sessionalMark || 0,
        externalMark: subject.externalMark || 0,
        attendance: subject.attendance || 0,
      }))

      setSubjects(safeSubjects)
    } catch (error) {
      showToast(error.message, "error")
      setSubjects([])
    }
  }

  const fetchAssignedSubjects = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/admin/branches/${selectedBranch}/semester/${selectedSemester}/assign`,
      )
      if (!response.ok) throw new Error("Failed to fetch assigned subjects")
      const data = await response.json()

      // Extract subject IDs from the response
      if (data.subjects && Array.isArray(data.subjects)) {
        setAssignedSubjects(data.subjects.map((subject) => subject._id))
      } else {
        setAssignedSubjects([])
      }
    } catch (error) {
      setAssignedSubjects([])
      console.log(error)
    }
  }

  const handleBranchChange = (e) => {
    setSelectedBranch(e.target.value)
    setSelectedSemester("")
    setSelectedSubjects([])
    setAssignedSubjects([])
  }

  const handleSemesterChange = (e) => {
    setSelectedSemester(e.target.value)
    setSelectedSubjects([])
  }

  const handleSubjectToggle = (subjectId) => {
    setSelectedSubjects((prev) => {
      if (prev.includes(subjectId)) {
        return prev.filter((id) => id !== subjectId)
      } else {
        return [...prev, subjectId]
      }
    })
  }

  const handleSelectAll = () => {
    if (selectedSubjects.length === filteredSubjects.length) {
      setSelectedSubjects([])
    } else {
      setSelectedSubjects(filteredSubjects.map((subject) => subject._id))
    }
  }

  const handleAssignSubjects = async () => {
    if (!selectedBranch || !selectedSemester) {
      showToast("Please select branch and semester", "warning")
      return
    }

    if (selectedSubjects.length === 0) {
      showToast("Please select at least one subject", "warning")
      return
    }

    try {
      setLoading(true)
      const response = await fetch(
        `${BASE_URL}/api/admin/branches/${selectedBranch}/semester/${selectedSemester}/assign`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subjectIds: selectedSubjects,
          }),
        },
      )

      if (!response.ok) throw new Error("Failed to assign subjects")

      showToast("Subjects assigned successfully!", "success")
      setSelectedSubjects([])
      fetchAssignedSubjects()
    } catch (error) {
      showToast(error.message, "error")
    } finally {
      setLoading(false)
    }
  }

  const getSelectedBranchSemesters = () => {
    const branch = branches.find((b) => b._id === selectedBranch)
    return branch ? branch.semesters : []
  }

  return (
    <div className="assign-subjects">
      <div className="section-header">
        <h3>Assign Subjects to Semester</h3>
      </div>

      <div className="selection-container">
        <div className="selection-group">
          <label htmlFor="branch-select">Select Branch:</label>
          <select id="branch-select" value={selectedBranch} onChange={handleBranchChange} disabled={loading}>
            <option value="">-- Select Branch --</option>
            {branches.map((branch) => (
              <option key={branch._id} value={branch._id}>
                {branch.branchName}
              </option>
            ))}
          </select>
        </div>

        <div className="selection-group">
          <label htmlFor="semester-select">Select Semester:</label>
          <select
            id="semester-select"
            value={selectedSemester}
            onChange={handleSemesterChange}
            disabled={!selectedBranch || loading}
          >
            <option value="">-- Select Semester --</option>
            {getSelectedBranchSemesters().map((semester) => (
              <option key={semester._id} value={semester.semesterNo}>
                Semester {semester.semesterNo}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedBranch && selectedSemester && (
        <>
          <div className="search-container">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search subjects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="select-all-container">
              <button className="toggle-button" onClick={handleSelectAll}>
                {selectedSubjects.length === filteredSubjects.length ? "Deselect All" : "Select All"}
              </button>
            </div>
          </div>

          <div className="subjects-selection">
            <h4>Available Subjects ({filteredSubjects.length})</h4>

            {assignedSubjects.length > 0 && (
              <div className="assigned-subjects-info">
                <p className="info-text">
                  📌 Currently assigned: {assignedSubjects.length} subject(s) to this semester
                </p>
              </div>
            )}

            <div className="subjects-grid">
              {filteredSubjects.length === 0 ? (
                <div className="no-data-message">
                  <p>No subjects available. Please add some subjects first.</p>
                </div>
              ) : (
                filteredSubjects.map((subject) => {
                  const isSelected = selectedSubjects.includes(subject._id)
                  const isAssigned = assignedSubjects.includes(subject._id)

                  return (
                    <div
                      key={subject._id}
                      className={`subject-card ${isSelected ? "selected" : ""} ${isAssigned ? "assigned" : ""}`}
                      onClick={() => handleSubjectToggle(subject._id)}
                    >
                      <div className="subject-checkbox">
                        <input type="checkbox" checked={isSelected} onChange={() => handleSubjectToggle(subject._id)} />
                        {isAssigned && <FaCheck className="assigned-icon" />}
                      </div>
                      <div className="subject-details">
                        <h5>{subject.subjectCode}</h5>
                        <p>{subject.subjectName}</p>
                        <small>
                          {subject.subjectCredit} Credits • {subject.totalMarks} Marks
                        </small>
                        {isAssigned && <span className="assigned-badge">Already Assigned</span>}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {selectedSubjects.length > 0 && (
            <div className="assignment-summary">
              <p>Selected {selectedSubjects.length} subject(s) for assignment</p>
              <button className="calculate-button" onClick={handleAssignSubjects} disabled={loading}>
                {loading ? "Assigning..." : "Assign Selected Subjects"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
