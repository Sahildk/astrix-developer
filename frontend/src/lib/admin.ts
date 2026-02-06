export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface AdminIssue {
    id: string;
    title: string;
    description: string;
    category: string;
    location: string;
    landlordName: string;
    images: string[];
    upvotes: number;
    status: string;
    date: string;
    contactEmail?: string;
    contactPhone?: string;
}

export const adminLogin = async (username: string, password: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('admin_token', data.token);
            return true;
        }
    } catch (e) {
        console.error(e);
    }
    return false;
};

export const fetchAdminIssues = async (): Promise<AdminIssue[]> => {
    try {
        const response = await fetch(`${API_BASE}/admin/issues`);
        if (response.ok) {
            const data = await response.json();
            return data.map((d: any) => ({
                ...d,
                id: d._id || d.id
            }));
        }
    } catch (e) {
        console.error(e);
    }
    return [];
};

export const updateIssueStatus = async (id: string, status: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE}/admin/issues/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        return response.ok;
    } catch (e) {
        console.error(e);
    }
    return false;
};
