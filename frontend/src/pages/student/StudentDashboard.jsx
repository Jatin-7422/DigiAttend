import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/Layout/DashboardLayout";
import { auth } from "../../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import "../../styles/dashboard.css";

function StudentDashboard() {
  // --- State Hooks (Maintained completely intact) ---
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uid, setUid] = useState(null);

  // Changed filter hook target from subject to date string tracking
  const [selectedDate, setSelectedDate] = useState("All");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
      } else {
        setUid(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!uid) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `http://127.0.0.1:8000/attendance/student/${uid}`,
        );

        if (!response.ok) {
          throw new Error("Failed to pull live student metrics");
        }

        const data = await response.json();
        setRecords(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [uid]);

  // --- Helper Utility: Parse MongoDB ISO timestamps cleanly ---
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

  // --- Analytical Computations ---
  const totalClasses = records.length;
  const presentCount = records.filter(
    (rec) => rec.status?.toLowerCase() !== "absent",
  ).length;
  const absentCount = totalClasses - presentCount;
  const attendancePercentage =
    totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0;

  // Extract a clean, unique list of chronological log dates for the dropdown menu selector
  const uniqueDatesList = Array.from(
    new Set(
      records
        .map((rec) =>
          rec.timestamp ? formatDateTime(rec.timestamp).displayDate : null,
        )
        .filter(Boolean),
    ),
  ).sort((a, b) => new Date(b) - new Date(a));

  // Filter out data rows dynamically for summary cards and the main data table matrix
  const getFilteredRecords = () => {
    if (selectedDate === "All") return records;
    return records.filter((rec) => {
      const { displayDate } = formatDateTime(rec.timestamp);
      return displayDate === selectedDate;
    });
  };

  const filteredRecords = getFilteredRecords();
  const filteredTotal = filteredRecords.length;
  const filteredPresent = filteredRecords.filter(
    (rec) => rec.status?.toLowerCase() !== "absent",
  ).length;
  const filteredAbsent = filteredTotal - filteredPresent;
  const filteredPct =
    filteredTotal > 0 ? Math.round((filteredPresent / filteredTotal) * 100) : 0;

  return (
    <DashboardLayout role="student">
      <div
        className="dashboard-page"
        style={{
          padding: "2rem 1.5rem",
          maxWidth: "1100px",
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        <h1
          className="uppercase tracking-tight font-extrabold mb-8"
          style={{
            fontSize: "2.25rem",
            color: "#111827",
            marginBottom: "2rem",
          }}
        >
          Student Dashboard
        </h1>

        {loading && (
          <div className="flex justify-center items-center py-12 font-bold text-gray-900 uppercase tracking-widest text-sm">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mr-3"></div>
            Syncing live metrics profile...
          </div>
        )}

        {error && (
          <div className="p-4 mb-6 text-sm text-red-700 bg-white rounded-xl border-2 border-red-600 font-bold text-center">
            Backend Connection Failed: {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* SECTION 1: OVERALL SUMMARY PROFILE */}
            <div style={{ marginBottom: "3rem" }}>
              <h2
                style={{
                  fontSize: "0.85rem",
                  fontWeight: "900",
                  color: "#4b5563",
                  letterSpacing: "0.1em",
                  marginBottom: "1rem",
                }}
                className="uppercase"
              >
                Overall Academic Progress
              </h2>
              <div className="stats-grid">
                <div
                  className="stat-card"
                  style={{ background: "#f8fafc", borderStyle: "dashed" }}
                >
                  <h3>Overall Classes</h3>
                  <h2>{totalClasses}</h2>
                </div>
                <div
                  className="stat-card"
                  style={{ background: "#f8fafc", borderStyle: "dashed" }}
                >
                  <h3>Overall Present</h3>
                  <h2>{presentCount}</h2>
                </div>
                <div
                  className="stat-card"
                  style={{ background: "#f8fafc", borderStyle: "dashed" }}
                >
                  <h3>Overall Absent</h3>
                  <h2>{absentCount}</h2>
                </div>
                <div
                  className="stat-card"
                  style={{
                    background: "#f1f5f9",
                    borderStyle: "dashed",
                    borderColor: "#111827",
                  }}
                >
                  <h3>Overall Total %</h3>
                  <h2>{attendancePercentage}%</h2>
                </div>
              </div>
            </div>

            {/* SECTION 2: NEW DATE FILTER CARD */}
            <div
              style={{
                background: "#ffffff",
                border: "4px solid #111827",
                padding: "1.5rem",
                borderRadius: "1rem",
                boxShadow: "4px 4px 0px 0px #111827",
                maxWidth: "450px",
                marginBottom: "3.5rem",
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
                  letterSpacing: "0.05em",
                  marginBottom: "0.75rem",
                }}
              >
                Filter Analytics By Session Date
              </label>
              <select
                id="date-filter"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  width: "100%",
                  backgroundColor: "#ffffff",
                  border: "3px solid #111827",
                  padding: "0.75rem 1rem",
                  fontWeight: "800",
                  fontSize: "0.9rem",
                  color: "#111827",
                  outline: "none",
                  borderRadius: "0.75rem",
                  cursor: "pointer",
                }}
              >
                <option value="All">All Historical Dates</option>
                {uniqueDatesList.map((dateStr, index) => (
                  <option key={index} value={dateStr}>
                    {dateStr}
                  </option>
                ))}
              </select>
            </div>

            {/* SECTION 3: DYNAMIC DATE-FILTERED FLASHCARDS */}
            <div style={{ marginBottom: "3.5rem" }}>
              <h2
                style={{
                  fontSize: "1.15rem",
                  fontWeight: "900",
                  color: "#111827",
                  textTransform: "uppercase",
                  letterSpacing: "0.02em",
                  marginBottom: "1.25rem",
                }}
              >
                Filtered Focus:{" "}
                <span style={{ color: "#2563eb" }}>
                  {selectedDate === "All" ? "All Dates" : selectedDate}
                </span>
              </h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Classes</h3>
                  <h2>{filteredTotal}</h2>
                </div>

                <div className="stat-card">
                  <h3>Present</h3>
                  <h2>{filteredPresent}</h2>
                </div>

                <div className="stat-card">
                  <h3>Absent</h3>
                  <h2>{filteredAbsent}</h2>
                </div>

                <div className="stat-card">
                  <h3>Attendance %</h3>
                  <h2>{filteredPct}%</h2>
                </div>
              </div>
            </div>

            {/* SECTION 4: SUBJECT BREAKDOWN SUMMARY DATA TABLE */}
            <div style={{ marginTop: "3.5rem" }}>
              <h2
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "900",
                  color: "#111827",
                  textTransform: "uppercase",
                  letterSpacing: "0.02em",
                  marginBottom: "1.5rem",
                }}
              >
                Attendance Subject Ledger
              </h2>

              {filteredRecords.length === 0 ? (
                <div
                  style={{
                    background: "#ffffff",
                    border: "4px solid #111827",
                    padding: "2rem",
                    borderRadius: "1rem",
                    textAlign: "center",
                    fontWeight: "700",
                    color: "#4b5563",
                  }}
                >
                  No sessions registered on this selected reference index.
                </div>
              ) : (
                <div
                  style={{
                    background: "#ffffff",
                    border: "4px solid #111827",
                    borderRadius: "1rem",
                    boxShadow: "4px 4px 0px 0px #111827",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ overflowX: "auto" }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        textLeft: "left",
                        fontSize: "0.9rem",
                        color: "#111827",
                      }}
                    >
                      <thead>
                        <tr
                          style={{
                            background: "#f1f5f9",
                            borderBottom: "3px solid #111827",
                          }}
                        >
                          <th
                            style={{
                              padding: "1rem",
                              fontWeight: "900",
                              textTransform: "uppercase",
                              borderRight: "2px solid #111827",
                            }}
                          >
                            Subject Name
                          </th>
                          <th
                            style={{
                              padding: "1rem",
                              fontWeight: "900",
                              textTransform: "uppercase",
                              borderRight: "2px solid #111827",
                            }}
                          >
                            Date
                          </th>
                          <th
                            style={{
                              padding: "1rem",
                              fontWeight: "900",
                              textTransform: "uppercase",
                              borderRight: "2px solid #111827",
                            }}
                          >
                            Time
                          </th>
                          <th
                            style={{
                              padding: "1rem",
                              fontWeight: "900",
                              textTransform: "uppercase",
                            }}
                          >
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody style={{ fontWeight: "700" }}>
                        {filteredRecords.map((record, index) => {
                          const { displayDate, displayTime } = formatDateTime(
                            record.timestamp,
                          );
                          const isAbsent =
                            record.status?.toLowerCase() === "absent";

                          return (
                            <tr
                              key={index}
                              style={{
                                borderBottom:
                                  index !== filteredRecords.length - 1
                                    ? "2px solid #111827"
                                    : "none",
                                background:
                                  index % 2 === 0 ? "#ffffff" : "#f8fafc",
                              }}
                            >
                              <td
                                style={{
                                  padding: "1rem",
                                  borderRight: "2px solid #111827",
                                }}
                              >
                                {record.subject || "N/A"}
                              </td>
                              <td
                                style={{
                                  padding: "1rem",
                                  borderRight: "2px solid #111827",
                                  fontFamily: "monospace",
                                }}
                              >
                                {displayDate}
                              </td>
                              <td
                                style={{
                                  padding: "1rem",
                                  borderRight: "2px solid #111827",
                                  fontFamily: "monospace",
                                  fontSize: "0.85rem",
                                }}
                              >
                                {displayTime}
                              </td>
                              <td style={{ padding: "1rem" }}>
                                <span
                                  style={{
                                    display: "inline-block",
                                    padding: "0.25rem 0.7rem",
                                    fontSize: "0.75rem",
                                    fontWeight: "900",
                                    textTransform: "uppercase",
                                    border: "2px solid #111827",
                                    background: isAbsent
                                      ? "#fee2e2"
                                      : "#d1fae5",
                                    color: isAbsent ? "#991b1b" : "#065f46",
                                  }}
                                >
                                  {isAbsent ? "Absent" : "Present"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default StudentDashboard;
