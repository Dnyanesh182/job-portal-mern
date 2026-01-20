import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Plus, Edit2, Trash2, Users, Loader2, X, Eye } from 'lucide-react';
import { useStore } from '../store';
import { jobsAPI, applicationsAPI } from '../services/api';
import { Job, Application, User } from '../types';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

interface JobWithApplications extends Job {
  applicationCount?: number;
}

interface ApplicationWithDetails extends Application {
  applicant: User;
  job: Job;
}

function EmployerDashboard() {
  const navigate = useNavigate();
  const isDarkMode = useStore((state) => state.isDarkMode);
  const currentUser = useStore((state) => state.currentUser);
  const isAuthenticated = useStore((state) => state.isAuthenticated);

  const [jobs, setJobs] = useState<JobWithApplications[]>([]);
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedJobApplicants, setSelectedJobApplicants] = useState<ApplicationWithDetails[]>([]);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [jobForm, setJobForm] = useState({
    title: '',
    location: '',
    type: 'Full-time',
    salary: '',
    description: '',
    requirements: '',
    category: '',
    experience: '',
  });

  useEffect(() => {
    if (!isAuthenticated || currentUser?.role !== 'employer') {
      navigate('/login');
      return;
    }
    fetchData();
  }, [isAuthenticated, currentUser]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobsData, applicationsData] = await Promise.all([
        jobsAPI.getMyJobs(),
        applicationsAPI.getAllEmployerApplications(),
      ]);
      setJobs(jobsData);
      setApplications(applicationsData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const jobData = {
        ...jobForm,
        requirements: jobForm.requirements.split('\n').filter(r => r.trim()),
      };

      if (editingJob) {
        await jobsAPI.update(editingJob._id || editingJob.id!, jobData);
      } else {
        await jobsAPI.create(jobData);
      }

      await fetchData();
      setShowJobModal(false);
      resetJobForm();
    } catch (err) {
      console.error('Failed to save job:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job? This will also delete all applications.')) return;

    try {
      await jobsAPI.delete(jobId);
      await fetchData();
    } catch (err) {
      console.error('Failed to delete job:', err);
    }
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setJobForm({
      title: job.title,
      location: job.location,
      type: job.type,
      salary: job.salary,
      description: job.description,
      requirements: job.requirements.join('\n'),
      category: job.category,
      experience: job.experience || '',
    });
    setShowJobModal(true);
  };

  const handleViewApplicants = async (job: Job) => {
    setSelectedJob(job);
    try {
      const applicants = await applicationsAPI.getJobApplications(job._id || job.id!);
      setSelectedJobApplicants(applicants);
      setShowApplicantsModal(true);
    } catch (err) {
      console.error('Failed to fetch applicants:', err);
    }
  };

  const handleUpdateApplicationStatus = async (applicationId: string, status: Application['status']) => {
    try {
      await applicationsAPI.updateStatus(applicationId, status);
      // Refresh applicants
      if (selectedJob) {
        const applicants = await applicationsAPI.getJobApplications(selectedJob._id || selectedJob.id!);
        setSelectedJobApplicants(applicants);
      }
      await fetchData();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const resetJobForm = () => {
    setEditingJob(null);
    setJobForm({
      title: '',
      location: '',
      type: 'Full-time',
      salary: '',
      description: '',
      requirements: '',
      category: '',
      experience: '',
    });
  };

  // Stats calculations
  const totalApplications = applications.length;
  const pendingApplications = applications.filter(a => a.status === 'pending').length;
  const acceptedApplications = applications.filter(a => a.status === 'accepted').length;

  const categoryData = Object.entries(
    jobs.reduce((acc, job) => {
      acc[job.category] = (acc[job.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className={`ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Employer Dashboard</h1>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
            Welcome back, {currentUser?.name}
          </p>
        </div>
        <button
          onClick={() => { resetJobForm(); setShowJobModal(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Post New Job
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-md`}>
          <h3 className="text-lg font-semibold mb-2">Active Jobs</h3>
          <p className="text-3xl font-bold text-blue-600">{jobs.filter(j => j.isActive !== false).length}</p>
        </div>
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-md`}>
          <h3 className="text-lg font-semibold mb-2">Total Applications</h3>
          <p className="text-3xl font-bold text-green-600">{totalApplications}</p>
        </div>
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-md`}>
          <h3 className="text-lg font-semibold mb-2">Pending Review</h3>
          <p className="text-3xl font-bold text-yellow-600">{pendingApplications}</p>
        </div>
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-md`}>
          <h3 className="text-lg font-semibold mb-2">Hired</h3>
          <p className="text-3xl font-bold text-purple-600">{acceptedApplications}</p>
        </div>
      </div>

      {/* Charts */}
      {categoryData.length > 0 && (
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-md mb-8`}>
          <h2 className="text-xl font-bold mb-4">Jobs by Category</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Jobs Table */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden`}>
        <h2 className="text-xl font-bold p-6 border-b border-gray-700">Your Job Listings</h2>
        {jobs.length === 0 ? (
          <div className="p-6 text-center">
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
              You haven't posted any jobs yet. Click "Post New Job" to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className="px-6 py-3 text-left">Job Title</th>
                  <th className="px-6 py-3 text-left">Category</th>
                  <th className="px-6 py-3 text-left">Type</th>
                  <th className="px-6 py-3 text-left">Applications</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(job => (
                  <tr key={job._id || job.id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4 font-medium">{job.title}</td>
                    <td className="px-6 py-4">{job.category}</td>
                    <td className="px-6 py-4">{job.type}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewApplicants(job)}
                        className="flex items-center text-blue-600 hover:underline"
                      >
                        <Users className="w-4 h-4 mr-1" />
                        {job.applicationCount || 0}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${job.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                        {job.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewApplicants(job)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Applicants"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEditJob(job)}
                          className="text-yellow-600 hover:text-yellow-800"
                          title="Edit"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job._id || job.id!)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Job Modal */}
      {showJobModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{editingJob ? 'Edit Job' : 'Post New Job'}</h2>
              <button onClick={() => setShowJobModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={jobForm.title}
                    onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                    className={`w-full p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} border`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Location *
                  </label>
                  <input
                    type="text"
                    value={jobForm.location}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                    className={`w-full p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} border`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Job Type *
                  </label>
                  <select
                    value={jobForm.type}
                    onChange={(e) => setJobForm({ ...jobForm, type: e.target.value })}
                    className={`w-full p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} border`}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Salary Range *
                  </label>
                  <input
                    type="text"
                    value={jobForm.salary}
                    onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })}
                    placeholder="e.g., $80,000 - $100,000"
                    className={`w-full p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} border`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Category *
                  </label>
                  <input
                    type="text"
                    value={jobForm.category}
                    onChange={(e) => setJobForm({ ...jobForm, category: e.target.value })}
                    placeholder="e.g., Development, Design, Marketing"
                    className={`w-full p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} border`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Experience Level
                  </label>
                  <input
                    type="text"
                    value={jobForm.experience}
                    onChange={(e) => setJobForm({ ...jobForm, experience: e.target.value })}
                    placeholder="e.g., 3-5 years"
                    className={`w-full p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} border`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Description *
                </label>
                <textarea
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  rows={4}
                  className={`w-full p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} border`}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Requirements (one per line)
                </label>
                <textarea
                  value={jobForm.requirements}
                  onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                  rows={4}
                  placeholder="Enter each requirement on a new line"
                  className={`w-full p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} border`}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowJobModal(false)}
                  className={`flex-1 py-2 rounded-lg border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingJob ? 'Update Job' : 'Post Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Applicants Modal */}
      {showApplicantsModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Applicants for {selectedJob.title}</h2>
              <button onClick={() => setShowApplicantsModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            {selectedJobApplicants.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No applications yet.</p>
            ) : (
              <div className="space-y-4">
                {selectedJobApplicants.map(app => (
                  <div key={app._id || app.id} className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{(app.applicant as User).name}</h3>
                        <p className="text-sm text-gray-500">{(app.applicant as User).email}</p>
                        {(app.applicant as User).location && (
                          <p className="text-sm text-gray-500">{(app.applicant as User).location}</p>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          app.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                            app.status === 'shortlisted' ? 'bg-purple-100 text-purple-800' :
                              app.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                        }`}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </div>

                    {(app.applicant as User).skills && (app.applicant as User).skills!.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {(app.applicant as User).skills!.map((skill, i) => (
                          <span key={i} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mb-3">
                      <h4 className="text-sm font-medium mb-1">Cover Letter:</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{app.coverLetter}</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateApplicationStatus(app._id || app.id!, 'reviewed')}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200"
                      >
                        Mark Reviewed
                      </button>
                      <button
                        onClick={() => handleUpdateApplicationStatus(app._id || app.id!, 'shortlisted')}
                        className="px-3 py-1 bg-purple-100 text-purple-800 rounded text-sm hover:bg-purple-200"
                      >
                        Shortlist
                      </button>
                      <button
                        onClick={() => handleUpdateApplicationStatus(app._id || app.id!, 'accepted')}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleUpdateApplicationStatus(app._id || app.id!, 'rejected')}
                        className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployerDashboard;