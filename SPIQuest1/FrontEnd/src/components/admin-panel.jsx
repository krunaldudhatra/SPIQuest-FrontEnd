"use client"

import { useState } from "react"
import BranchManagement from "./admin/branch-management"
import SubjectManagement from "./admin/subject-management"
import AssignSubjects from "./admin/assign-subjects"

export default function AdminPanel() {
  const [activeSection, setActiveSection] = useState("branches")

  const renderSection = () => {
    switch (activeSection) {
      case "branches":
        return <BranchManagement />
      case "subjects":
        return <SubjectManagement />
      case "assign":
        return <AssignSubjects />
      default:
        return <BranchManagement />
    }
  }

  return (
    <div className="admin-panel">
      <h2>Data Management</h2>

      <div className="admin-tabs">
        <button className={activeSection === "branches" ? "active" : ""} onClick={() => setActiveSection("branches")}>
          Manage Branches
        </button>
        <button className={activeSection === "subjects" ? "active" : ""} onClick={() => setActiveSection("subjects")}>
          Manage Subjects
        </button>
        <button className={activeSection === "assign" ? "active" : ""} onClick={() => setActiveSection("assign")}>
          Assign Subjects
        </button>
      </div>

      <div className="admin-content">{renderSection()}</div>
    </div>
  )
}
