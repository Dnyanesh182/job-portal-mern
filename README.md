# 🚀 Job Portal - MERN Stack Application

A full-stack job portal built with **MongoDB, Express.js, React, and Node.js** featuring user authentication, job listings with CRUD operations, and separate dashboards for employers and job seekers.

## ✨ Features

### User Authentication
- JWT-based authentication with secure password hashing (bcrypt)
- Role-Based Access Control (RBAC) - Employers and Job Seekers
- Persistent login sessions with token storage

### For Employers
- **Dashboard** with statistics (active jobs, applications, hires)
- **Post new jobs** with detailed descriptions, requirements, salary
- **Edit/Delete** job listings
- **View applicants** for each job posting
- **Manage applications** - Accept, Reject, Shortlist candidates

### For Job Seekers
- **Browse jobs** with search and filtering (category, type, location)
- **Apply to jobs** with cover letter
- **Track applications** with status updates
- **Dashboard** showing application statistics and history
- **Withdraw applications** if needed

### Additional Features
- 🌙 Dark mode toggle
- 📱 Responsive design
- 📊 Visual analytics with charts (Recharts)
- 🔍 Real-time search and filtering

---

## 🛠️ Tech Stack

| Frontend | Backend | Database |
|----------|---------|----------|
| React 18 | Express.js | MongoDB |
| TypeScript | Node.js | Mongoose |
| TailwindCSS | JWT Auth | - |
| Zustand | bcryptjs | - |
| React Router | - | - |

---

## 📦 Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd project
```

### 2. Backend Setup
```bash
cd server
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Update .env with your MongoDB URI
# MONGODB_URI=mongodb://localhost:27017/job-portal
# or use MongoDB Atlas connection string

npm run dev
```
The server will start on `http://localhost:5000`

### 3. Frontend Setup
```bash
# In a new terminal, from project root
npm install
npm run dev
```
The app will start on `http://localhost:5173`

---

## 🔑 Environment Variables

### Backend (`server/.env`)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/job-portal
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

---

## 📁 Project Structure

```
project/
├── src/                    # Frontend (React)
│   ├── components/         # Reusable components
│   ├── pages/              # Page components
│   ├── services/           # API service layer
│   ├── store/              # Zustand state management
│   └── types/              # TypeScript interfaces
│
├── server/                 # Backend (Express)
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── middleware/     # Auth middleware
│   │   ├── models/         # Mongoose models
│   │   └── routes/         # API routes
│   └── package.json
│
└── package.json
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/profile` | Get profile (protected) |
| PUT | `/api/auth/profile` | Update profile (protected) |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs` | Get all jobs (with filters) |
| GET | `/api/jobs/:id` | Get job by ID |
| GET | `/api/jobs/categories` | Get all categories |
| POST | `/api/jobs` | Create job (employer) |
| PUT | `/api/jobs/:id` | Update job (employer) |
| DELETE | `/api/jobs/:id` | Delete job (employer) |

### Applications
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/applications` | Apply for job (job seeker) |
| GET | `/api/applications/my-applications` | Get my applications |
| GET | `/api/applications/job/:jobId` | Get job applicants (employer) |
| PUT | `/api/applications/:id/status` | Update status (employer) |
| DELETE | `/api/applications/:id` | Withdraw application |

---

## 🎯 Usage Guide

### As an Employer
1. Register with role "Employer" and company name
2. Login and access Employer Dashboard
3. Click "Post New Job" to create listings
4. View applicants by clicking the count in your jobs table
5. Accept/Reject/Shortlist candidates

### As a Job Seeker
1. Register with role "Job Seeker"
2. Browse jobs on the Jobs page
3. Click on a job to view details and apply
4. Track your applications in the Dashboard
5. Withdraw pending applications if needed

---

## 🚀 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set build command: `npm run build`
4. Set output directory: `dist`

### Backend (Render/Railway)
1. Create new Web Service
2. Connect GitHub repository
3. Set root directory: `server`
4. Set build command: `npm install && npm run build`
5. Set start command: `npm start`
6. Add environment variables

---

## 📝 License

MIT License - feel free to use for your projects!

---

Built with ❤️ using the MERN Stack
