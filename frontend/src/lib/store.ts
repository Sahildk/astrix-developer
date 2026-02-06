"use client";

import { useState, useEffect } from 'react';
import { Issue } from './mock-data';

const API_BASE = 'http://localhost:8000';

export function useIssues() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Fetch issues from backend on mount
  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const response = await fetch(`${API_BASE}/issues`);
      if (response.ok) {
        const data = await response.json();
        // Map _id to id for frontend compatibility
        const mappedIssues = data.map((issue: any) => ({
          ...issue,
          id: issue._id || issue.id,
          date: issue.date || issue.created_at || new Date().toISOString() // robust fallback
        }));
        setIssues(mappedIssues);
      } else {
        console.error("Failed to fetch issues");
      }
    } catch (error) {
      console.error("Error fetching issues:", error);
    } finally {
      setIsLoaded(true);
    }
  };

  const addIssue = async (issue: Issue & { contactEmail?: string; contactPhone?: string }) => {
    try {
      const response = await fetch(`${API_BASE}/issues`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: issue.title,
          description: issue.description,
          location: issue.location,
          landlordName: issue.landlordName,
          category: issue.category,
          images: issue.images || [],
          status: issue.status || 'Reported',
          contactEmail: issue.contactEmail,
          contactPhone: issue.contactPhone
        }),
      });

      if (response.ok) {
        const newIssue = await response.json();
        const mappedIssue = {
          ...newIssue,
          id: newIssue._id || newIssue.id
        };
        setIssues([mappedIssue, ...issues]);
        return mappedIssue;
      }
    } catch (error) {
      console.error("Error adding issue:", error);
    }
  };

  const updateIssueStatus = async (id: string, status: Issue['status']) => {
    // This endpoint would need to be implemented in the backend
    const newIssues = issues.map(i => i.id === id ? { ...i, status } : i);
    setIssues(newIssues);
  };

  const upvoteIssue = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/issues/${id}/upvote`, {
        method: 'PUT',
      });

      if (response.ok) {
        // Optimistically update UI
        const newIssues = issues.map(i =>
          i.id === id ? { ...i, upvotes: i.upvotes + 1 } : i
        );
        setIssues(newIssues);
      }
    } catch (error) {
      console.error("Error upvoting issue:", error);
    }
  };

  return {
    issues,
    isLoaded,
    addIssue,
    updateIssueStatus,
    upvoteIssue
  };
}
