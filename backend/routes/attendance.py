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

    # 1. CHECK DUPLICATE
    existing = attendance_collection.find_one({
        "studentUID": data["studentUID"],
        "sessionId": data["sessionId"]
    })

    if existing:
        return {
            "message": "Attendance Already Marked"
        }

    # 2. ENFORCE 1-HOUR QR EXPIRATION RULE
    # We grab the 'createdAt' timestamp embedded in the QR data string
    # Expected incoming format from QR scan: "2026-05-20T10:00:00Z" (ISO format string)
    if "createdAt" in data:
        try:
            # Parse the string timestamp into a Python datetime object
            # Replacing 'Z' with '+00:00' makes it explicitly timezone-aware in older Python versions
            clean_timestamp = data["createdAt"].replace("Z", "+00:00")
            session_start_time = datetime.fromisoformat(clean_timestamp)
            
            # Get the exact current time the student is hitting this endpoint
            current_time = datetime.now(timezone.utc)
            
            # Calculate the difference in hours
            time_difference = current_time - session_start_time
            hours_passed = time_difference.total_seconds() / 3600
            
            # If more than 1.0 hour (60 minutes) has passed, mark them Absent
            if hours_passed > 1.0:
                data["status"] = "Absent"
                message_response = "Attendance marked as Absent (QR Code Expired)"
            else:
                data["status"] = "Present"
                message_response = "Attendance Marked Successfully"
                
        except Exception as e:
            # Fallback safety: if date parsing fails, default them to Present so they don't get stuck
            data["status"] = "Present"
            message_response = "Attendance Marked Successfully"
    else:
        # Fallback if your frontend QR data doesn't include 'createdAt' yet
        data["status"] = "Present"
        message_response = "Attendance Marked Successfully"

    # 3. SAVE THE CURRENT SCAN TIMESTAMP FOR THE HISTORY VIEW
    data["timestamp"] = datetime.now(timezone.utc).isoformat()

    # 4. INSERT DATA TO MONGO
    attendance_collection.insert_one(data)

    return {
        "message": message_response
    }


# STUDENT HISTORY API
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


# TEACHER ALL RECORDS API
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