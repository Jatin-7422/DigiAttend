import { useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import DashboardLayout from "../../components/Layout/DashboardLayout";
import axios from "axios";
import { auth, db } from "../../services/firebase";
import { doc, getDoc } from "firebase/firestore";

function ScanQR() {
  const [scanResult, setScanResult] = useState(null);

  const startScanner = () => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        qrbox: {
          width: 250,
          height: 250,
        },
        fps: 5,
      },
      false,
    );

    scanner.render(
      // SUCCESS CALLBACK
      async (decodedText) => {
        try {
          // STOP CAMERA
          await scanner.clear();

          // QR STRING → OBJECT
          const parsedData = JSON.parse(decodedText);

          // SAVE RESULT
          setScanResult(parsedData);

          // Check if browser supports Geolocation API
          if (!navigator.geolocation) {
            alert("Your device doesn't support geolocation tracking.");
            return;
          }

          // Fetch student's current coordinate metrics
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              // CURRENT LOGGED-IN USER
              const user = auth.currentUser;

              // FETCH USER DATA FROM FIRESTORE
              const userDoc = await getDoc(doc(db, "users", user.uid));
              const userData = userDoc.data();

              // SEND DATA TO FASTAPI BACKEND
              const response = await axios.post(
                "https://digiattend-backend.onrender.com/attendance/mark",
                {
                  studentName: userData.name,
                  studentEmail: userData.email,
                  studentUID: user.uid,
                  subject: parsedData.subject,
                  sessionId: parsedData.sessionId,
                  timestamp: parsedData.timestamp,
                  createdAt: parsedData.createdAt || parsedData.timestamp, // <-- CRITICAL FIX: Sends the timestamp validation to your backend

                  // NEW GEOFENCING PAYLOAD SCHEMATICS
                  studentLat: position.coords.latitude,
                  studentLon: position.coords.longitude,
                  teacherLat: parsedData.teacherLat,
                  teacherLon: parsedData.teacherLon,
                },
              );

              // SUCCESS ALERT
              alert(response.data.message);
            },
            (geoError) => {
              console.error(geoError);
              alert(
                "Location access denied. You must enable GPS location permissions to mark attendance.",
              );
            },
            { enableHighAccuracy: true },
          );
        } catch (error) {
          console.log(error);
          alert("Error Marking Attendance");
        }
      },
      // ERROR CALLBACK
      (error) => {
        console.log(error);
      },
    );
  };

  return (
    <DashboardLayout role="student">
      <div className="page-container">
        <h1>Scan Attendance QR</h1>

        {/* BUTTON */}
        <button className="generate-btn" onClick={startScanner}>
          Start Scanner
        </button>

        {/* QR CAMERA */}
        <div
          id="reader"
          style={{
            width: "350px",
            marginTop: "30px",
          }}
        />

        {/* RESULT */}
        {scanResult && (
          <div className="qr-box">
            <h3>Attendance Captured</h3>

            <p>
              <strong>Subject:</strong> {scanResult.subject}
            </p>

            <p>
              <strong>Session ID:</strong> {scanResult.sessionId}
            </p>

            <p>
              <strong>Timestamp:</strong> {scanResult.timestamp}
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default ScanQR;
