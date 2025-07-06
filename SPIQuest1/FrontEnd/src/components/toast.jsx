"use client"

import { useState, useEffect } from "react"
import { FaTimes, FaCheck, FaExclamationTriangle, FaInfo } from "react-icons/fa"

let toastId = 0

export const showToast = (message, type = "info", duration = 4000) => {
  const event = new CustomEvent("showToast", {
    detail: { id: ++toastId, message, type, duration },
  })
  window.dispatchEvent(event)
}

export function ToastContainer({ position = "top-right" }) {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const handleShowToast = (event) => {
      const { id, message, type, duration } = event.detail
      const newToast = { id, message, type, duration }

      setToasts((prev) => [...prev, newToast])

      // Auto remove toast after duration
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
      }, duration)
    }

    window.addEventListener("showToast", handleShowToast)
    return () => window.removeEventListener("showToast", handleShowToast)
  }, [])

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <FaCheck />
      case "error":
        return <FaTimes />
      case "warning":
        return <FaExclamationTriangle />
      default:
        return <FaInfo />
    }
  }

  const getToastClass = (type) => {
    const baseClass = "toast"
    switch (type) {
      case "success":
        return `${baseClass} toast-success`
      case "error":
        return `${baseClass} toast-error`
      case "warning":
        return `${baseClass} toast-warning`
      default:
        return `${baseClass} toast-info`
    }
  }

  const getPositionClass = () => {
    switch (position) {
      case "top-left":
        return "toast-container-top-left"
      case "top-right":
        return "toast-container-top-right"
      case "bottom-left":
        return "toast-container-bottom-left"
      case "bottom-right":
        return "toast-container-bottom-right"
      default:
        return "toast-container-top-right"
    }
  }

  if (toasts.length === 0) return null

  return (
    <div className={`toast-container ${getPositionClass()}`}>
      {toasts.map((toast) => (
        <div key={toast.id} className={getToastClass(toast.type)}>
          <div className="toast-icon">{getIcon(toast.type)}</div>
          <div className="toast-message">{toast.message}</div>
          <button className="toast-close" onClick={() => removeToast(toast.id)}>
            <FaTimes />
          </button>
        </div>
      ))}
    </div>
  )
}
