from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from classifier import classify_issue

app = FastAPI(title="Tenant Watch Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Issue(BaseModel):
    description: str

@app.get("/")
def read_root():
    return {"status": "Backend is running", "docs": "/docs"}

@app.post("/classify")
def classify(issue: Issue):
    return classify_issue(issue.description)

