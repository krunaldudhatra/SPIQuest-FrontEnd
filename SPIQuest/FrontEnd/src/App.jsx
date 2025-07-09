"use client"

import { useState, useEffect } from "react"
import Calculator from "./components/calculator"
import About from "./components/about"
import AdminPanel from "./components/admin-panel"
import AdminLogin from "./components/admin-login"
import { ToastContainer } from "./components/toast"
import { showToast } from "./components/toast"
import "./index.css"

export default function Home() {
  const [activeTab, setActiveTab] = useState("calculator")
  const [isAdmin, setIsAdmin] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)

  // Check admin status on component mount
  useEffect(() => {
    const adminStatus = localStorage.getItem("isAdmin")
    if (adminStatus === "true") {
      setIsAdmin(true)
    }
  }, [])

  const handleAdminLogin = () => {
    setIsAdmin(true)
    localStorage.setItem("isAdmin", "true")
    setShowAdminLogin(false)
    showToast("Admin login successful!", "success")
  }

  const handleAdminLogout = () => {
    setIsAdmin(false)
    localStorage.removeItem("isAdmin")
    setActiveTab("calculator")
    showToast("Admin logged out successfully!", "info")
  }

  const renderContent = () => {
    switch (activeTab) {
      case "calculator":
        return <Calculator />
      case "admin":
        return <AdminPanel />
      case "about":
        return <About />
      default:
        return <Calculator />
    }
  }

  return (
    <div className="app-container">
      <ToastContainer position="top-right" />

      <header>
        <div className="header-content">
          <div>
            <h1>College GPA Calculator</h1>
            <p>Calculate your Semester Performance Index (SPI) and Cumulative Performance Index (CPI)</p>
          </div>
          <div className="admin-controls">
            {isAdmin ? (
              <button className="admin-btn logout-btn" onClick={handleAdminLogout}>
                Logout
              </button>
            ) : (
              <button className="admin-btn login-btn" onClick={() => setShowAdminLogin(true)}>
                Admin Login
              </button>
            )}
          </div>
        </div>
      </header>

      <nav>
        <ul>
          <li>
            <button className={activeTab === "calculator" ? "active" : ""} onClick={() => setActiveTab("calculator")}>
              Calculator
            </button>
          </li>
          {isAdmin && (
            <li>
              <button className={activeTab === "admin" ? "active" : ""} onClick={() => setActiveTab("admin")}>
                Data Management
              </button>
            </li>
          )}
          <li>
            <button className={activeTab === "about" ? "active" : ""} onClick={() => setActiveTab("about")}>
              About
            </button>
          </li>
        </ul>
      </nav>

      <main>{renderContent()}</main>

      <footer>
        <p>© {new Date().getFullYear()} College GPA Calculator. All rights reserved.</p>
      </footer>

      {showAdminLogin && <AdminLogin onLogin={handleAdminLogin} onClose={() => setShowAdminLogin(false)} />}
    </div>
  )
}
