import os

from motor.motor_asyncio import AsyncIOMotorClient


MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "agro_platform")

mongo_client = AsyncIOMotorClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
database = mongo_client[MONGODB_DB_NAME]


def get_user_collection():
    return database["users"]


async def close_mongo_connection():
    mongo_client.close()