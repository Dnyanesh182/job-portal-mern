import { Job, Application, User } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper to get auth token
const getToken = (): string | null => {
    return localStorage.getItem('token');
};

// Helper for fetch with auth
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = getToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${API_URL}${url}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
    }

    return data;
};

// ==================== AUTH API ====================

export const authAPI = {
    register: async (userData: {
        name: string;
        email: string;
        password: string;
        role: 'employer' | 'jobseeker';
        company?: string;
    }) => {
        const response = await fetchWithAuth('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
        return response.data;
    },

    login: async (credentials: { email: string; password: string }) => {
        const response = await fetchWithAuth('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
        return response.data;
    },

    getProfile: async () => {
        const response = await fetchWithAuth('/auth/profile');
        return response.data;
    },

    updateProfile: async (profileData: Partial<User>) => {
        const response = await fetchWithAuth('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData),
        });
        return response.data;
    },
};

// ==================== JOBS API ====================

export interface JobsQueryParams {
    search?: string;
    category?: string;
    type?: string;
    location?: string;
    page?: number;
    limit?: number;
}

export const jobsAPI = {
    getAll: async (params: JobsQueryParams = {}) => {
        const queryString = new URLSearchParams(
            Object.entries(params)
                .filter(([_, v]) => v !== undefined && v !== '')
                .map(([k, v]) => [k, String(v)])
        ).toString();

        const response = await fetchWithAuth(`/jobs${queryString ? `?${queryString}` : ''}`);
        return response;
    },

    getById: async (id: string) => {
        const response = await fetchWithAuth(`/jobs/${id}`);
        return response.data;
    },

    getCategories: async () => {
        const response = await fetchWithAuth('/jobs/categories');
        return response.data;
    },

    // Employer endpoints
    getMyJobs: async () => {
        const response = await fetchWithAuth('/jobs/employer/my-jobs');
        return response.data;
    },

    create: async (jobData: Partial<Job>) => {
        const response = await fetchWithAuth('/jobs', {
            method: 'POST',
            body: JSON.stringify(jobData),
        });
        return response.data;
    },

    update: async (id: string, jobData: Partial<Job>) => {
        const response = await fetchWithAuth(`/jobs/${id}`, {
            method: 'PUT',
            body: JSON.stringify(jobData),
        });
        return response.data;
    },

    delete: async (id: string) => {
        const response = await fetchWithAuth(`/jobs/${id}`, {
            method: 'DELETE',
        });
        return response;
    },
};

// ==================== APPLICATIONS API ====================

export const applicationsAPI = {
    apply: async (applicationData: { jobId: string; coverLetter: string; resume?: string }) => {
        const response = await fetchWithAuth('/applications', {
            method: 'POST',
            body: JSON.stringify(applicationData),
        });
        return response.data;
    },

    getMyApplications: async () => {
        const response = await fetchWithAuth('/applications/my-applications');
        return response.data;
    },

    getJobApplications: async (jobId: string) => {
        const response = await fetchWithAuth(`/applications/job/${jobId}`);
        return response.data;
    },

    getAllEmployerApplications: async () => {
        const response = await fetchWithAuth('/applications/employer/all');
        return response.data;
    },

    updateStatus: async (id: string, status: Application['status'], notes?: string) => {
        const response = await fetchWithAuth(`/applications/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status, notes }),
        });
        return response.data;
    },

    withdraw: async (id: string) => {
        const response = await fetchWithAuth(`/applications/${id}`, {
            method: 'DELETE',
        });
        return response;
    },
};
