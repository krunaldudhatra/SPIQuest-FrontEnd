"use client";

import { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { showToast } from "./toast";

const BASE_URL = "https://backend-spiquest-1.onrender.com";

export default function CpiCalculator() {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [semesterResults, setSemesterResults] = useState([]);
  const [cpi, setCpi] = useState(null);
  const [currentSemester, setCurrentSemester] = useState(null);
  const [spiValue, setSpiValue] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editingResultId, setEditingResultId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [semesters, setSemesters] = useState([]);
  const [currentSemesterIndex, setCurrentSemesterIndex] = useState(0);
  const [showInputForm, setShowInputForm] = useState(true);

  // Fetch branches from API
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}/api/branches`);
        if (!response.ok) {
          throw new Error("Failed to fetch branches");
        }
        const data = await response.json();
        setBranches(data);
      } catch (error) {
        showToast(error.message, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, []);

  // Handle branch selection
  const handleBranchChange = async (e) => {
    const branchId = e.target.value;
    if (!branchId) {
      setSelectedBranch(null);
      setSemesters([]);
      return;
    }

    try {
      setLoading(true);
      // Fetch semester data for the selected branch
      const response = await fetch(`${BASE_URL}/api/branch/${branchId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch semester data");
      }

      const semesterData = await response.json();

      // Calculate total credits for each semester
      const semestersWithCredits = await Promise.all(
        semesterData.map(async (semester) => {
          // Calculate total credits by summing all subject credits
          const totalCredits = semester.subjects.reduce(
            (sum, subject) => sum + subject.subjectCredit,
            0
          );

          return {
            ...semester,
            semesterCredit: totalCredits,
          };
        })
      );

      setSemesters(semestersWithCredits);

      // Find the branch object
      const selectedBranchObj = branches.find(
        (branch) => branch._id === branchId
      );
      setSelectedBranch(selectedBranchObj);

      // Reset to first semester
      setCurrentSemesterIndex(0);
      if (semestersWithCredits.length > 0) {
        setCurrentSemester(semestersWithCredits[0]);
      }
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }

    setSemesterResults([]);
    setCpi(null);
    setSpiValue("");
    setEditMode(false);
    setEditingResultId(null);
    setShowInputForm(true);
  };

  // Navigate to next semester and save current semester data
  const goToNextSemester = () => {
    // First save the current semester data
    if (spiValue && !isSemesterAdded(currentSemester?.semesterNo)) {
      saveSemesterData();
    }

    // Then navigate to next semester
    if (currentSemesterIndex < semesters.length - 1) {
      const nextIndex = currentSemesterIndex + 1;
      setCurrentSemesterIndex(nextIndex);
      setCurrentSemester(semesters[nextIndex]);
      setSpiValue("");
    } else if (semesterResults.length > 0) {
      // If we're at the last semester and have results, calculate CPI
      calculateCpi();
    }
  };

  // Navigate to previous semester
  const goToPrevSemester = () => {
    if (currentSemesterIndex > 0) {
      const prevIndex = currentSemesterIndex - 1;
      setCurrentSemesterIndex(prevIndex);
      setCurrentSemester(semesters[prevIndex]);

      // Pre-fill with existing data if available
      const existingResult = semesterResults.find(
        (result) => result.semNo === semesters[prevIndex].semesterNo
      );

      if (existingResult) {
        setSpiValue(existingResult.spi);
      } else {
        setSpiValue("");
      }
    }
  };

  // Check if semester is already added
  const isSemesterAdded = (semNo) => {
    return semesterResults.some((result) => result.semNo === semNo);
  };

  // Save current semester data
  const saveSemesterData = () => {
    if (!currentSemester) {
      return false;
    }

    if (spiValue === "") {
      showToast("Please enter SPI value", "warning");
      return false;
    }

    const spi = Number.parseFloat(spiValue.toString());

    if (isNaN(spi) || spi < 0 || spi > 10) {
      showToast("SPI must be between 0 and 10", "error");
      return false;
    }

    // Check if semester already exists
    if (isSemesterAdded(currentSemester.semesterNo)) {
      return true; // Already added, so consider it a success
    }

    // Create new semester result
    const newSemesterResult = {
      id: Date.now(),
      semNo: currentSemester.semesterNo,
      semName: `Semester ${currentSemester.semesterNo}`,
      credits: currentSemester.semesterCredit,
      spi: spi,
    };

    // Add to results
    const updatedResults = [...semesterResults, newSemesterResult];
    setSemesterResults(updatedResults);

    showToast(
      `Semester ${currentSemester.semesterNo} added successfully`,
      "success"
    );
    return true;
  };

  // Edit a semester result
  const editSemesterResult = (id) => {
    const resultToEdit = semesterResults.find((result) => result.id === id);
    if (resultToEdit) {
      setEditMode(true);
      setEditingResultId(id);

      // Find and set the semester
      const semester = semesters.find(
        (s) => s.semesterNo === resultToEdit.semNo
      );
      setCurrentSemester(semester);

      // Find the index of this semester
      const index = semesters.findIndex(
        (s) => s.semesterNo === resultToEdit.semNo
      );
      setCurrentSemesterIndex(index);

      // Set form values
      setSpiValue(resultToEdit.spi);
    }
  };

  // Update a semester result
  const updateSemesterResult = () => {
    if (spiValue === "") {
      showToast("Please enter SPI value", "warning");
      return;
    }

    const spi = Number.parseFloat(spiValue.toString());

    if (isNaN(spi) || spi < 0 || spi > 10) {
      showToast("SPI must be between 0 and 10", "error");
      return;
    }

    // Update the semester result
    const updatedResults = semesterResults.map((result) => {
      if (result.id === editingResultId) {
        return {
          ...result,
          spi: spi,
        };
      }
      return result;
    });

    setSemesterResults(updatedResults);

    // Exit edit mode
    setEditMode(false);
    setEditingResultId(null);
    setSpiValue("");

    showToast("Semester updated successfully", "success");
  };

  // Delete a semester result
  const deleteSemesterResult = (id) => {
    if (confirm("Are you sure you want to delete this semester?")) {
      const updatedResults = semesterResults.filter(
        (result) => result.id !== id
      );
      setSemesterResults(updatedResults);

      // Recalculate CPI
      if (updatedResults.length > 0) {
        calculateCpi(updatedResults);
      } else {
        setCpi(null);
      }

      showToast("Semester deleted successfully", "info");
    }
  };

  // Calculate CPI
  const calculateCpi = (results = semesterResults) => {
    let totalCreditPoints = 0;
    let totalCredits = 0;

    results.forEach((result) => {
      totalCreditPoints += result.spi * result.credits;
      totalCredits += result.credits;
    });

    const calculatedCpi =
      totalCredits > 0 ? totalCreditPoints / totalCredits : 0;
    setCpi(calculatedCpi);
    setShowInputForm(false);

    showToast("CPI calculated successfully!", "success");
  };

  // Get CPI color class
  const getCpiColorClass = () => {
    if (!cpi) return "";

    if (cpi >= 8.5 && cpi <= 10) {
      return "green";
    } else if (cpi >= 7.5 && cpi < 8.49) {
      return "orange";
    } else if (cpi >= 6.5 && cpi < 7.49) {
      return "tomato";
    } else {
      return "red";
    }
  };

  // Handle SPI input change
  const handleSpiChange = (e) => {
    const value = e.target.value;
    setSpiValue(value);
  };

  return (
    <div className="cpi-calculator">
      <h2>Cumulative Performance Index (CPI) Calculator</h2>

      <div className="selection-container">
        <div className="selection-group">
          <label htmlFor="branch-cpi">Select Branch:</label>
          <select
            id="branch-cpi"
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
      </div>

      {loading && <div className="loading-spinner">Loading...</div>}

      {selectedBranch && !loading && (
        <>
          {showInputForm && (
            <div className="semester-input-container">
              {editMode ? (
                <div className="edit-mode-container">
                  <div className="edit-header">
                    <button
                      className="back-button"
                      onClick={() => {
                        setEditMode(false);
                        setEditingResultId(null);
                        setSpiValue("");
                      }}
                    >
                      <FaArrowLeft /> Back to All Semesters
                    </button>
                    <h3>Edit Semester {currentSemester?.semesterNo}</h3>
                  </div>

                  <div className="semester-info">
                    <p>
                      <strong>Semester Credits:</strong>{" "}
                      {currentSemester?.semesterCredit}
                    </p>
                  </div>

                  <div
                    className="input-group compact"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                    }}
                  >
                    <label htmlFor="spi-input">Enter SPI (0-10):</label>
                    <input
                      type="number"
                      id="spi-input"
                      value={spiValue}
                      onChange={handleSpiChange}
                      min="0"
                      max="10"
                      step="0.01"
                      className="small-input"
                    />
                  </div>

                  <div className="button-group">
                    <button
                      className="calculate-button"
                      onClick={updateSemesterResult}
                    >
                      Update Semester
                    </button>
                    <button
                      className="cancel-button"
                      onClick={() => {
                        setEditMode(false);
                        setEditingResultId(null);
                        setSpiValue("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="semester-card">
                  <div className="semester-navigation">
                    <button
                      className="nav-button"
                      onClick={goToPrevSemester}
                      disabled={currentSemesterIndex === 0}
                    >
                      <FaArrowLeft />
                    </button>
                    <h3>Semester {currentSemester?.semesterNo}</h3>
                    <button
                      className="nav-button"
                      onClick={goToNextSemester}
                      disabled={
                        currentSemesterIndex === semesters.length - 1 &&
                        semesterResults.length === 0
                      }
                    >
                      <FaArrowRight />
                    </button>
                  </div>

                  <div className="semester-info">
                    <p>
                      <strong>Semester Credits:</strong>{" "}
                      {currentSemester?.semesterCredit}
                    </p>
                    {isSemesterAdded(currentSemester?.semesterNo) && (
                      <p className="already-added">
                        This semester has already been added
                      </p>
                    )}
                  </div>

                  {!isSemesterAdded(currentSemester?.semesterNo) && (
                    <div
                      className="input-group"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                      }}
                    >
                      <label htmlFor="spi-input">Enter SPI (0-10):</label>
                      <input
                        type="number"
                        id="spi-input"
                        value={spiValue}
                        onChange={handleSpiChange}
                        style={{ maxWidth: "200px", width: "100%" }}
                        min="0"
                        max="10"
                        step="0.01"
                        className="small-input"
                      />
                    </div>
                  )}

                  <div className="semester-actions-container">
                    {currentSemesterIndex < semesters.length - 1 ? (
                      <div className="next-semester">
                        <button
                          className="next-link"
                          onClick={goToNextSemester}
                          disabled={
                            !spiValue &&
                            !isSemesterAdded(currentSemester?.semesterNo)
                          }
                        >
                          Next Semester <FaArrowRight />
                        </button>
                      </div>
                    ) : (
                      semesterResults.length > 0 && (
                        <div className="next-semester">
                          <button
                            className="calculate-cpi-link"
                            onClick={() => calculateCpi()}
                          >
                            Calculate CPI <FaArrowRight />
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {semesterResults.length > 0 && (
            <div className="results-container">
              <h3>Semester Results</h3>
              <div className="semesters-container">
                <div className="semester-header">
                  <div className="semester-name">Semester</div>
                  <div className="semester-credits">Credits</div>
                  <div className="semester-spi">SPI</div>
                  <div className="semester-actions">Actions</div>
                </div>

                {semesterResults.map((result) => (
                  <div className="semester-row" key={result.id}>
                    <div className="semester-name">
                      {typeof result.semName === "string" ||
                      typeof result.semName === "number"
                        ? result.semName
                        : ""}
                    </div>
                    <div className="semester-credits">
                      {typeof result.credits === "number" ||
                      typeof result.credits === "string"
                        ? result.credits
                        : ""}
                    </div>
                    <div
                      style={{ marginLeft: "25px" }}
                      className="semester-spi"
                    >
                      {typeof result.spi === "number"
                        ? result.spi.toFixed(2)
                        : ""}
                    </div>
                    <div className="semester-actions">
                      <button
                        className="edit-button"
                        onClick={() => editSemesterResult(result.id)}
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => deleteSemesterResult(result.id)}
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {!cpi && (
                <div className="cpi-actions">
                  <button
                    className="calculate-button"
                    onClick={() => calculateCpi()}
                  >
                    Calculate CPI
                  </button>
                </div>
              )}

              {cpi !== null && (
                <>
                  <div className="cpi-result-container">
                    <h3>Your Cumulative Performance Index (CPI)</h3>
                    <div className={`cpi-value bolder ${getCpiColorClass()}`}>
                      {cpi.toFixed(2)}
                    </div>
                    <div className="grade-description">
                      {cpi >= 8.5
                        ? "Outstanding Performance!"
                        : cpi >= 7.5
                        ? "Excellent Performance!"
                        : cpi >= 6.5
                        ? "Very Good Performance!"
                        : cpi >= 5.5
                        ? "Good Performance!"
                        : cpi >= 4.5
                        ? "Average Performance"
                        : cpi >= 4.0
                        ? "Below Average"
                        : "Needs Improvement"}
                    </div>
                  </div>

                  <div className="recalculate-container">
                    <button
                      className="recalculate-button"
                      onClick={() => setShowInputForm(true)}
                    >
                      Edit Semesters
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
