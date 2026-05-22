import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/Layout/DashboardLayout.jsx";
// Import auth directly from your main firebase configuration file
import { auth } from "../../services/firebase";

function History() {
  const [historyRecords, setHistoryRecords] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState(null);
  const [selectedDate, setSelectedDate] = useState("All");

  // Grab the UID directly from the active Firebase session instance
  const studentUID = auth.currentUser?.uid;

  useEffect(() => {
    if (!studentUID) {
      setHistoryLoading(false);
      return;
    }

    const fetchStudentHistory = async () => {
      try {
        setHistoryLoading(true);
        setHistoryError(null);
        const response = await fetch(
          `https://digiattend-backend.onrender.com/attendance/student/${studentUID}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch attendance history records");
        }

        const data = await response.json();
        setHistoryRecords(data);
      } catch (err) {
        setHistoryError(err.message);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchStudentHistory();
  }, [studentUID]);

  // Helper utility to parse MongoDB ISO timestamps cleanly to localized readable values
  const formatDateTime = (isoString) => {
    if (!isoString) return { displayDate: "Unknown", displayTime: "N/A" };
    try {
      const dateObj = new Date(isoString);
      const displayDate = dateObj.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      const displayTime = dateObj
        .toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
        .toLowerCase();

      return { displayDate, displayTime };
    } catch (e) {
      return { displayDate: isoString, displayTime: "" };
    }
  };

  // Extract a clean, unique list of chronological log dates for the dropdown menu selector
  const getUniqueDatesList = () => {
    const datesSet = new Set();
    if (Array.isArray(historyRecords)) {
      historyRecords.forEach((record) => {
        if (record.timestamp) {
          const { displayDate } = formatDateTime(record.timestamp);
          datesSet.add(displayDate);
        }
      });
    }
    return Array.from(datesSet).sort((a, b) => new Date(b) - new Date(a));
  };

  // Group the raw database documents flat array by Subject name, handling date filtering
  const getSubjectWiseFilteredData = () => {
    const grouped = {};
    if (!Array.isArray(historyRecords)) return grouped;

    historyRecords.forEach((record) => {
      const subjectName = record.subject || "Unassigned Subject";
      const { displayDate, displayTime } = formatDateTime(record.timestamp);

      // Skip the log row if a specific date is chosen and it doesn't match
      if (selectedDate !== "All" && displayDate !== selectedDate) {
        return;
      }

      if (!grouped[subjectName]) {
        grouped[subjectName] = [];
      }

      grouped[subjectName].push({
        ...record,
        formattedDate: displayDate,
        formattedTime: displayTime,
      });
    });

    return grouped;
  };

  const uniqueDates = getUniqueDatesList();
  const subjectWiseRecords = getSubjectWiseFilteredData();
  const runningTableCount = Object.keys(subjectWiseRecords).length;

  return (
    <DashboardLayout role="student">
      <div
        style={{
          padding: "2rem 1.5rem",
          maxWidth: "1150px",
          margin: "0 auto",
          boxSizing: "border-box",
          fontFamily: "sans-serif",
        }}
      >
        {/* Upper Title Header Banner Section */}
        <div
          style={{
            marginBottom: "2rem",
            borderBottom: "4px solid #000000",
            paddingBottom: "1rem",
          }}
        >
          <h1
            style={{
              fontSize: "2.25rem",
              fontWeight: "900",
              color: "#111827",
              textTransform: "uppercase",
              margin: 0,
              letterSpacing: "-0.025em",
            }}
          >
            Attendance History
          </h1>
          <p
            style={{
              fontSize: "0.85rem",
              fontWeight: "800",
              color: "#4b5563",
              textTransform: "uppercase",
              trackingWidth: "0.1em",
              marginTop: "0.25rem",
              marginBottom: 0,
            }}
          >
            Review your subject-wise presence logs.
          </p>
        </div>

        {/* Dynamic Date Filtering Selector Dropdown Card */}
        {!historyLoading &&
          !historyError &&
          Array.isArray(historyRecords) &&
          historyRecords.length > 0 && (
            <div
              style={{
                marginBottom: "2.5rem",
                width: "100%",
                maxWidth: "450px",
                backgroundColor: "#ffffff",
                border: "4px solid #000000",
                padding: "1.25rem",
                borderRadius: "1rem",
                boxShadow: "4px 4px 0px 0px #000000",
                boxSizing: "border-box",
              }}
            >
              <label
                htmlFor="date-filter"
                style={{
                  display: "block",
                  fontSize: "0.75rem",
                  fontWeight: "900",
                  color: "#111827",
                  textTransform: "uppercase",
                  marginBottom: "0.5rem",
                  letterSpacing: "0.05em",
                }}
              >
                Filter Records By Date
              </label>
              <select
                id="date-filter"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  width: "100%",
                  backgroundColor: "#ffffff",
                  border: "3px solid #000000",
                  padding: "0.75rem",
                  fontWeight: "800",
                  fontSize: "0.9rem",
                  color: "#111827",
                  outline: "none",
                  borderRadius: "0.75rem",
                  cursor: "pointer",
                }}
              >
                <option value="All">All Historical Dates</option>
                {uniqueDates.map((dateString, index) => (
                  <option key={index} value={dateString}>
                    {dateString}
                  </option>
                ))}
              </select>
            </div>
          )}

        {/* INITIAL RETRIEVAL LOADING STATE */}
        {historyLoading && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "3rem 0",
            }}
          >
            <span
              style={{
                color: "#111827",
                fontWeight: "900",
                fontSize: "0.875rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Syncing active profile logs...
            </span>
          </div>
        )}

        {/* ERROR STATE VIEW DISPLAY */}
        {historyError && !historyLoading && (
          <div
            style={{
              padding: "1rem",
              marginBottom: "1.5rem",
              fontSize: "0.875rem",
              color: "#991b1b",
              backgroundColor: "#ffffff",
              borderRadius: "0.75rem",
              border: "2px solid #dc2626",
              fontWeight: "700",
              textAlign: "center",
            }}
          >
            <span style={{ fontWeight: "900", textTransform: "uppercase" }}>
              Fetch Error:
            </span>{" "}
            {historyError}
          </div>
        )}

        {/* FALLBACK IF NOT LOGGED IN */}
        {!historyLoading && !studentUID && (
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "4px solid #000000",
              padding: "3rem",
              textAlign: "center",
              boxShadow: "4px 4px 0px 0px #000000",
              borderRadius: "1rem",
            }}
          >
            <p
              style={{
                color: "#111827",
                fontSize: "1.125rem",
                fontWeight: "900",
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              Please log in to view your attendance history.
            </p>
          </div>
        )}

        {/* ATTENDANCE TIMELINE LAYOUT DISPLAY */}
        {!historyLoading &&
          studentUID &&
          !historyError &&
          (historyRecords.length === 0 ? (
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "4px solid #000000",
                padding: "3rem",
                textAlign: "center",
                boxShadow: "4px 4px 0px 0px #000000",
                borderRadius: "1rem",
              }}
            >
              <p
                style={{
                  color: "#111827",
                  fontSize: "1.125rem",
                  fontWeight: "900",
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                No historical attendance data found for this account.
              </p>
            </div>
          ) : runningTableCount === 0 ? (
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "4px solid #000000",
                padding: "3rem",
                textAlign: "center",
                boxShadow: "4px 4px 0px 0px #000000",
                borderRadius: "1rem",
              }}
            >
              <p
                style={{
                  color: "#111827",
                  fontSize: "1rem",
                  fontWeight: "700",
                  margin: 0,
                }}
              >
                No logs matching{" "}
                <span style={{ fontWeight: "900" }}>"{selectedDate}"</span> were
                found.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "2.5rem",
              }}
            >
              {Object.keys(subjectWiseRecords).map((subject, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: "#ffffff",
                    border: "4px solid #000000",
                    boxShadow: "4px 4px 0px 0px #000000",
                    overflow: "hidden",
                    width: "100%",
                  }}
                >
                  {/* Subject Module Header Panel */}
                  <div
                    style={{
                      backgroundColor: "#000000",
                      padding: "0.85rem 1.5rem",
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <h2
                      style={{
                        fontSize: "1rem",
                        fontWeight: "900",
                        color: "#ffffff",
                        textTransform: "uppercase",
                        margin: 0,
                        letterSpacing: "0.05em",
                      }}
                    >
                      {subject}
                    </h2>
                    <span
                      style={{
                        backgroundColor: "#ffffff",
                        color: "#000000",
                        fontSize: "0.75rem",
                        fontWeight: "900",
                        padding: "0.25rem 0.75rem",
                        border: "2px solid #000000",
                        whiteSpace: "nowrap",
                        textTransform: "uppercase",
                      }}
                    >
                      Classes Attended: {subjectWiseRecords[subject].length}
                    </span>
                  </div>

                  {/* Responsive High Contrast Table Framework */}
                  <div style={{ width: "100%", overflowX: "auto" }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        textAlign: "left",
                        fontSize: "0.875rem",
                        color: "#111827",
                        minWidth: "500px",
                      }}
                    >
                      <thead>
                        <tr
                          style={{
                            fontSize: "0.75rem",
                            backgroundColor: "#f1f5f9",
                            borderBottom: "4px solid #000000",
                            fontWeight: "900",
                          }}
                        >
                          <th
                            style={{
                              padding: "1rem",
                              fontWeight: "900",
                              textTransform: "uppercase",
                              borderRight: "2px solid #000000",
                              trackingWidth: "0.05em",
                            }}
                          >
                            Attendance
                          </th>
                          <th
                            style={{
                              padding: "1rem",
                              fontWeight: "900",
                              textTransform: "uppercase",
                              borderRight: "2px solid #000000",
                              trackingWidth: "0.05em",
                            }}
                          >
                            Date
                          </th>
                          <th
                            style={{
                              padding: "1rem",
                              fontWeight: "900",
                              textTransform: "uppercase",
                              trackingWidth: "0.05em",
                            }}
                          >
                            Time Stamp
                          </th>
                        </tr>
                      </thead>
                      <tbody style={{ fontWeight: "700" }}>
                        {subjectWiseRecords[subject].map((record, index) => {
                          const isAbsent =
                            record.status?.toLowerCase() === "absent";
                          return (
                            <tr
                              key={index}
                              style={{
                                borderBottom:
                                  index !==
                                  subjectWiseRecords[subject].length - 1
                                    ? "2px solid #000000"
                                    : "none",
                                backgroundColor:
                                  index % 2 === 0 ? "#ffffff" : "#f8fafc",
                              }}
                            >
                              {/* Attendance Badge Status Column */}
                              <td
                                style={{
                                  padding: "1rem",
                                  borderRight: "2px solid #000000",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                <span
                                  style={{
                                    display: "inline-block",
                                    padding: "0.25rem 0.75rem",
                                    fontSize: "0.7rem",
                                    fontWeight: "900",
                                    border: "2px solid #000000",
                                    textTransform: "uppercase",
                                    backgroundColor: isAbsent
                                      ? "#fca5a5"
                                      : "#bbf7d0",
                                    color: isAbsent ? "#7f1d1d" : "#044e37",
                                    letterSpacing: "0.025em",
                                  }}
                                >
                                  {isAbsent ? "Absent" : "Present"}
                                </span>
                              </td>

                              {/* Date Details Column */}
                              <td
                                style={{
                                  padding: "1rem",
                                  borderRight: "2px solid #000000",
                                  whiteSpace: "nowrap",
                                  color: "#111827",
                                }}
                              >
                                {record.formattedDate}
                              </td>

                              {/* Time Details Column */}
                              <td
                                style={{
                                  padding: "1rem",
                                  whiteSpace: "nowrap",
                                  fontFamily: "monospace",
                                  fontSize: "0.75rem",
                                  fontWeight: "900",
                                  color: "#111827",
                                }}
                              >
                                {record.formattedTime}
                              </td>
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

export default History;
