import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Briefcase, Building2, Users, ArrowRight, TrendingUp, MapPin } from 'lucide-react';
import { useStore } from '../store';
import { jobsAPI } from '../services/api';
import { Job } from '../types';

function Home() {
  const isDarkMode = useStore((state) => state.isDarkMode);
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const currentUser = useStore((state) => state.currentUser);
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFeaturedJobs();
    fetchCategories();
  }, []);

  const fetchFeaturedJobs = async () => {
    try {
      const response = await jobsAPI.getAll({ limit: 6 });
      setFeaturedJobs(response.data);
    } catch (err) {
      console.error('Failed to fetch jobs');
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await jobsAPI.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = `/jobs?search=${encodeURIComponent(searchTerm)}`;
  };

  return (
    <div className={isDarkMode ? 'text-white' : 'text-gray-900'}>
      {/* Hero Section */}
      <section className="py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Find Your <span className="text-blue-600">Dream Job</span> Today
        </h1>
        <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-8 max-w-2xl mx-auto`}>
          Connect with top employers and discover opportunities that match your skills and aspirations.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
          <div className={`flex items-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-2`}>
            <Search className="w-6 h-6 text-gray-400 ml-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Job title, company, or keywords..."
              className={`flex-1 p-3 bg-transparent focus:outline-none ${isDarkMode ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'}`}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Search Jobs
            </button>
          </div>
        </form>

        {/* Quick Links */}
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/jobs"
            className={`${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} px-6 py-3 rounded-lg shadow-md flex items-center transition`}
          >
            <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
            Browse All Jobs
          </Link>
          {isAuthenticated ? (
            <Link
              to={`/${currentUser?.role}/dashboard`}
              className={`${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} px-6 py-3 rounded-lg shadow-md flex items-center transition`}
            >
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              Go to Dashboard
            </Link>
          ) : (
            <Link
              to="/register"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 flex items-center transition"
            >
              <Users className="w-5 h-5 mr-2" />
              Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-8 rounded-lg shadow-md text-center`}>
            <Briefcase className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-3xl font-bold mb-2">{featuredJobs.length}+</h3>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Active Job Listings</p>
          </div>
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-8 rounded-lg shadow-md text-center`}>
            <Building2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-3xl font-bold mb-2">100+</h3>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Top Companies</p>
          </div>
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-8 rounded-lg shadow-md text-center`}>
            <Users className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-3xl font-bold mb-2">500+</h3>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Successful Hires</p>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="py-12">
          <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map(category => (
              <Link
                key={category}
                to={`/jobs?category=${encodeURIComponent(category)}`}
                className={`${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} px-4 py-2 rounded-full shadow-md transition`}
              >
                {category}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Jobs Section */}
      {featuredJobs.length > 0 && (
        <section className="py-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Latest Job Opportunities</h2>
            <Link to="/jobs" className="text-blue-600 hover:underline flex items-center">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredJobs.map(job => (
              <Link
                key={job._id || job.id}
                to={`/jobs/${job._id || job.id}`}
                className={`${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} p-6 rounded-lg shadow-md transition`}
              >
                <h3 className="text-lg font-semibold mb-2">{job.title}</h3>
                <div className={`flex items-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
                  <Building2 className="w-4 h-4 mr-1" />
                  <span>{job.company}</span>
                </div>
                <div className={`flex items-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-3`}>
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{job.location}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    {job.type}
                  </span>
                  <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                    {job.category}
                  </span>
                </div>
                <p className="text-blue-600 font-semibold mt-3">{job.salary}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className={`${isDarkMode ? 'bg-gray-800' : 'bg-blue-600'} rounded-lg p-8 md:p-12 text-center mt-12`}>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to Take the Next Step?
          </h2>
          <p className="text-blue-100 mb-6 max-w-xl mx-auto">
            Join thousands of job seekers and employers who have found success through our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Create Account
            </Link>
            <Link
              to="/login"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition"
            >
              Sign In
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

export default Home;