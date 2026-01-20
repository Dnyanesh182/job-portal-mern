import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Briefcase, Clock, CheckCircle, XCircle, AlertCircle, Loader2, ExternalLink, Trash2 } from 'lucide-react';
import { useStore } from '../store';
import { applicationsAPI } from '../services/api';
import { Application, Job } from '../types';

interface ApplicationWithJob extends Application {
  job: Job;
}

function JobSeekerDashboard() {
  const navigate = useNavigate();
  const isDarkMode = useStore((state) => state.isDarkMode);
  const currentUser = useStore((state) => state.currentUser);
  const isAuthenticated = useStore((state) => state.isAuthenticated);

  const [applications, setApplications] = useState<ApplicationWithJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (!isAuthenticated || currentUser?.role !== 'jobseeker') {
      navigate('/login');
      return;
    }
    fetchApplications();
  }, [isAuthenticated, currentUser]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await applicationsAPI.getMyApplications();
      setApplications(data);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (applicationId: string) => {
    if (!confirm('Are you sure you want to withdraw this application?')) return;

    try {
      await applicationsAPI.withdraw(applicationId);
      await fetchApplications();
    } catch (err: any) {
      alert(err.message || 'Failed to withdraw application');
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'reviewed':
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case 'shortlisted':
        return <AlertCircle className="w-5 h-5 text-purple-500" />;
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'shortlisted':
        return 'bg-purple-100 text-purple-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recently';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Stats
  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    reviewed: applications.filter(a => a.status === 'reviewed' || a.status === 'shortlisted').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Job Seeker Dashboard</h1>
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
          Welcome back, {currentUser?.name}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-5 gap-4 mb-8">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow-md`}>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Applied</h3>
          <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
        </div>
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow-md`}>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Pending</h3>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow-md`}>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Under Review</h3>
          <p className="text-2xl font-bold text-purple-600">{stats.reviewed}</p>
        </div>
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow-md`}>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Accepted</h3>
          <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
        </div>
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow-md`}>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Rejected</h3>
          <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'pending', 'reviewed', 'shortlisted', 'accepted', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg capitalize transition ${filter === status
                ? 'bg-blue-600 text-white'
                : isDarkMode
                  ? 'bg-gray-800 hover:bg-gray-700'
                  : 'bg-white hover:bg-gray-100'
              }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-8 text-center`}>
          <Briefcase className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
            {filter === 'all'
              ? "You haven't applied to any jobs yet."
              : `No ${filter} applications.`}
          </p>
          {filter === 'all' && (
            <Link
              to="/jobs"
              className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Browse Jobs
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map(app => {
            const job = app.job as Job;
            return (
              <div
                key={app._id || app.id}
                className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold mb-1">{job.title}</h3>
                        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
                          {job.company} • {job.location}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(app.status)}
                        <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(app.status)}`}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`px-2 py-1 rounded text-xs ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        {job.type}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        {job.salary}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        {job.category}
                      </span>
                    </div>

                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Applied on {formatDate(app.createdAt || app.appliedDate)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Link
                    to={`/jobs/${job._id || job.id}`}
                    className="flex items-center text-blue-600 hover:underline text-sm"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    View Job
                  </Link>
                  {['pending', 'reviewed'].includes(app.status) && (
                    <button
                      onClick={() => handleWithdraw(app._id || app.id!)}
                      className="flex items-center text-red-600 hover:underline text-sm"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Withdraw
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default JobSeekerDashboard;