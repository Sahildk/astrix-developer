import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_DETAILS = os.getenv("MONGO_URI")

client = None
database = None

def get_database():
    return database

async def connect_to_mongo():
    global client, database
    if not MONGO_DETAILS:
        print("⚠️  MONGO_URI is not set in .env file.")
        return
    
    try:
        print("🔌 Connecting to MongoDB Atlas...")
        client = AsyncIOMotorClient(
            MONGO_DETAILS,
            serverSelectionTimeoutMS=5000  # 5 second timeout
        )
        # Test the connection
        await client.admin.command('ping')
        database = client.tenant_watch  # Database name
        print("✅ Connected to MongoDB Atlas!")
    except Exception as e:
        print(f"❌ Could not connect to MongoDB: {e}")
        print("⚠️  API will run but database operations will fail.")

async def close_mongo_connection():
    global client
    if client:
        client.close()
        print("MongoDB connection closed.")
