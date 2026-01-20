export interface Job {
  id?: string;
  _id?: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  salaryMin?: number;
  salaryMax?: number;
  description: string;
  requirements: string[];
  responsibilities?: string[];
  benefits?: string[];
  postedDate?: string;
  createdAt?: string;
  category: string;
  experience?: string;
  isActive?: boolean;
  postedBy?: string | { name: string; company: string; email?: string };
  applicationCount?: number;
}

export interface Application {
  id?: string;
  _id?: string;
  job: string | Job;
  jobId?: string;
  userId?: string;
  applicant?: string | User;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted';
  appliedDate?: string;
  createdAt?: string;
  coverLetter: string;
  resume?: string;
  notes?: string;
}

export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: 'employer' | 'jobseeker';
  company?: string;
  phone?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  resume?: string;
  avatar?: string;
}