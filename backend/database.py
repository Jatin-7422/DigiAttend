from pymongo import MongoClient

MONGO_URL = "mongodb+srv://admin:admin123@digiattend.h1xpcjn.mongodb.net/?retryWrites=true&w=majority&appName=Digiattend"

client = MongoClient(MONGO_URL)

db = client["digiattend"]

attendance_collection = db["attendance"]