"use client";

import { useState, useEffect } from 'react';
import { Issue, MOCK_ISSUES } from './mock-data';

const STORAGE_KEY = 'tenant-watch-issues-v1';

export function useIssues() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load from local storage or seed with mock data
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setIssues(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse issues", e);
        setIssues(MOCK_ISSUES);
      }
    } else {
      setIssues(MOCK_ISSUES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_ISSUES));
    }
    setIsLoaded(true);
  }, []);

  const addIssue = (issue: Issue) => {
    const newIssues = [issue, ...issues];
    setIssues(newIssues);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newIssues));
  };

  const updateIssueStatus = (id: string, status: Issue['status']) => {
    const newIssues = issues.map(i => i.id === id ? { ...i, status } : i);
    setIssues(newIssues);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newIssues));
  };

  const upvoteIssue = (id: string) => {
    const newIssues = issues.map(i => i.id === id ? { ...i, upvotes: i.upvotes + 1 } : i);
    setIssues(newIssues);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newIssues));
  };

  return {
    issues,
    isLoaded,
    addIssue,
    updateIssueStatus,
    upvoteIssue
  };
}
