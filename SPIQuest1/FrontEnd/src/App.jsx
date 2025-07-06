import { useState } from "react"
import Calculator from './components/calculator'
import About from "./components/about"
import { ToastContainer } from "./components/toast"
import "./index.css"

export default function App() {
  const [activeTab, setActiveTab] = useState("calculator")

  return (
    <div className="app-container">
      <ToastContainer position="top-right" />

      <header>
        <h1>College GPA Calculator</h1>
        <p>Calculate your Semester Performance Index (SPI) and Cumulative Performance Index (CPI)</p>
      </header>

      <nav>
        <ul>
          <li>
            <button className={activeTab === "calculator" ? "active" : ""} onClick={() => setActiveTab("calculator")}>
              Calculator
            </button>
          </li>
          <li>
            <button className={activeTab === "about" ? "active" : ""} onClick={() => setActiveTab("about")}>
              About
            </button>
          </li>
        </ul>
      </nav>

      <main>{activeTab === "calculator" ? <Calculator /> : <About />}</main>

      <footer>
        <p>© Dharmsinh Desai University ( FoT ) , GPA Calculator.</p>
        <p>Team QueryNest - Trupal Godhat , Krunal Dudhatra</p>
      </footer>
    </div>
  )
}


