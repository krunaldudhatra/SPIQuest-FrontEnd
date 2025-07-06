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

  // Auto-select assigned subjects when assignedSubjects changes
  useEffect(() => {
    if (assignedSubjects.length > 0) {
      setSelectedSubjects((prev) => {
        const newSelected = [...prev]
        assignedSubjects.forEach((assignedId) => {
          if (!newSelected.includes(assignedId)) {
            newSelected.push(assignedId)
          }
        })
        return newSelected
      })
    }
  }, [assignedSubjects])

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
    const unassignedSubjects = filteredSubjects.filter((subject) => !assignedSubjects.includes(subject._id))

    if (selectedSubjects.length === filteredSubjects.length) {
      // Keep only assigned subjects when deselecting all
      setSelectedSubjects(assignedSubjects)
    } else {
      // Select all subjects (assigned + unassigned)
      setSelectedSubjects([...assignedSubjects, ...unassignedSubjects.map((subject) => subject._id)])
    }
  }

  const handleAssignSubjects = async () => {
    if (!selectedBranch || !selectedSemester) {
      showToast("Please select branch and semester", "warning")
      return
    }

    // Only assign new subjects (not already assigned ones)
    const newSubjectsToAssign = selectedSubjects.filter((id) => !assignedSubjects.includes(id))

    if (newSubjectsToAssign.length === 0) {
      showToast("No new subjects to assign", "warning")
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
            subjectIds: newSubjectsToAssign,
          }),
        },
      )

      if (!response.ok) throw new Error("Failed to assign subjects")

      showToast("New subjects assigned successfully!", "success")
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

  const getNewSubjectsCount = () => {
    return selectedSubjects.filter((id) => !assignedSubjects.includes(id)).length
  }

  return (
    <div className="assign-subjects">
      <div className="page-header">
        <h2>Assign Subjects to Semester</h2>
        <p>Select subjects to assign to a specific semester</p>
      </div>

      <div className="content-card">
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

            <div className="subjects-section">
              <div className="subjects-header-info">
                <h3>Available Subjects ({filteredSubjects.length})</h3>
                {assignedSubjects.length > 0 && (
                  <div className="info-badge">
                    <FaCheck className="info-icon" />
                    {assignedSubjects.length} Already Assigned
                  </div>
                )}
              </div>

              {filteredSubjects.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📚</div>
                  <h3>No Subjects Available</h3>
                  <p>Please add some subjects first to assign them to this semester.</p>
                </div>
              ) : (
                <div className="subjects-grid">
                  {filteredSubjects.map((subject) => {
                    const isSelected = selectedSubjects.includes(subject._id)
                    const isAssigned = assignedSubjects.includes(subject._id)

                    return (
                      <div
                        key={subject._id}
                        className={`subject-card ${isSelected ? "selected" : ""} ${isAssigned ? "assigned" : ""}`}
                        onClick={() => handleSubjectToggle(subject._id)}
                      >
                        <div className="card-header">
                          <div className="checkbox-wrapper">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSubjectToggle(subject._id)}
                            />
                            <span className="checkmark"></span>
                          </div>

                          {isAssigned && (
                            <div className="assigned-label">
                              <FaCheck className="check-icon" />
                              Already Assigned
                            </div>
                          )}
                        </div>

                        <div className="card-content">
                          <div className="subject-header-info">
                            <h4 className="subject-code">{subject.subjectCode}</h4>
                            <div className="subject-badges">
                              <span className="credit-badge">{subject.subjectCredit} Credits</span>
                              <span className="marks-badge">{subject.totalMarks} Marks</span>
                            </div>
                          </div>

                          <h5 className="subject-name">{subject.subjectName}</h5>

                          <div className="subject-components">
                            {subject.sessionalMark > 0 && (
                              <span className="component sessional">S: {subject.sessionalMark}</span>
                            )}
                            {subject.termWorkMark > 0 && (
                              <span className="component termwork">T: {subject.termWorkMark}</span>
                            )}
                            {subject.externalMark > 0 && (
                              <span className="component external">E: {subject.externalMark}</span>
                            )}
                            {subject.attendance > 0 && (
                              <span className="component attendance">A: {subject.attendance}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {getNewSubjectsCount() > 0 && (
              <div className="assignment-summary">
                <div className="summary-info">
                  <div className="summary-count">{getNewSubjectsCount()}</div>
                  <div className="summary-text">
                    <h4>New Subjects Selected</h4>
                    <p>Ready to assign to Semester {selectedSemester}</p>
                  </div>
                </div>
                <button className="assign-button" onClick={handleAssignSubjects} disabled={loading}>
                  {loading ? "Assigning..." : "Assign Selected Subjects"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
