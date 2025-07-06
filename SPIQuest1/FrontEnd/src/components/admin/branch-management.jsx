"use client"

import { useState, useEffect } from "react"
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa"
import { showToast } from "../toast"

const BASE_URL = "https://backend-spiquest-1.onrender.com"

export default function BranchManagement() {
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingBranch, setEditingBranch] = useState(null)
  const [formData, setFormData] = useState({
    branchName: "",
    semesters: "",
  })

  useEffect(() => {
    fetchBranches()
  }, [])

  const fetchBranches = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${BASE_URL}/api/branches`)
      if (!response.ok) throw new Error("Failed to fetch branches")
      const data = await response.json()
      setBranches(data)
    } catch (error) {
      showToast(error.message, "error")
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

    if (!formData.branchName || !formData.semesters) {
      showToast("Please fill in all fields", "warning")
      return
    }

    try {
      setLoading(true)
      const url = editingBranch
        ? `${BASE_URL}/api/admin/branches/${editingBranch._id}`
        : `${BASE_URL}/api/admin/branches`

      const method = editingBranch ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          branchName: formData.branchName,
          semesters: Number.parseInt(formData.semesters),
        }),
      })

      if (!response.ok) throw new Error("Failed to save branch")

      showToast(editingBranch ? "Branch updated successfully!" : "Branch created successfully!", "success")

      resetForm()
      fetchBranches()
    } catch (error) {
      showToast(error.message, "error")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (branch) => {
    setEditingBranch(branch)
    setFormData({
      branchName: branch.branchName,
      semesters: branch.semesters.length.toString(),
    })
    setShowForm(true)
  }

  const handleDelete = async (branchId) => {
    if (!confirm("Are you sure you want to delete this branch?")) return

    try {
      setLoading(true)
      const response = await fetch(`${BASE_URL}/api/admin/branches/${branchId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete branch")

      showToast("Branch deleted successfully!", "success")
      fetchBranches()
    } catch (error) {
      showToast(error.message, "error")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ branchName: "", semesters: "" })
    setEditingBranch(null)
    setShowForm(false)
  }

  return (
    <div className="branch-management">
      <div className="section-header">
        <h3>Branch Management</h3>
        <button className="add-course-button" onClick={() => setShowForm(true)}>
          <FaPlus /> Add Branch
        </button>
      </div>

      {loading && <div className="loading-spinner">Loading...</div>}

      {showForm && (
        <div className="form-container">
          <div className="form-header">
            <h4>{editingBranch ? "Edit Branch" : "Add New Branch"}</h4>
            <button className="cancel-button" onClick={resetForm}>
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="admin-form">
            <div className="input-group">
              <label htmlFor="branchName">Branch Name:</label>
              <input
                type="text"
                id="branchName"
                name="branchName"
                value={formData.branchName}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
            </div>

            <div className="input-group">
              <label htmlFor="semesters">Number of Semesters:</label>
              <input
                type="number"
                id="semesters"
                name="semesters"
                value={formData.semesters}
                onChange={handleInputChange}
                min="1"
                max="12"
                required
                disabled={loading}
              />
            </div>

            <div className="button-group">
              <button type="submit" className="calculate-button" disabled={loading}>
                {loading ? "Saving..." : editingBranch ? "Update" : "Create"}
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
          <div className="semester-header">
            <div className="semester-name">Branch Name</div>
            <div className="semester-credits">Semesters</div>
            <div className="semester-spi">Created</div>
            <div className="semester-actions">Actions</div>
          </div>

          {branches.map((branch) => (
            <div className="semester-row" key={branch._id}>
              <div className="semester-name">{branch.branchName}</div>
              <div className="semester-credits">{branch.semesters.length}</div>
              <div className="semester-spi">{new Date(branch.createdAt).toLocaleDateString()}</div>
              <div className="semester-actions">
                <button className="edit-button" onClick={() => handleEdit(branch)} title="Edit">
                  <FaEdit />
                </button>
                <button className="delete-button" onClick={() => handleDelete(branch._id)} title="Delete">
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
