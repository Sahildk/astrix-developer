"""
Seed script to populate MongoDB with demo data
Run this script once to add 60 realistic housing issues to your database
"""

import asyncio
import os
from datetime import datetime, timedelta
import random
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from uuid import uuid4

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

neighborhoods = [
    "Indiranagar", "Koramangala", "Whitefield", "HSR Layout", "Jayanagar",
    "Bandra West", "Andheri East", "Powai", "Colaba", "Dadar",
    "Connaught Place", "Saket", "Dwarka", "Vasant Kunj", "Lajpat Nagar"
]

landlords = [
    "Sharma Properties", "Reddy Estates", "Gupta Housing", "Prestige Group", 
    "Sobha Developers", "Brigade Group", "DLF Ltd", "Godrej Properties", 
    "Oberoi Realty", "Private Owner"
]

categories = ['Safety', 'Maintenance', 'Harassment', 'Discrimination']
statuses = ['Reported', 'Under Review', 'Resolved', 'Dismissed']

issue_templates = {
    'Safety': [
        ("Unsafe wiring in {location} complex", "Exposed live wires in the common hallway. Fire hazard."),
        ("Broken fire exit at {location}", "Emergency exit door is jammed and cannot be opened."),
        ("Gas leak in building", "Strong gas smell reported by multiple tenants in {location}."),
        ("Stray dogs attacking residents", "Aggressive stray dogs in the compound pose safety risk."),
    ],
    'Maintenance': [
        ("Broken elevator in Block B", "Elevator has been non-functional for 3 weeks despite repeated requests."),
        ("Leakage in ceiling at {location}", "Water dripping from ceiling causing damage to furniture."),
        ("No water supply for 2 days", "Building water tank empty, no response from landlord."),
        ("Mold growth ignored by owner", "Black mold spreading in bathroom, health hazard."),
    ],
    'Harassment': [
        ("Landlord intrusion without notice", "Landlord enters the apartment without prior notice or permission."),
        ("Security guard harassing female tenants", "Inappropriate comments and behavior by security staff."),
        ("Constant surveillance by owner", "CCTV cameras pointed at private balcony and windows."),
        ("Illegal construction noise at night", "Construction work happening past 10 PM violating noise norms."),
    ],
    'Discrimination': [
        ("Denied rental based on dietary habits", "Refused housing because of non-vegetarian food preferences."),
        ("Discriminatory rules for bachelors", "Single tenants charged higher rent and deposits."),
        ("Religious discrimination", "Landlord refused to rent to tenant based on religion."),
        ("Caste-based discrimination", "Denied apartment viewing due to caste background."),
    ]
}

async def generate_issues(count=60):
    """Generate realistic housing issues"""
    issues = []
    
    for i in range(count):
        category = random.choice(categories)
        status = random.choice(statuses)
        neighborhood = random.choice(neighborhoods)
        landlord = random.choice(landlords)
        
        # Pick a template for this category
        template = random.choice(issue_templates[category])
        title = template[0].format(location=neighborhood)
        description = template[1]
        
        # Random date within last 6 months
        days_ago = random.randint(0, 180)
        issue_date = datetime.now() - timedelta(days=days_ago)
        
        issue = {
            "_id": str(uuid4()),
            "title": title,
            "description": description,
            "category": category,
            "status": status,
            "location": neighborhood,
            "landlordName": landlord,
            "date": issue_date.isoformat(),
            "upvotes": random.randint(0, 50),
            "isVerified": random.random() > 0.7
        }
        
        issues.append(issue)
    
    return issues

async def seed_database():
    """Connect to MongoDB and insert seed data"""
    if not MONGO_URI:
        print("❌ Error: MONGO_URI not found in .env file")
        print("Please add your MongoDB Atlas connection string to the .env file")
        return
    
    try:
        print("🔌 Connecting to MongoDB Atlas...")
        client = AsyncIOMotorClient(MONGO_URI)
        db = client.tenant_watch
        
        # Test connection
        await client.admin.command('ping')
        print("✅ Connected to MongoDB successfully!")
        
        # Check if collection already has data
        existing_count = await db.issues.count_documents({})
        if existing_count > 0:
            print(f"⚠️  Database already has {existing_count} issues.")
            response = input("Do you want to clear and reseed? (yes/no): ")
            if response.lower() == 'yes':
                await db.issues.delete_many({})
                print("🗑️  Cleared existing data")
            else:
                print("❌ Seeding cancelled")
                client.close()
                return
        
        # Generate and insert issues
        print("🌱 Generating 60 realistic housing issues...")
        issues = await generate_issues(60)
        
        print("💾 Inserting into database...")
        result = await db.issues.insert_many(issues)
        
        print(f"✅ Successfully seeded {len(result.inserted_ids)} issues!")
        print(f"📊 Database: tenant_watch")
        print(f"📦 Collection: issues")
        
        # Show some stats
        safety_count = await db.issues.count_documents({"category": "Safety"})
        maintenance_count = await db.issues.count_documents({"category": "Maintenance"})
        harassment_count = await db.issues.count_documents({"category": "Harassment"})
        discrimination_count = await db.issues.count_documents({"category": "Discrimination"})
        
        print("\n📈 Issue Breakdown:")
        print(f"   Safety: {safety_count}")
        print(f"   Maintenance: {maintenance_count}")
        print(f"   Harassment: {harassment_count}")
        print(f"   Discrimination: {discrimination_count}")
        
        client.close()
        print("\n🎉 Seeding complete! Your database is ready.")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(seed_database())
