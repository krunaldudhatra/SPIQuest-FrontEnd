"use client"

import { useState, useEffect } from "react"
import { FaEdit, FaTrash, FaChevronDown, FaChevronUp, FaArrowLeft } from "react-icons/fa"
import { showToast } from "./toast"

const BASE_URL = "https://backend-spiquest-1.onrender.com"

export default function SpiCalculator() {
  const [branches, setBranches] = useState([])
  const [selectedBranch, setSelectedBranch] = useState(null)
  const [selectedSemester, setSelectedSemester] = useState(null)
  const [subjects, setSubjects] = useState([])
  const [subjectMarks, setSubjectMarks] = useState({})
  const [courseResults, setCourseResults] = useState([])
  const [spi, setSpi] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [editingSubjectCode, setEditingSubjectCode] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [loading, setLoading] = useState(false)
  const [semesters, setSemesters] = useState([])

  // Fetch branches from API
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${BASE_URL}/api/branches`)
        if (!response.ok) {
          throw new Error("Failed to fetch branches")
        }
        const data = await response.json()
        setBranches(data)
      } catch (error) {
        showToast(error.message, "error")
      } finally {
        setLoading(false)
      }
    }

    fetchBranches()
  }, [])

  // Handle branch selection
  const handleBranchChange = async (e) => {
    const branchId = e.target.value
    if (!branchId) {
      setSelectedBranch(null)
      setSemesters([])
      return
    }

    try {
      setLoading(true)
      // Fetch semester data for the selected branch
      const response = await fetch(`${BASE_URL}/api/branch/${branchId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch semester data")
      }

      const semesterData = await response.json()
      setSemesters(semesterData)

      // Find the branch object
      const selectedBranchObj = branches.find((branch) => branch._id === branchId)
      setSelectedBranch(selectedBranchObj)
    } catch (error) {
      showToast(error.message, "error")
    } finally {
      setLoading(false)
    }

    setSelectedSemester(null)
    setSubjects([])
    setSubjectMarks({})
    setCourseResults([])
    setSpi(null)
  }

  // Handle semester selection
  const handleSemesterChange = async (e) => {
    const semNo = Number.parseInt(e.target.value)
    if (!semNo) {
      setSelectedSemester(null)
      setSubjects([])
      setSubjectMarks({})
      return
    }

    setSelectedSemester(semNo)

    if (selectedBranch) {
      try {
        setLoading(true)
        // Fetch subjects for the selected branch and semester
        const response = await fetch(`${BASE_URL}/api/branch/${selectedBranch._id}/semester/${semNo}`)

        if (!response.ok) {
          throw new Error("Failed to fetch subjects")
        }

        const subjectsData = await response.json()

        // Map API response to our expected format
        const formattedSubjects = subjectsData.map((subject) => ({
          subjectCode: subject.subjectCode,
          subjectName: subject.subjectName,
          subjectCredit: subject.subjectCredit,
          totalMarks: subject.totalMarks,
          total_sessionalMarks: subject.sessionalMark || 0,
          total_termworkMarks: subject.termWorkMark || 0,
          total_externamMarks: subject.externalMark || 0,
          attendance: subject.attendance || 0,
        }))

        setSubjects(formattedSubjects)

        // Initialize subject marks
        const initialMarks = {}
        formattedSubjects.forEach((subject) => {
          initialMarks[subject.subjectCode] = {
            sessionalMarks: "",
            attendanceMarks: "",
            termworkMarks: "",
            externalMarks: "",
          }
        })
        setSubjectMarks(initialMarks)

        // Clear any previous results
        setCourseResults([])
        setSpi(null)
      } catch (error) {
        showToast(error.message, "error")
      } finally {
        setLoading(false)
      }
    }
  }

  // Handle input change for subject marks
  const handleMarksChange = (subjectCode, field, value) => {
    setSubjectMarks((prev) => ({
      ...prev,
      [subjectCode]: {
        ...prev[subjectCode],
        [field]: value,
      },
    }))
  }

  // Calculate grade and points based on percentage
  const calculateGradeAndPoints = (
    percentage,
    sessionalMarks,
    termworkMarks,
    externalMarks,
    total_sessionalMarks,
    total_termworkMarks,
    total_externamMarks,
  ) => {
    let points = 0
    let grade = ""

    if (84.5 <= percentage && percentage <= 100) {
      points = 10.0
      grade = "AA"
    } else if (74.5 <= percentage && percentage <= 84.49) {
      points = 9.0
      grade = "AB"
    } else if (64.5 <= percentage && percentage <= 74.49) {
      points = 8.0
      grade = "BB"
    } else if (54.5 <= percentage && percentage <= 64.49) {
      points = 7.0
      grade = "BC"
    } else if (44.5 <= percentage && percentage <= 54.49) {
      points = 6.0
      grade = "CC"
    } else if (39.5 <= percentage && percentage <= 44.49) {
      points = 5.0
      grade = "CD"
    } else {
      points = 0
      grade = "FF"
    }

    // Check if external marks are less than 35%
    if (total_externamMarks > 0) {
      if ((externalMarks * 100) / total_externamMarks < 35) {
        points = 0
        grade = "FF"
      }
    }

    // Check if termwork marks are less than 35%
    if (total_termworkMarks > 0) {
      if ((termworkMarks * 100) / total_termworkMarks < 35) {
        points = 0
        grade = "FF"
      }
    }

    // Check if sessional marks are less than required
    if (total_sessionalMarks > 0) {
      if (sessionalMarks < 8) {
        points = 0
        grade = "FF"
      }
    }

    return { points, grade }
  }

  // Validate marks for a subject
  const validateSubjectMarks = (subject, marks) => {
    const { total_sessionalMarks, total_termworkMarks, total_externamMarks } = subject

    const { sessionalMarks, attendanceMarks, termworkMarks, externalMarks } = marks

    // Validate inputs based on what components are available
    if (total_sessionalMarks > 0) {
      if (sessionalMarks === "" || attendanceMarks === "") {
        return { valid: false, message: `Please enter sessional and attendance marks for ${subject.subjectName}` }
      }

      const sessional = Number(sessionalMarks)
      const attendance = Number(attendanceMarks)

      if (sessional > total_sessionalMarks - subject.attendance) {
        return {
          valid: false,
          message: `Sessional marks cannot exceed ${total_sessionalMarks - subject.attendance} for ${subject.subjectName}`,
        }
      }

      if (attendance > subject.attendance) {
        return {
          valid: false,
          message: `Attendance marks cannot exceed ${subject.attendance} for ${subject.subjectName}`,
        }
      }
    }

    if (total_termworkMarks > 0) {
      if (termworkMarks === "") {
        return { valid: false, message: `Please enter termwork marks for ${subject.subjectName}` }
      }

      const termwork = Number(termworkMarks)

      if (termwork > total_termworkMarks) {
        return {
          valid: false,
          message: `Termwork marks cannot exceed ${total_termworkMarks} for ${subject.subjectName}`,
        }
      }
    }

    if (total_externamMarks > 0) {
      if (externalMarks === "") {
        return { valid: false, message: `Please enter external marks for ${subject.subjectName}` }
      }

      const external = Number(externalMarks)

      if (external > total_externamMarks) {
        return {
          valid: false,
          message: `External marks cannot exceed ${total_externamMarks} for ${subject.subjectName}`,
        }
      }
    }

    return { valid: true }
  }

  // Calculate SPI for all subjects
  const calculateAllSPI = () => {
    const results = []
    let hasErrors = false

    // Validate and process each subject
    for (const subject of subjects) {
      const marks = subjectMarks[subject.subjectCode]

      // Validate marks
      const validation = validateSubjectMarks(subject, marks)
      if (!validation.valid) {
        showToast(validation.message, "warning")
        hasErrors = true
        break
      }

      // Convert inputs to numbers
      const sessional = subject.total_sessionalMarks > 0 ? Number(marks.sessionalMarks) : 0
      const attendance = subject.total_sessionalMarks > 0 ? Number(marks.attendanceMarks) : 0
      const termwork = subject.total_termworkMarks > 0 ? Number(marks.termworkMarks) : 0
      const external = subject.total_externamMarks > 0 ? Number(marks.externalMarks) : 0

      // Calculate total marks
      const totalObtained = sessional + attendance + termwork + external
      const totalPossible = subject.total_sessionalMarks + subject.total_termworkMarks + subject.total_externamMarks

      // Calculate percentage
      const percentage = (totalObtained * 100) / totalPossible

      // Calculate grade and points
      const { grade, points } = calculateGradeAndPoints(
        percentage,
        sessional,
        termwork,
        external,
        subject.total_sessionalMarks,
        subject.total_termworkMarks,
        subject.total_externamMarks,
      )

      // Create result object
      const result = {
        id: Date.now() + Math.random(), // Unique ID
        subjectCode: subject.subjectCode,
        subjectName: subject.subjectName,
        credit: subject.subjectCredit,
        sessionalMarks: sessional,
        attendanceMarks: attendance,
        termworkMarks: termwork,
        externalMarks: external,
        total_sessionalMarks: subject.total_sessionalMarks,
        total_termworkMarks: subject.total_termworkMarks,
        total_externamMarks: subject.total_externamMarks,
        totalMarks: totalPossible,
        totalObtained: totalObtained,
        percentage: percentage,
        grade: grade,
        points: points,
      }

      results.push(result)
    }

    if (hasErrors) {
      return
    }

    // Set course results
    setCourseResults(results)

    // Calculate SPI
    let totalCreditPoints = 0
    let totalCredits = 0

    results.forEach((result) => {
      totalCreditPoints += result.points * result.credit
      totalCredits += result.credit
    })

    const calculatedSpi = totalCredits > 0 ? totalCreditPoints / totalCredits : 0
    setSpi(calculatedSpi)

    showToast("SPI calculated successfully!", "success")
  }

  // Edit a subject result
  const editSubjectResult = (subjectCode) => {
    setEditMode(true)
    setEditingSubjectCode(subjectCode)

    // Pre-fill the form with existing data
    const resultToEdit = courseResults.find((result) => result.subjectCode === subjectCode)
    if (resultToEdit) {
      setSubjectMarks((prev) => ({
        ...prev,
        [subjectCode]: {
          sessionalMarks: resultToEdit.sessionalMarks,
          attendanceMarks: resultToEdit.attendanceMarks,
          termworkMarks: resultToEdit.termworkMarks,
          externalMarks: resultToEdit.externalMarks,
        },
      }))
    }
  }

  // Update a subject after editing
  const updateSubject = () => {
    const subject = subjects.find((s) => s.subjectCode === editingSubjectCode)
    const marks = subjectMarks[editingSubjectCode]

    // Validate marks
    const validation = validateSubjectMarks(subject, marks)
    if (!validation.valid) {
      showToast(validation.message, "warning")
      return
    }

    // Convert inputs to numbers
    const sessional = subject.total_sessionalMarks > 0 ? Number(marks.sessionalMarks) : 0
    const attendance = subject.total_sessionalMarks > 0 ? Number(marks.attendanceMarks) : 0
    const termwork = subject.total_termworkMarks > 0 ? Number(marks.termworkMarks) : 0
    const external = subject.total_externamMarks > 0 ? Number(marks.externalMarks) : 0

    // Calculate total marks
    const totalObtained = sessional + attendance + termwork + external
    const totalPossible = subject.total_sessionalMarks + subject.total_termworkMarks + subject.total_externamMarks

    // Calculate percentage
    const percentage = (totalObtained * 100) / totalPossible

    // Calculate grade and points
    const { grade, points } = calculateGradeAndPoints(
      percentage,
      sessional,
      termwork,
      external,
      subject.total_sessionalMarks,
      subject.total_termworkMarks,
      subject.total_externamMarks,
    )

    // Update the course results
    const updatedResults = courseResults.map((result) => {
      if (result.subjectCode === editingSubjectCode) {
        return {
          ...result,
          sessionalMarks: sessional,
          attendanceMarks: attendance,
          termworkMarks: termwork,
          externalMarks: external,
          totalObtained: totalObtained,
          percentage: percentage,
          grade: grade,
          points: points,
        }
      }
      return result
    })

    setCourseResults(updatedResults)

    // Recalculate SPI
    let totalCreditPoints = 0
    let totalCredits = 0

    updatedResults.forEach((result) => {
      totalCreditPoints += result.points * result.credit
      totalCredits += result.credit
    })

    const calculatedSpi = totalCredits > 0 ? totalCreditPoints / totalCredits : 0
    setSpi(calculatedSpi)

    // Exit edit mode
    setEditMode(false)
    setEditingSubjectCode(null)

    showToast("Subject updated successfully", "success")
  }

  // Delete a subject result
  const deleteSubjectResult = (subjectCode) => {
    if (confirm("Are you sure you want to delete this subject?")) {
      const updatedResults = courseResults.filter((result) => result.subjectCode !== subjectCode)
      setCourseResults(updatedResults)

      // Recalculate SPI
      if (updatedResults.length > 0) {
        let totalCreditPoints = 0
        let totalCredits = 0

        updatedResults.forEach((result) => {
          totalCreditPoints += result.points * result.credit
          totalCredits += result.credit
        })

        const calculatedSpi = totalCredits > 0 ? totalCreditPoints / totalCredits : 0
        setSpi(calculatedSpi)
      } else {
        setSpi(null)
      }

      // Reset the marks for this subject
      setSubjectMarks((prev) => ({
        ...prev,
        [subjectCode]: {
          sessionalMarks: "",
          attendanceMarks: "",
          termworkMarks: "",
          externalMarks: "",
        },
      }))

      showToast("Subject deleted successfully", "info")
    }
  }

  // Get SPI color class
  const getSpiColorClass = () => {
    if (!spi) return ""

    if (spi >= 8.5 && spi <= 10) {
      return "green"
    } else if (spi >= 7.5 && spi < 8.49) {
      return "orange"
    } else if (spi >= 6.5 && spi < 7.49) {
      return "tomato"
    } else {
      return "red"
    }
  }

  // Get grade color class
  const getGradeColorClass = (points) => {
    if (points === 10.0 || points === 9.0) {
      return "green"
    } else if (points === 8.0) {
      return "orange"
    } else if (points === 7.0) {
      return "tomato"
    } else {
      return "red"
    }
  }

  // Render subject input form
  const renderSubjectInputForm = (subject) => {
    const marks = subjectMarks[subject.subjectCode]

    return (
      <div className="subject-input-card" key={subject.subjectCode}>
        <h4>{subject.subjectName}</h4>
        <p className="subject-code">
          {subject.subjectCode} • {subject.subjectCredit} Credits
        </p>

        <div className="marks-grid">
          {subject.total_sessionalMarks > 0 && (
            <>
              <div className="input-group compact">
                <label htmlFor={`sessional-${subject.subjectCode}`}>
                  Sessional (/{subject.total_sessionalMarks - subject.attendance})
                </label>
                <input
                  type="number"
                  id={`sessional-${subject.subjectCode}`}
                  value={marks.sessionalMarks}
                  onChange={(e) => handleMarksChange(subject.subjectCode, "sessionalMarks", e.target.value)}
                  min="0"
                  max={subject.total_sessionalMarks - subject.attendance}
                  className="small-input"
                />
              </div>
              <div className="input-group compact">
                <label htmlFor={`attendance-${subject.subjectCode}`}>Attendance (/{subject.attendance})</label>
                <input
                  type="number"
                  id={`attendance-${subject.subjectCode}`}
                  value={marks.attendanceMarks}
                  onChange={(e) => handleMarksChange(subject.subjectCode, "attendanceMarks", e.target.value)}
                  min="0"
                  max={subject.attendance}
                  className="small-input"
                />
              </div>
            </>
          )}

          {subject.total_termworkMarks > 0 && (
            <div className="input-group compact">
              <label htmlFor={`termwork-${subject.subjectCode}`}>Termwork (/{subject.total_termworkMarks})</label>
              <input
                type="number"
                id={`termwork-${subject.subjectCode}`}
                value={marks.termworkMarks}
                onChange={(e) => handleMarksChange(subject.subjectCode, "termworkMarks", e.target.value)}
                min="0"
                max={subject.total_termworkMarks}
                className="small-input"
              />
            </div>
          )}

          {subject.total_externamMarks > 0 && (
            <div className="input-group compact">
              <label htmlFor={`external-${subject.subjectCode}`}>External (/{subject.total_externamMarks})</label>
              <input
                type="number"
                id={`external-${subject.subjectCode}`}
                value={marks.externalMarks}
                onChange={(e) => handleMarksChange(subject.subjectCode, "externalMarks", e.target.value)}
                min="0"
                max={subject.total_externamMarks}
                className="small-input"
              />
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="spi-calculator">
      <h2>Semester Performance Index (SPI) Calculator</h2>

      <div className="selection-container">
        <div className="selection-group">
          <label htmlFor="branch">Select Branch:</label>
          <select
            id="branch"
            value={selectedBranch?._id || ""}
            onChange={handleBranchChange}
            disabled={loading || editMode}
          >
            <option value="">-- Select Branch --</option>
            {branches.map((branch) => (
              <option key={branch._id} value={branch._id}>
                {branch.branchName}
              </option>
            ))}
          </select>
        </div>

        <div className="selection-group">
          <label htmlFor="semester">Select Semester:</label>
          <select
            id="semester"
            value={selectedSemester || ""}
            onChange={handleSemesterChange}
            disabled={!selectedBranch || loading || editMode}
          >
            <option value="">-- Select Semester --</option>
            {semesters.map((semester) => (
              <option key={semester._id} value={semester.semesterNo}>
                Semester {semester.semesterNo}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && <div className="loading-spinner">Loading...</div>}

      {selectedBranch && selectedSemester && !loading && (
        <>
          {editMode ? (
            <div className="edit-mode-container">
              <div className="edit-header">
                <button
                  className="back-button"
                  onClick={() => {
                    setEditMode(false)
                    setEditingSubjectCode(null)
                  }}
                >
                  <FaArrowLeft /> Back to All Subjects
                </button>
                <h3>Edit Subject</h3>
              </div>

              {renderSubjectInputForm(subjects.find((s) => s.subjectCode === editingSubjectCode))}

              <div className="button-group">
                <button className="calculate-button" onClick={updateSubject}>
                  Update Subject
                </button>
                <button
                  className="cancel-button"
                  onClick={() => {
                    setEditMode(false)
                    setEditingSubjectCode(null)
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="all-subjects-container">
                {!courseResults.length > 0 ? (
                  <>
                    <div className="subjects-header">
                      <h3>Enter Marks for All Subjects</h3>
                    </div>

                    <div className="subjects-grid">{subjects.map((subject) => renderSubjectInputForm(subject))}</div>

                    <div className="button-group calculate-all-container">
                      <button style={{textAlign:'center',display:"inline"}} className="calculate-button" onClick={calculateAllSPI}>
                        Calculate SPI
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="recalculate-container">
                    <button className="recalculate-button" onClick={() => setCourseResults([])}>
                      Edit All Subjects
                    </button>
                  </div>
                )}
              </div>

              {courseResults.length > 0 && (
                <div className="results-container">
                  <h3>Subject Results</h3>
                  <div className="semesters-container">
                    <div className="subject-header">
                      <div className="subject-name">Subject</div>
                      <div className="subject-credit">Credits</div>
                      <div className="subject-marks">Marks</div>
                      <div className="subject-grade">Grade</div>
                      <div className="subject-actions">Actions</div>
                    </div>

                    {courseResults.map((result) => (
                      <div className="subject-row" key={result.id}>
                        <div className="subject-name">{result.subjectName}</div>
                        <div className="subject-credit">{result.credit}</div>
                        <div className="subject-marks">
                          {result.totalObtained}/{result.totalMarks}
                        </div>
                        <div className="subject-grade">
                          <span className={`bolder ${getGradeColorClass(result.points)}`}>
                            {result.grade} ({result.points})
                          </span>
                        </div>
                        <div className="subject-actions">
                          <button
                            className="edit-button"
                            onClick={() => editSubjectResult(result.subjectCode)}
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="delete-button"
                            onClick={() => deleteSubjectResult(result.subjectCode)}
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="details-toggle">
                    <button className="toggle-button" onClick={() => setShowDetails(!showDetails)}>
                      {showDetails ? (
                        <>
                          Hide Details <FaChevronUp />
                        </>
                      ) : (
                        <>
                          Show Details <FaChevronDown />
                        </>
                      )}
                    </button>
                  </div>

                  {showDetails && (
                    <div className="subject-details-container">
                      <h4>Detailed Marks</h4>
                      {courseResults.map((result) => (
                        <div className="subject-details" key={`details-${result.id}`}>
                          <h5>
                            {result.subjectName} ({result.subjectCode})
                          </h5>
                          <div className="details-grid">
                            {result.total_sessionalMarks > 0 && (
                              <div className="detail-item">
                                <span className="detail-label">Sessional:</span>
                                <span className="detail-value">
                                  {result.sessionalMarks + result.attendanceMarks}/{result.total_sessionalMarks}
                                </span>
                              </div>
                            )}
                            {result.total_termworkMarks > 0 && (
                              <div className="detail-item">
                                <span className="detail-label">Termwork:</span>
                                <span className="detail-value">
                                  {result.termworkMarks}/{result.total_termworkMarks}
                                </span>
                              </div>
                            )}
                            {result.total_externamMarks > 0 && (
                              <div className="detail-item">
                                <span className="detail-label">External:</span>
                                <span className="detail-value">
                                  {result.externalMarks}/{result.total_externamMarks}
                                </span>
                              </div>
                            )}
                            <div className="detail-item">
                              <span className="detail-label">Total:</span>
                              <span className="detail-value">
                                {result.totalObtained}/{result.totalMarks} ({result.percentage.toFixed(2)}%)
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {spi !== null && (
                    <div className="spi-result-container">
                      <h3>Your Semester Performance Index (SPI)</h3>
                      <div className={`spi-value bolder ${getSpiColorClass()}`} id="spi">
                        {spi.toFixed(2)}
                      </div>
                      <div className="grade-description">
                        {spi >= 8.5
                          ? "Outstanding Performance!"
                          : spi >= 7.5
                            ? "Excellent Performance!"
                            : spi >= 6.5
                              ? "Very Good Performance!"
                              : spi >= 5.5
                                ? "Good Performance!"
                                : spi >= 4.5
                                  ? "Average Performance"
                                  : spi >= 4.0
                                    ? "Below Average"
                                    : "Needs Improvement"}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
