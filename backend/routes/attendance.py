from fastapi import APIRouter
from datetime import datetime, timezone

from database import attendance_collection

router = APIRouter(
    prefix="/attendance",
    tags=["Attendance"]
)

# MARK ATTENDANCE

@router.post("/mark")
async def mark_attendance(data: dict):

    # =========================
    # VALIDATION CHECK
    # =========================

    required_fields = [
        "studentUID",
        "studentName",
        "studentEmail",
        "subject",
        "sessionId",
        "createdAt"
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