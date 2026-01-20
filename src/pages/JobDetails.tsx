import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Building2, Clock, DollarSign, Briefcase, CheckCircle, ArrowLeft, Loader2, Send } from 'lucide-react';
import { useStore } from '../store';
import { jobsAPI, applicationsAPI } from '../services/api';
import { Job } from '../types';

function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isDarkMode = useStore((state) => state.isDarkMode);
  const currentUser = useStore((state) => state.currentUser);
  const isAuthenticated = useStore((state) => state.isAuthenticated);

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const [applicationError, setApplicationError] = useState('');

  useEffect(() => {
    if (id) {
      fetchJob();
    }
  }, [id]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const data = await jobsAPI.getById(id!);
      setJob(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch job details');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverLetter.trim()) {
      setApplicationError('Please write a cover letter');
      return;
    }

    setApplying(true);
    setApplicationError('');

    try {
      await applicationsAPI.apply({
        jobId: id!,
        coverLetter: coverLetter.trim(),
      });
      setApplicationSuccess(true);
      setShowApplyModal(false);
      setCoverLetter('');
    } catch (err: any) {
      setApplicationError(err.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recently';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className={`ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Loading job details...</span>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error || 'Job not found'}</p>
        <Link to="/jobs" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Back to Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className={`flex items-center mb-6 ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Jobs
      </button>

      {/* Success message */}
      {applicationSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          Application submitted successfully! Check your dashboard to track its status.
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="md:col-span-2">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 mb-6`}>
            <h1 className="text-3xl font-bold mb-4">{job.title}</h1>

            <div className={`flex flex-wrap gap-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
              <div className="flex items-center">
                <Building2 className="w-5 h-5 mr-2" />
                {job.company}
              </div>
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                {job.location}
              </div>
              <div className="flex items-center">
                <Briefcase className="w-5 h-5 mr-2" />
                {job.type}
              </div>
              <div className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                {job.salary}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {job.category}
              </span>
              {job.experience && (
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                  {job.experience}
                </span>
              )}
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Description</h2>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} whitespace-pre-line`}>
                {job.description}
              </p>
            </div>

            {job.requirements && job.requirements.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">Requirements</h2>
                <ul className="list-disc list-inside space-y-2">
                  {job.requirements.map((req, index) => (
                    <li key={index} className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {job.responsibilities && job.responsibilities.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">Responsibilities</h2>
                <ul className="list-disc list-inside space-y-2">
                  {job.responsibilities.map((resp, index) => (
                    <li key={index} className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                      {resp}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {job.benefits && job.benefits.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-3">Benefits</h2>
                <ul className="list-disc list-inside space-y-2">
                  {job.benefits.map((benefit, index) => (
                    <li key={index} className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 sticky top-4`}>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
              <Clock className="w-4 h-4 inline mr-1" />
              Posted {formatDate(job.createdAt || job.postedDate)}
            </div>

            {isAuthenticated && currentUser?.role === 'jobseeker' ? (
              applicationSuccess ? (
                <div className="bg-green-100 text-green-800 p-4 rounded-lg text-center">
                  <CheckCircle className="w-6 h-6 mx-auto mb-2" />
                  Application Submitted!
                </div>
              ) : (
                <button
                  onClick={() => setShowApplyModal(true)}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Apply Now
                </button>
              )
            ) : isAuthenticated && currentUser?.role === 'employer' ? (
              <p className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Employers cannot apply for jobs
              </p>
            ) : (
              <div className="space-y-3">
                <Link
                  to="/login"
                  className="block w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition text-center"
                >
                  Sign in to Apply
                </Link>
                <Link
                  to="/register"
                  className={`block w-full border py-3 rounded-lg text-center ${isDarkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'
                    } transition`}
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-lg`}>
            <h2 className="text-2xl font-bold mb-4">Apply for {job.title}</h2>

            {applicationError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {applicationError}
              </div>
            )}

            <form onSubmit={handleApply}>
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Cover Letter *
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={6}
                  placeholder="Tell the employer why you're a great fit for this role..."
                  className={`w-full p-3 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} border focus:ring-2 focus:ring-blue-500`}
                  required
                  disabled={applying}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className={`flex-1 py-3 rounded-lg border ${isDarkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'
                    } transition`}
                  disabled={applying}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applying}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center"
                >
                  {applying ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobDetails;