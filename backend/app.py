from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from uuid import uuid4
from contextlib import asynccontextmanager

from classifier import classify_issue
from database import connect_to_mongo, close_mongo_connection, get_database

# --- Lifecycle Management ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()

app = FastAPI(title="Tenant Watch Backend", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Models ---
class CreateIssueRequest(BaseModel):
    title: str
    description: str
    category: Optional[str] = None
    location: str
    landlordName: str

class IssueModel(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    title: str
    description: str
    category: str
    location: str
    landlordName: str
    upvotes: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True

class ClassifyRequest(BaseModel):
    description: str

# --- Endpoints ---

@app.get("/")
def read_root():
    return {"message": "TenantWatch API is running"}

@app.post("/classify")
def classify(request: ClassifyRequest): 
    return classify_issue(request.description)

@app.post("/issues", response_description="Add new issue", response_model=IssueModel)
async def create_issue(issue: CreateIssueRequest):
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database not initialized")

    # Auto-classify if category is missing
    final_category = issue.category
    if not final_category:
        classification = classify_issue(issue.description)
        # Capitalize first letter to match frontend types
        cat_raw = classification.get("category", "Safety")
        final_category = cat_raw.capitalize() 

    new_issue = IssueModel(
        title=issue.title,
        description=issue.description,
        category=final_category,
        location=issue.location,
        landlordName=issue.landlordName
    )
    
    new_issue_dict = new_issue.model_dump(by_alias=True)
    
    try:
        await db["issues"].insert_one(new_issue_dict)
        return new_issue
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/issues", response_description="List all issues", response_model=List[IssueModel])
async def list_issues():
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database not initialized")
        
    issues = await db["issues"].find().to_list(1000)
    return issues

@app.put("/issues/{id}/upvote")
async def upvote_issue(id: str):
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database not initialized")

    result = await db["issues"].update_one(
        {"_id": id},
        {"$inc": {"upvotes": 1}}
    )
    
    if result.modified_count == 1:
        return {"message": "Upvoted successfully"}
    
    raise HTTPException(status_code=404, detail=f"Issue {id} not found")

