import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/Layout/Temp";

function TeacherDashboard() {
  const [allRecords, setAllRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState("All");

  // Normalized display subjects list
  const allowedSubjects = [
    "Maths",
    "Python",
    "Operating Systems",
    "Data Structures",
    "Unix Architecture",
  ];

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "https://digiattend-backend.onrender.com/attendance/all",
        );
        if (!response.ok) {
          throw new Error("Failed to fetch database records");
        }
        const data = await response.json();
        setAllRecords(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, []);

  const formatDateOnly = (isoString) => {
    if (!isoString) return "Unknown Date";
    try {
      const dateObj = new Date(isoString);
      return dateObj.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return "Invalid Date";
    }
  };

  // Groups data uniquely by DATE, then counts unique students per subject safely
  const getDateGroupedSummary = () => {
    const dateMap = {};

    allRecords.forEach((record) => {
      const dateKey = formatDateOnly(record.timestamp);

      // CRITICAL FIX: Convert backend subject string to lowercase and remove spaces for safe matching
      const rawSubject = record.subject || "";
      const normalizedBackendSubject = rawSubject.trim().toLowerCase();

      const studentIdentifier = record.studentEmail || record.studentName;

      if (!dateMap[dateKey]) {
        dateMap[dateKey] = {};
      }

      if (!dateMap[dateKey][normalizedBackendSubject]) {
        dateMap[dateKey][normalizedBackendSubject] = new Set();
      }

      dateMap[dateKey][normalizedBackendSubject].add(studentIdentifier);
    });

    return Object.keys(dateMap)
      .map((date) => {
        const subjectCounts = {};

        Object.keys(dateMap[date]).forEach((subj) => {
          subjectCounts[subj] = dateMap[date][subj].size;
        });

        return {
          date,
          counts: subjectCounts,
        };
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const masterDateRows = getDateGroupedSummary();

  // Mobile-hardened inline responsive rules
  const styles = {
    container: {
      padding: "12px",
      width: "100%",
      maxWidth: "100vw", // Prevents dashboard container bleedout on phones
      margin: "0 auto",
      boxSizing: "border-box",
      overflowX: "hidden",
    },
    mainTitle: {
      color: "#000000",
      fontSize: "24px", // Scaled for mobile displays
      fontWeight: "900",
      margin: "0 0 8px 0",
      textTransform: "uppercase",
    },
    subTitle: {
      color: "#000000",
      fontSize: "14px",
      fontWeight: "700",
      margin: "0 0 20px 0",
      opacity: 0.8,
    },
    titleBorder: { borderBottom: "4px solid #000000", marginBottom: "24px" },
    filterLabel: {
      display: "block",
      color: "#000000",
      fontWeight: "900",
      fontSize: "13px",
      marginBottom: "8px",
      textTransform: "uppercase",
    },
    dropdown: {
      width: "100%",
      maxWidth: "100%", // Adapts to phone width dynamically
      padding: "12px",
      fontSize: "15px",
      fontWeight: "900",
      color: "#000000",
      backgroundColor: "#ffffff",
      border: "3px solid #000000",
      marginBottom: "24px",
      outline: "none",
      boxSizing: "border-box",
    },
    // CONTAINER THAT ADDS H-SCROLL CAPABILITY FOR COMPACT COLS
    tableWrapper: {
      width: "100%",
      border: "4px solid #000000",
      backgroundColor: "#ffffff",
      overflowX: "auto",
      WebkitOverflowScrolling: "touch",
      boxSizing: "border-box",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      backgroundColor: "#ffffff",
      textAlign: "left",
      minWidth: "650px", // Holds layout shapes so text content stays clear
    },
    th: {
      backgroundColor: "#e2e8f0",
      color: "#000000",
      fontWeight: "900",
      padding: "10px 14px",
      fontSize: "12px",
      borderBottom: "4px solid #000000",
      borderRight: "2px solid #000000",
      textTransform: "uppercase",
    },
    thLast: {
      backgroundColor: "#e2e8f0",
      color: "#000000",
      fontWeight: "900",
      padding: "10px 14px",
      fontSize: "12px",
      borderBottom: "4px solid #000000",
      textTransform: "uppercase",
    },
    tr: { borderBottom: "2px solid #000000" },
    td: {
      padding: "10px 14px",
      color: "#000000",
      fontWeight: "700",
      fontSize: "13px",
      backgroundColor: "#ffffff",
      borderRight: "2px solid #000000",
      whiteSpace: "nowrap",
    },
    tdLast: {
      padding: "10px 14px",
      color: "#000000",
      fontWeight: "700",
      fontSize: "13px",
      backgroundColor: "#ffffff",
      whiteSpace: "nowrap",
    },
    badge: {
      backgroundColor: "#000000",
      color: "#ffffff",
      padding: "4px 8px",
      fontWeight: "900",
      fontSize: "12px",
    },
    loadingText: {
      color: "#000000",
      fontWeight: "900",
      fontSize: "16px",
      textAlign: "center",
      padding: "32px 0",
    },
  };

  const activeColumns =
    selectedSubject === "All" ? allowedSubjects : [selectedSubject];

  return (
    <DashboardLayout role="teacher">
      <div style={styles.container}>
        <div style={styles.titleBorder}>
          <h1 style={styles.mainTitle}>Teacher Dashboard</h1>
          <p style={styles.subTitle}>
            Unified daily attendance matrices summary
          </p>
        </div>

        {/* Dropdown Selection */}
        <div>
          <label htmlFor="subject-filter" style={styles.filterLabel}>
            Filter View By Subject Module
          </label>
          <select
            id="subject-filter"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            style={styles.dropdown}
          >
            <option value="All">All Subjects (Side-by-Side View)</option>
            {allowedSubjects.map((sub, idx) => (
              <option key={idx} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>

        {/* LOADING & ERROR STATES */}
        {loading && (
          <div style={styles.loadingText}>
            Loading aggregated row insights...
          </div>
        )}
        {error && (
          <div
            style={{
              padding: "12px",
              color: "#000000",
              backgroundColor: "#ffffff",
              border: "3px solid #000000",
              textAlign: "center",
              fontWeight: "900",
              fontSize: "14px",
            }}
          >
            Data Aggregation Error: {error}
          </div>
        )}

        {/* ATTENDANCE GRID */}
        {!loading &&
          !error &&
          (masterDateRows.length === 0 ? (
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "4px solid #000000",
                padding: "32px",
                textAlign: "center",
                color: "#000000",
                fontWeight: "900",
                fontSize: "14px",
              }}
            >
              No check-in logs present in database.
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Date</th>
                    {activeColumns.map((sub, idx) => {
                      const isLast = idx === activeColumns.length - 1;
                      return (
                        <th
                          key={idx}
                          style={isLast ? styles.thLast : styles.th}
                        >
                          {sub} Present
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {masterDateRows.map((row, rowIndex) => (
                    <tr key={rowIndex} style={styles.tr}>
                      <td style={{ ...styles.td, fontWeight: "900" }}>
                        {row.date}
                      </td>

                      {activeColumns.map((sub, colIndex) => {
                        const lookupKey = sub.trim().toLowerCase();
                        const studentCount = row.counts[lookupKey] || 0;

                        const isLast = colIndex === activeColumns.length - 1;
                        const currentTdStyle = isLast
                          ? styles.tdLast
                          : styles.td;

                        return (
                          <td key={colIndex} style={currentTdStyle}>
                            {studentCount > 0 ? (
                              <span style={styles.badge}>
                                {studentCount} Present
                              </span>
                            ) : (
                              <span
                                style={{
                                  color: "#000000",
                                  opacity: 0.4,
                                  fontWeight: "700",
                                }}
                              >
                                0 Present
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
      </div>
    </DashboardLayout>
  );
}

export default TeacherDashboard;
