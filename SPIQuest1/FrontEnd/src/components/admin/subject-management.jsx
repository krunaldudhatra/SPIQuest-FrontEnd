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
      <div className="page-header">
        <h2>Subject Management</h2>
        <p>Create, edit, and manage subjects</p>
      </div>

      <div className="content-card">
        <div className="section-header">
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
          <button className="add-button" onClick={() => setShowForm(true)}>
            <FaPlus /> Add Subject
          </button>
        </div>

        {loading && <div className="loading-spinner">Loading...</div>}

        {showForm && (
          <div className="form-modal">
            <div className="form-container">
              <div className="form-header">
                <h3>{editingSubject ? "Edit Subject" : "Add New Subject"}</h3>
                <button className="close-button" onClick={resetForm}>
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="subject-form">
                <div className="form-grid">
                  <div className="input-group">
                    <label htmlFor="subjectCode">Subject Code *</label>
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
                    <label htmlFor="subjectName">Subject Name *</label>
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
                    <label htmlFor="subjectCredit">Credits *</label>
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
                    <label htmlFor="totalMarks">Total Marks *</label>
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
                    <label htmlFor="sessionalMark">Sessional Marks</label>
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
                    <label htmlFor="termWorkMark">Term Work Marks</label>
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
                    <label htmlFor="externalMark">External Marks</label>
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
                    <label htmlFor="attendance">Attendance Marks</label>
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

                <div className="form-actions">
                  <button type="submit" className="submit-button" disabled={loading}>
                    {loading ? "Saving..." : editingSubject ? "Update Subject" : "Create Subject"}
                  </button>
                  <button type="button" className="cancel-button" onClick={resetForm} disabled={loading}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="subjects-table">
          <div className="table-header">
            <div className="header-cell subject-info">Subject Details</div>
            <div className="header-cell">Credits</div>
            <div className="header-cell">Total Marks</div>
            <div className="header-cell components-header">Components (S/T/E/A)</div>
            <div className="header-cell">Actions</div>
          </div>

          {filteredSubjects.length === 0 && !loading ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h3>No Subjects Found</h3>
              <p>{searchTerm ? "Try adjusting your search." : "Add some subjects to get started."}</p>
            </div>
          ) : (
            filteredSubjects.map((subject) => (
              <div className="table-row" key={subject._id}>
                <div className="table-cell subject-info">
                  <div className="subject-code">{subject.subjectCode}</div>
                  <div className="subject-name">{subject.subjectName}</div>
                </div>
                <div className="table-cell">{subject.subjectCredit}</div>
                <div className="table-cell">{subject.totalMarks}</div>
                <div className="table-cell components-cell">
                  <div className="components-row">
                    {subject.sessionalMark > 0 && (
                      <span className="component-tag sessional">S: {subject.sessionalMark}</span>
                    )}
                    {subject.termWorkMark > 0 && (
                      <span className="component-tag termwork">T: {subject.termWorkMark}</span>
                    )}
                    {subject.externalMark > 0 && (
                      <span className="component-tag external">E: {subject.externalMark}</span>
                    )}
                    {subject.attendance > 0 && (
                      <span className="component-tag attendance">A: {subject.attendance}</span>
                    )}
                  </div>
                </div>
                <div className="table-cell actions-cell">
                  <button className="action-button edit" onClick={() => handleEdit(subject)} title="Edit">
                    <FaEdit />
                  </button>
                  <button className="action-button delete" onClick={() => handleDelete(subject._id)} title="Delete">
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
