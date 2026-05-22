import math
from fastapi import APIRouter
from datetime import datetime, timezone

from database import attendance_collection

router = APIRouter(
    prefix="/attendance",
    tags=["Attendance"]
)

# HELPER FUNCTION: Calculates distance between two GPS coordinates in meters
def calculate_haversine_distance(lat1, lon1, lat2, lon2):
    # Radius of the Earth in meters
    R = 6371000.0 
    
    # Convert degrees to radians
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    
    # Haversine formula calculation
    a = math.sin(delta_phi / 2.0)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0)**2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    
    distance = R * c
    return distance


# MARK ATTENDANCE

@router.post("/mark")
async def mark_attendance(data: dict):

    # =========================
    # CHNG MATCHING PARAMETERS: FALLBACK FOR FRONTEND KEYS
    # =========================
    # If the student app passes "timestamp", copy it to "createdAt" 
    # so your validation loop below does not reject it.
    if "createdAt" not in data and "timestamp" in data:
        data["createdAt"] = data["timestamp"]

    # =========================
    # VALIDATION CHECK
    # =========================

    required_fields = [
        "studentUID",
        "studentName",
        "studentEmail",
        "subject",
        "sessionId",
        "createdAt",
        "studentLat",
        "studentLon",
        "teacherLat",
        "teacherLon"
    ]

    for field in required_fields:

        if field not in data:

            return {
                "message":
                f"{field} is missing"
            }

    # =========================
    # DUPLICATE CHECK
    # =========================

    existing = attendance_collection.find_one({

        "studentUID":
        data["studentUID"],

        "sessionId":
        data["sessionId"]

    })

    if existing:

        return {
            "message":
            "Attendance Already Marked"
        }

    # =========================
    # GEOFENCING CHECK
    # =========================

    distance = calculate_haversine_distance(
        data["teacherLat"], data["teacherLon"],
        data["studentLat"], data["studentLon"]
    )
    
    data["distanceMeters"] = round(distance, 2)

    if distance > 20.0:

        data["status"] = "Absent"
        
        data["scannedAt"] = datetime.now(
            timezone.utc
        ).isoformat()
        
        attendance_collection.insert_one(data)
        
        return {
            "message": f"Proxy Detected! You are too far from the classroom ({round(distance, 1)}m away). Marked as Absent.",
            "status": "Absent"
        }

    # =========================
    # QR EXPIRY CHECK
    # =========================

    try:

        # Convert QR Timestamp

        qr_created_time = datetime.fromisoformat(
            data["createdAt"].replace("Z", "+00:00")
        )

        # Current UTC Time

        current_time = datetime.now(
            timezone.utc
        )

        # Time Difference In Seconds

        time_difference = (
            current_time - qr_created_time
        ).total_seconds()

        # =========================
        # ATTENDANCE STATUS
        # =========================

        # QR VALID FOR 5 min

        if time_difference > 300:

            data["status"] = "Absent"

            message_response = (
                "QR Expired - "
                "Attendance Marked As Absent"
            )

        else:

            data["status"] = "Present"

            message_response = (
                "Attendance Marked Successfully"
            )

    except Exception as error:

        return {
            "message":
            "Invalid QR Timestamp"
        }

    # =========================
    # SAVE SCAN TIME
    # =========================

    data["scannedAt"] = datetime.now(
        timezone.utc
    ).isoformat()

    # =========================
    # INSERT INTO MONGODB
    # =========================

    attendance_collection.insert_one(data)

    # =========================
    # RESPONSE
    # =========================

    return {

        "message":
        message_response,

        "status":
        data["status"]

    }


# =========================
# STUDENT HISTORY API
# =========================

@router.get("/student/{uid}")

async def get_student_attendance(uid: str):

    records = list(

        attendance_collection.find(

            {
                "studentUID": uid
            },

            {
                "_id": 0
            }

        )

    )

    return records


# =========================
# TEACHER ALL RECORDS API
# =========================

@router.get("/all")

async def get_all_attendance():

    records = list(

        attendance_collection.find(

            {},

            {
                "_id": 0
            }

        )

    )

    return records