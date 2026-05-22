import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/Layout/DashboardLayout";

function AttendanceTable() {
  const [allRecords, setAllRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // State to track the teacher's selected date filter
  const [selectedDate, setSelectedDate] = useState("All");

  useEffect(() => {
    const fetchAllAttendance = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://127.0.0.1:8000/attendance/all");

        if (!response.ok) {
          throw new Error("Failed to fetch global attendance roster");
        }

        const data = await response.json();
        setAllRecords(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllAttendance();
  }, []);

  const formatDateTime = (isoString) => {
    if (!isoString) return { date: "N/A", time: "N/A" };
    try {
      const dateObj = new Date(isoString);
      const dateOptions = { day: "numeric", month: "short", year: "numeric" };
      const formattedDate = dateObj.toLocaleDateString("en-IN", dateOptions);

      const timeOptions = { hour: "2-digit", minute: "2-digit", hour12: true };
      const formattedTime = dateObj
        .toLocaleTimeString("en-IN", timeOptions)
        .toLowerCase();

      return { date: formattedDate, time: formattedTime };
    } catch (e) {
      return { date: isoString, time: "" };
    }
  };

  // Helper function to extract all unique formatted dates across the entire dataset for the dropdown selector
  const getUniqueDatesList = () => {
    const datesSet = new Set();
    allRecords.forEach((record) => {
      if (record.timestamp) {
        const { date } = formatDateTime(record.timestamp);
        datesSet.add(date);
      }
    });
    return Array.from(datesSet).sort((a, b) => new Date(b) - new Date(a));
  };

  // Groups items by subject while applying the active date filter
  const getGroupedBySubject = () => {
    const grouped = {};
    allRecords.forEach((record) => {
      const { date } = formatDateTime(record.timestamp);

      // Skip the log entry if a specific date filter is selected and does not match
      if (selectedDate !== "All" && date !== selectedDate) {
        return;
      }

      const subj = record.subject || "General / Unknown";
      if (!grouped[subj]) {
        grouped[subj] = [];
      }
      grouped[subj].push(record);
    });
    return grouped;
  };

  const uniqueDates = getUniqueDatesList();
  const groupedData = getGroupedBySubject();
  const activeSubjectCount = Object.keys(groupedData).length;

  // Bulletproof mobile responsive layout styling
  const styles = {
    container: {
      padding: "12px",
      width: "100%",
      maxWidth: "100vw", // Hard constraint to completely match mobile screen widths
      margin: "0 auto",
      boxSizing: "border-box",
      overflowX: "hidden",
    },
    mainTitle: {
      color: "#000000",
      fontSize: "24px", // Optimally scaled down for mobile screens
      fontWeight: "900",
      margin: "0 0 16px 0",
      paddingBottom: "8px",
      borderBottom: "4px solid #000000",
      textTransform: "uppercase",
    },
    subjectBlock: {
      marginBottom: "24px",
      width: "100%",
      boxSizing: "border-box",
    },
    headerBanner: {
      backgroundColor: "#000000",
      padding: "10px 12px",
      display: "flex",
      justify: "space-between",
      justifyContent: "space-between",
      alignItems: "center",
      boxSizing: "border-box",
    },
    subjectTitle: {
      color: "#ffffff",
      fontSize: "16px",
      fontWeight: "900",
      margin: 0,
      textTransform: "uppercase",
    },
    // CONTAINER THAT ADDS THE SMOOTH HORIZONTAL SCROLL ON SMALL PHONES
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
      minWidth: "550px", // Ensures columns stay clean and don't bunch up into single letters
    },
    th: {
      backgroundColor: "#e2e8f0",
      color: "#000000",
      fontWeight: "900",
      padding: "10px 12px",
      fontSize: "12px",
      borderBottom: "4px solid #000000",
      borderRight: "2px solid #000000",
      textTransform: "uppercase",
    },
    thLast: {
      backgroundColor: "#e2e8f0",
      color: "#000000",
      fontWeight: "900",
      padding: "10px 12px",
      fontSize: "12px",
      borderBottom: "4px solid #000000",
      textTransform: "uppercase",
    },
    tr: { borderBottom: "2px solid #000000" },
    td: {
      padding: "10px 12px",
      color: "#000000",
      fontWeight: "700",
      fontSize: "13px",
      backgroundColor: "#ffffff",
      borderRight: "2px solid #000000",
      whiteSpace: "nowrap", // Prevents messy multi-line text breaking on phone layouts
    },
    tdLast: {
      padding: "10px 12px",
      color: "#000000",
      fontWeight: "900",
      fontSize: "13px",
      backgroundColor: "#ffffff",
      whiteSpace: "nowrap",
    },
    loadingText: {
      color: "#000000",
      fontWeight: "900",
      fontSize: "16px",
      textAlign: "center",
      padding: "32px 0",
    },
  };

  return (
    <DashboardLayout role="teacher">
      <div style={styles.container}>
        {/* Page Header */}
        <h1 style={styles.mainTitle}>Attendance Table</h1>

        {/* Neo-Brutalist Date Filtering Panel */}
        {!loading && !error && allRecords.length > 0 && (
          <div
            style={{
              marginBottom: "24px",
              width: "100%",
              maxWidth: "400px",
              backgroundColor: "#ffffff",
              border: "4px solid #000000",
              padding: "12px",
              borderRadius: "12px",
              boxShadow: "4px 4px 0px 0px #000000",
              boxSizing: "border-box",
            }}
          >
            <label
              htmlFor="teacher-date-filter"
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: "900",
                color: "#000000",
                textTransform: "uppercase",
                marginBottom: "6px",
                letterSpacing: "0.05em",
              }}
            >
              Filter Roster By Date
            </label>
            <select
              id="teacher-date-filter"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                width: "100%",
                backgroundColor: "#ffffff",
                border: "3px solid #000000",
                padding: "8px",
                fontWeight: "800",
                fontSize: "13px",
                color: "#000000",
                outline: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              <option value="All">All Logged Dates</option>
              {uniqueDates.map((dateString, index) => (
                <option key={index} value={dateString}>
                  {dateString}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* LOADING STATE */}
        {loading && (
          <div style={styles.loadingText}>Syncing attendance database...</div>
        )}

        {/* ERROR STATE */}
        {error && (
          <div
            style={{
              padding: "12px",
              color: "#000000",
              backgroundColor: "#ffffff",
              border: "3px solid #000000",
              textAlign: "center",
              fontWeight: "900",
              marginBottom: "16px",
              fontSize: "14px",
            }}
          >
            Backend Failure: {error}
          </div>
        )}

        {/* DATA LAYOUT */}
        {!loading &&
          !error &&
          (allRecords.length === 0 ? (
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
              No student check-ins logged yet.
            </div>
          ) : activeSubjectCount === 0 ? (
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
              No check-ins found for date: "{selectedDate}"
            </div>
          ) : (
            <div>
              {Object.keys(groupedData).map((subject, idx) => (
                <div key={idx} style={styles.subjectBlock}>
                  {/* Black Subject Banner with Student Counter */}
                  <div style={styles.headerBanner}>
                    <h2 style={styles.subjectTitle}>{subject}</h2>
                    <span
                      style={{
                        backgroundColor: "#ffffff",
                        color: "#000000",
                        fontSize: "11px",
                        fontWeight: "900",
                        padding: "2px 8px",
                        border: "2px solid #000000",
                        whiteSpace: "nowrap",
                        textTransform: "uppercase",
                      }}
                    >
                      Total Students: {groupedData[subject].length}
                    </span>
                  </div>

                  {/* Swipeable Table Block */}
                  <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Student Name</th>
                          <th style={styles.th}>Email Address</th>
                          <th style={styles.th}>Date</th>
                          <th style={styles.thLast}>Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupedData[subject].map((record, index) => {
                          const { date, time } = formatDateTime(
                            record.timestamp,
                          );
                          return (
                            <tr key={index} style={styles.tr}>
                              <td
                                style={{
                                  ...styles.td,
                                  textTransform: "capitalize",
                                  fontWeight: "900",
                                }}
                              >
                                {record.studentName}
                              </td>
                              <td style={styles.td}>{record.studentEmail}</td>
                              <td style={styles.td}>{date}</td>
                              <td style={styles.tdLast}>{time}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ))}
      </div>
    </DashboardLayout>
  );
}

export default AttendanceTable;
