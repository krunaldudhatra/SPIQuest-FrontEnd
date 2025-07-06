"use client"

import { useState } from "react"
import SpiCalculator from "./spi-calculator"
import CpiCalculator from "./cpi-calculator"

export default function Calculator() {
  const [calculatorType, setCalculatorType] = useState("spi")

  return (
    <div className="calculator-container">
      <div className="calculator-tabs">
        <button className={calculatorType === "spi" ? "active" : ""} onClick={() => setCalculatorType("spi")}>
          SPI Calculator
        </button>
        <button className={calculatorType === "cpi" ? "active" : ""} onClick={() => setCalculatorType("cpi")}>
          CPI Calculator
        </button>
      </div>

      <div className="calculator-content">{calculatorType === "spi" ? <SpiCalculator /> : <CpiCalculator />}</div>
    </div>
  )
}
