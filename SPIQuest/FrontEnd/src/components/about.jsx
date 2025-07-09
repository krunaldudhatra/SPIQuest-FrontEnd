export default function About() {
  return (
    <div className="about-container">
      <h2>About SPI and CPI</h2>

      <section>
        <h3>What is SPI?</h3>
        <p>
          SPI (Semester Performance Index) is a measure of a student's academic performance in a single semester. It is
          calculated as the weighted average of grade points earned in all courses taken in a semester, where the
          weights are the credit hours for each course.
        </p>
        <div className="formula">
          <p>SPI = (Σ Course Credits × Grade Points) / (Σ Course Credits)</p>
        </div>
      </section>

      <section>
        <h3>What is CPI?</h3>
        <p>
          CPI (Cumulative Performance Index) is a measure of a student's overall academic performance across all
          semesters. It is calculated as the weighted average of SPI earned in all semesters, where the weights are the
          total credit hours for each semester.
        </p>
        <div className="formula">
          <p>CPI = (Σ Semester Credits × SPI) / (Σ Semester Credits)</p>
        </div>
      </section>

      <section>
        <h3>Grading System</h3>
        <p>The grading system used in this calculator follows a 10-point scale:</p>
        <table className="grade-table">
          <thead>
            <tr>
              <th>Grade</th>
              <th>Points</th>
              <th>Percentage</th>
              <th>Performance</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>AA</td>
              <td>10</td>
              <td>84.5 - 100</td>
              <td>Outstanding</td>
            </tr>
            <tr>
              <td>AB</td>
              <td>9</td>
              <td>74.5 - 84.49</td>
              <td>Excellent</td>
            </tr>
            <tr>
              <td>BB</td>
              <td>8</td>
              <td>64.5 - 74.49</td>
              <td>Very Good</td>
            </tr>
            <tr>
              <td>BC</td>
              <td>7</td>
              <td>54.5 - 64.49</td>
              <td>Good</td>
            </tr>
            <tr>
              <td>CC</td>
              <td>6</td>
              <td>44.5 - 54.49</td>
              <td>Average</td>
            </tr>
            <tr>
              <td>CD</td>
              <td>5</td>
              <td>39.5 - 44.49</td>
              <td>Below Average</td>
            </tr>
            <tr>
              <td>FF</td>
              <td>0</td>
              <td>0 - 39.49</td>
              <td>Fail</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h3>How to Use the Calculator</h3>
        <p>
          <strong>For SPI Calculation:</strong>
        </p>
        <ol>
          <li>Select your branch from the dropdown</li>
          <li>Select your semester from the dropdown</li>
          <li>Click "Add Subject" to add a new subject</li>
          <li>Select the subject from the dropdown</li>
          <li>Enter your marks for each component (sessional, termwork, external)</li>
          <li>Click "Add Subject" to add it to your results</li>
          <li>Repeat for all subjects in the semester</li>
          <li>Your SPI will be calculated automatically</li>
          <li>You can edit or delete subjects using the action buttons</li>
          <li>Click "Show Details" to view detailed marks breakdown</li>
        </ol>

        <p>
          <strong>For CPI Calculation:</strong>
        </p>
        <ol>
          <li>Select your branch from the dropdown</li>
          <li>Click "Add Semester Result" to add a semester</li>
          <li>Select the semester from the dropdown</li>
          <li>Enter your SPI for that semester</li>
          <li>Click "Add Semester" to add it to your results</li>
          <li>Repeat for all semesters</li>
          <li>Your CPI will be calculated automatically</li>
          <li>You can edit or delete semesters using the action buttons</li>
        </ol>
      </section>
    </div>
  )
}

