"use client"

import { useState, useEffect } from "react"
import { FaEdit, FaTrash, FaPlus, FaSearch } from "react-icons/fa"
import { showToast } from "../toast"

const BASE_URL = "https://backend-spiquest-1.onrender.com"

export default function SubjectManagement() {
  const [subjects, setSubjects] = useState([])
  const [filteredSubjects, setFilteredSubjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingSubject, setEditingSubject] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    subjectCode: "",
    subjectName: "",
    subjectCredit: "",
    totalMarks: "",
    termWorkMark: "",
    sessionalMark: "",
    externalMark: "",
    attendance: "",
  })

  useEffect(() => {
    fetchSubjects()
  }, [])

  useEffect(() => {
    const filtered = subjects.filter(
      (subject) =>
        (subject.subjectCode && subject.subjectCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (subject.subjectName && subject.subjectName.toLowerCase().includes(searchTerm.toLowerCase())),
    )
    setFilteredSubjects(filtered)
  }, [subjects, searchTerm])

  const fetchSubjects = async () => {
    try {
      setLoading(true)
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
        createdAt: subject.createdAt,
        updatedAt: subject.updatedAt,
      }))

      setSubjects(safeSubjects)
    } catch (error) {
      showToast(error.message, "error")
      setSubjects([])
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const requiredFields = ["subjectCode", "subjectName", "subjectCredit", "totalMarks"]
    const missingFields = requiredFields.filter((field) => !formData[field])

    if (missingFields.length > 0) {
      showToast("Please fill in all required fields", "warning")
      return
    }

    try {
      setLoading(true)
      const url = editingSubject
        ? `${BASE_URL}/api/admin/subjects/${editingSubject._id}`
        : `${BASE_URL}/api/admin/subjects`

      const method = editingSubject ? "PUT" : "POST"

      const payload = {
        subjectCode: formData.subjectCode,
        subjectName: formData.subjectName,
        subjectCredit: Number.parseInt(formData.subjectCredit),
        totalMarks: Number.parseInt(formData.totalMarks),
        termWorkMark: Number.parseInt(formData.termWorkMark) || 0,
        sessionalMark: Number.parseInt(formData.sessionalMark) || 0,
        externalMark: Number.parseInt(formData.externalMark) || 0,
        attendance: Number.parseInt(formData.attendance) || 0,
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error("Failed to save subject")

      showToast(editingSubject ? "Subject updated successfully!" : "Subject created successfully!", "success")

      resetForm()
      fetchSubjects()
    } catch (error) {
      showToast(error.message, "error")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (subject) => {
    setEditingSubject(subject)
    setFormData({
      subjectCode: subject.subjectCode,
      subjectName: subject.subjectName,
      subjectCredit: subject.subjectCredit.toString(),
      totalMarks: subject.totalMarks.toString(),
      termWorkMark: subject.termWorkMark?.toString() || "",
      sessionalMark: subject.sessionalMark?.toString() || "",
      externalMark: subject.externalMark?.toString() || "",
      attendance: subject.attendance?.toString() || "",
    })
    setShowForm(true)
  }

  const handleDelete = async (subjectId) => {
    if (!confirm("Are you sure you want to delete this subject?")) return

    try {
      setLoading(true)
      const response = await fetch(`${BASE_URL}/api/admin/subjects/${subjectId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete subject")

      showToast("Subject deleted successfully!", "success")
      fetchSubjects()
    } catch (error) {
      showToast(error.message, "error")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      subjectCode: "",
      subjectName: "",
      subjectCredit: "",
      totalMarks: "",
      termWorkMark: "",
      sessionalMark: "",
      externalMark: "",
      attendance: "",
    })
    setEditingSubject(null)
    setShowForm(false)
  }

  return (
    <div className="subject-management">
      <div className="section-header">
        <h3>Subject Management</h3>
        <button className="add-course-button" onClick={() => setShowForm(true)}>
          <FaPlus /> Add Subject
        </button>
      </div>

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
      </div>

      {loading && <div className="loading-spinner">Loading...</div>}

      {showForm && (
        <div className="form-container">
          <div className="form-header">
            <h4>{editingSubject ? "Edit Subject" : "Add New Subject"}</h4>
            <button className="cancel-button" onClick={resetForm}>
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-grid">
              <div className="input-group">
                <label htmlFor="subjectCode">Subject Code *:</label>
                <input
                  type="text"
                  id="subjectCode"
                  name="subjectCode"
                  value={formData.subjectCode}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="input-group">
                <label htmlFor="subjectName">Subject Name *:</label>
                <input
                  type="text"
                  id="subjectName"
                  name="subjectName"
                  value={formData.subjectName}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="input-group">
                <label htmlFor="subjectCredit">Credits *:</label>
                <input
                  type="number"
                  id="subjectCredit"
                  name="subjectCredit"
                  value={formData.subjectCredit}
                  onChange={handleInputChange}
                  min="1"
                  required
                  disabled={loading}
                />
              </div>

              <div className="input-group">
                <label htmlFor="totalMarks">Total Marks *:</label>
                <input
                  type="number"
                  id="totalMarks"
                  name="totalMarks"
                  value={formData.totalMarks}
                  onChange={handleInputChange}
                  min="1"
                  required
                  disabled={loading}
                />
              </div>

              <div className="input-group">
                <label htmlFor="termWorkMark">Term Work Marks:</label>
                <input
                  type="number"
                  id="termWorkMark"
                  name="termWorkMark"
                  value={formData.termWorkMark}
                  onChange={handleInputChange}
                  min="0"
                  disabled={loading}
                />
              </div>

              <div className="input-group">
                <label htmlFor="sessionalMark">Sessional Marks:</label>
                <input
                  type="number"
                  id="sessionalMark"
                  name="sessionalMark"
                  value={formData.sessionalMark}
                  onChange={handleInputChange}
                  min="0"
                  disabled={loading}
                />
              </div>

              <div className="input-group">
                <label htmlFor="externalMark">External Marks:</label>
                <input
                  type="number"
                  id="externalMark"
                  name="externalMark"
                  value={formData.externalMark}
                  onChange={handleInputChange}
                  min="0"
                  disabled={loading}
                />
              </div>

              <div className="input-group">
                <label htmlFor="attendance">Attendance Marks:</label>
                <input
                  type="number"
                  id="attendance"
                  name="attendance"
                  value={formData.attendance}
                  onChange={handleInputChange}
                  min="0"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="button-group">
              <button type="submit" className="calculate-button" disabled={loading}>
                {loading ? "Saving..." : editingSubject ? "Update" : "Create"}
              </button>
              <button type="button" className="cancel-button" onClick={resetForm} disabled={loading}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="results-container">
        <div className="semesters-container">
          <div className="subject-header">
            <div className="subject-name">Subject</div>
            <div className="subject-credit">Credits</div>
            <div className="subject-marks">Total Marks</div>
            <div className="subject-grade">Components</div>
            <div className="subject-actions">Actions</div>
          </div>

          {filteredSubjects.length === 0 && !loading ? (
            <div className="no-data-message">
              <p>
                No subjects found. {searchTerm ? "Try adjusting your search." : "Add some subjects to get started."}
              </p>
            </div>
          ) : (
            filteredSubjects.map((subject) => (
              <div className="subject-row" key={subject._id}>
                <div className="subject-name">
                  <strong>{subject.subjectCode}</strong>
                  <br />
                  <small>{subject.subjectName}</small>
                </div>
                <div className="subject-credit">{subject.subjectCredit}</div>
                <div className="subject-marks">{subject.totalMarks}</div>
                <div className="subject-grade">
                  <small>
                    {subject.sessionalMark ? `S:${subject.sessionalMark} ` : ""}
                    {subject.termWorkMark ? `T:${subject.termWorkMark} ` : ""}
                    {subject.externalMark ? `E:${subject.externalMark} ` : ""}
                    {subject.attendance ? `A:${subject.attendance}` : ""}
                  </small>
                </div>
                <div className="subject-actions">
                  <button className="edit-button" onClick={() => handleEdit(subject)} title="Edit">
                    <FaEdit />
                  </button>
                  <button className="delete-button" onClick={() => handleDelete(subject._id)} title="Delete">
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
