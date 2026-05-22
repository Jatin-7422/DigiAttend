import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import DashboardLayout from "../../components/Layout/DashboardLayout";

function GenerateQR() {
  const [subject, setSubject] = useState("");
  const [qrData, setQrData] = useState("");

  // Hardcoded academic subject list for selection dropdown
  const allowedSubjects = [
    "Maths",
    "Python",
    "Operating Systems",
    "Data Structures",
    "Unix Architecture",
  ];

  const generateQRCode = () => {
    if (!subject) {
      alert("Please select a subject from the list.");
      return;
    }

    // Create formal attendance session payload
    const attendanceSession = {
      subject,
      timestamp: new Date().toISOString(),
      sessionId: Math.random().toString(36).substring(2, 10),
    };

    // Convert object → JSON string payload for the QR Scanner matrix
    setQrData(JSON.stringify(attendanceSession));
  };

  // Explicit, high-contrast inline styling scheme
  const styles = {
    container: { padding: "24px", maxWidth: "600px", margin: "0 auto" },
    mainTitle: {
      color: "#000000",
      fontSize: "32px",
      fontWeight: "900",
      margin: "0 0 24px 0",
      paddingBottom: "12px",
      borderBottom: "4px solid #000000",
      textTransform: "uppercase",
      trackingTight: "-0.025em",
    },
    formLabel: {
      display: "block",
      color: "#000000",
      fontWeight: "900",
      fontSize: "16px",
      marginBottom: "8px",
      textTransform: "uppercase",
    },
    dropdown: {
      width: "100%",
      padding: "12px 16px",
      fontSize: "16px",
      fontWeight: "700",
      color: "#000000",
      backgroundColor: "#ffffff",
      border: "3px solid #000000",
      marginBottom: "20px",
      outline: "none",
      borderRadius: "0px",
    },
    button: {
      width: "100%",
      padding: "14px",
      backgroundColor: "#000000",
      color: "#ffffff",
      fontSize: "16px",
      fontWeight: "900",
      border: "none",
      cursor: "pointer",
      textTransform: "uppercase",
      letterSpacing: "1px",
    },
    qrBox: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      marginTop: "40px",
      padding: "30px",
      border: "4px solid #000000",
      backgroundColor: "#ffffff",
    },
    qrHeading: {
      marginTop: "20px",
      color: "#000000",
      fontSize: "24px",
      fontWeight: "900",
      textTransform: "uppercase",
      margin: "20px 0 4px 0",
    },
    qrSubtext: {
      color: "#000000",
      fontWeight: "700",
      fontSize: "14px",
      margin: "4px 0 0 0",
      textAlign: "center",
    },
  };

  return (
    <DashboardLayout role="teacher">
      <div style={styles.container}>
        {/* Page Main Header */}
        <h1 style={styles.mainTitle}>Generate QR</h1>

        {/* Form Group Block */}
        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="subject-select" style={styles.formLabel}>
            Select Subject Module
          </label>
          <select
            id="subject-select"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={styles.dropdown}
          >
            <option value="" disabled style={{ color: "#666" }}>
              -- Choose an Active Course --
            </option>
            {allowedSubjects.map((sub, idx) => (
              <option
                key={idx}
                value={sub}
                style={{ color: "#000000", fontWeight: "700" }}
              >
                {sub}
              </option>
            ))}
          </select>
        </div>

        {/* Action Form Submission Button */}
        <button onClick={generateQRCode} style={styles.button}>
          Generate Attendance QR
        </button>

        {/* QR MATRIX DISPLAY PANEL */}
        {qrData && (
          <div style={styles.qrBox}>
            {/* Native SVG QR Engine Container Block */}
            <div
              style={{
                padding: "10px",
                border: "2px solid #000000",
                backgroundColor: "#ffffff",
              }}
            >
              <QRCodeSVG
                value={qrData}
                size={220}
                fgColor="#000000"
                bgColor="#ffffff"
              />
            </div>

            {/* High Contrast Informational Footers */}
            <h3 style={styles.qrHeading}>Scan For Attendance</h3>
            <p style={styles.qrSubtext}>
              Point your student dashboard scanner to check into{" "}
              <strong>{subject}</strong>.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default GenerateQR;
