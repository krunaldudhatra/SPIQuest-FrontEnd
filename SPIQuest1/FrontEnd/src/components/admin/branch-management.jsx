"use client"

import { useState, useEffect } from "react"
import { FaEdit, FaTrash, FaPlus, FaSearch } from "react-icons/fa"
import { showToast } from "../toast"

const BASE_URL = "https://backend-spiquest-1.onrender.com"

export default function BranchManagement() {
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingBranch, setEditingBranch] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    branchName: "",
    semesters: "",
  })

  const filteredBranches = branches.filter((branch) =>
    branch.branchName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
      <div className="page-header">
        <h2>Branch Management</h2>
        <p>Create, edit, and manage academic branches</p>
      </div>

      <div className="content-card">
        <div className="section-header">
          <div className="search-container">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search branches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <button className="add-button" onClick={() => setShowForm(true)}>
            <FaPlus /> Add Branch
          </button>
        </div>

        {loading && <div className="loading-spinner">Loading...</div>}

        {showForm && (
          <div className="form-modal">
            <div className="form-container">
              <div className="form-header">
                <h3>{editingBranch ? "Edit Branch" : "Add New Branch"}</h3>
                <button className="close-button" onClick={resetForm}>
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="branch-form">
                <div className="form-grid">
                  <div className="input-group">
                    <label htmlFor="branchName">Branch Name *</label>
                    <input
                      type="text"
                      id="branchName"
                      name="branchName"
                      value={formData.branchName}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                      placeholder="e.g., Computer Science"
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="semesters">Number of Semesters *</label>
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
                      placeholder="e.g., 8"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="submit-button" disabled={loading}>
                    {loading ? "Saving..." : editingBranch ? "Update Branch" : "Create Branch"}
                  </button>
                  <button type="button" className="cancel-button" onClick={resetForm} disabled={loading}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="branches-table">
          <div className="table-header">
            <div className="header-cell">Branch Name</div>
            <div className="header-cell">Semesters</div>
            <div className="header-cell">Created Date</div>
            <div className="header-cell">Actions</div>
          </div>

          {filteredBranches.length === 0 && !loading ? (
            <div className="empty-state">
              <div className="empty-icon">🏫</div>
              <h3>No Branches Found</h3>
              <p>{searchTerm ? "Try adjusting your search." : "Add some branches to get started."}</p>
            </div>
          ) : (
            filteredBranches.map((branch) => (
              <div className="table-row" key={branch._id}>
                <div className="table-cell">
                  <div className="branch-name">{branch.branchName}</div>
                </div>
                <div className="table-cell">{branch.semesters.length}</div>
                <div className="table-cell">{new Date(branch.createdAt).toLocaleDateString()}</div>
                <div className="table-cell actions-cell">
                  <button className="action-button edit" onClick={() => handleEdit(branch)} title="Edit">
                    <FaEdit />
                  </button>
                  <button className="action-button delete" onClick={() => handleDelete(branch._id)} title="Delete">
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
