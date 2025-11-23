// =============================================================================
// File: src/pages/JobSeekerDashboard.jsx
// Job Seeker Dashboard - View and Filter Jobs
// =============================================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobAPI, logoutUser, getUser } from '../services/api';

function JobSeekerDashboard() {
  const navigate = useNavigate();
  const user = getUser();

  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    date_filter: 'all',
    check_status: 'all',
    search: '',
  });

  // Fetch jobs
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await jobAPI.getJobs(filters);
      setJobs(response.results || []);
      setStats(response.stats || null);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      alert('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  // Handle logout
  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  // Toggle job check
  const handleToggleCheck = async (jobId, currentStatus) => {
    try {
      await jobAPI.toggleCheck(jobId, !currentStatus);
      fetchJobs(); // Refresh list
    } catch (error) {
      console.error('Error toggling check:', error);
      alert('Failed to update job status');
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Job Seeker Dashboard</h1>
          <p style={styles.subtitle}>Welcome, {user?.username}!</p>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <h3 style={styles.statNumber}>{stats.total}</h3>
            <p style={styles.statLabel}>Total Jobs</p>
          </div>
          <div style={styles.statCard}>
            <h3 style={styles.statNumber}>{stats.today}</h3>
            <p style={styles.statLabel}>Today's Jobs</p>
          </div>
          <div style={styles.statCard}>
            <h3 style={styles.statNumber}>{stats.yesterday}</h3>
            <p style={styles.statLabel}>Yesterday's Jobs</p>
          </div>
          <div style={styles.statCard}>
            <h3 style={styles.statNumber}>{stats.checked}</h3>
            <p style={styles.statLabel}>Checked Jobs</p>
          </div>
          <div style={styles.statCard}>
            <h3 style={styles.statNumber}>{stats.unchecked}</h3>
            <p style={styles.statLabel}>Unchecked Jobs</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={styles.filterCard}>
        <h3 style={styles.filterTitle}>Filter Jobs</h3>
        <div style={styles.filterGrid}>
          {/* Date Filter */}
          <div>
            <label style={styles.label}>Date</label>
            <select
              value={filters.date_filter}
              onChange={(e) => handleFilterChange('date_filter', e.target.value)}
              style={styles.select}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="last_week">Last Week</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label style={styles.label}>Status</label>
            <select
              value={filters.check_status}
              onChange={(e) => handleFilterChange('check_status', e.target.value)}
              style={styles.select}
            >
              <option value="all">All Jobs</option>
              <option value="checked">Checked</option>
              <option value="unchecked">Unchecked</option>
            </select>
          </div>

          {/* Search */}
          <div style={styles.searchContainer}>
            <label style={styles.label}>Search</label>
            <input
              type="text"
              placeholder="Search jobs..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              style={styles.input}
            />
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div style={styles.jobsCard}>
        <h3 style={styles.jobsTitle}>
          Job Listings ({jobs.length})
        </h3>

        {loading ? (
          <div style={styles.loader}>Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <div style={styles.noJobs}>
            <p>No jobs found matching your filters.</p>
          </div>
        ) : (
          <div style={styles.jobsList}>
            {jobs.map((job) => (
              <div key={job.id} style={styles.jobCard}>
                <div style={styles.jobHeader}>
                  <div style={styles.jobInfo}>
                    <span style={styles.jobId}>#{job.id}</span>
                    <span style={styles.jobDate}>{job.date_found}</span>
                    {job.is_checked && (
                      <span style={styles.checkedBadge}>✓ Checked</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleToggleCheck(job.id, job.is_checked)}
                    style={{
                      ...styles.checkBtn,
                      backgroundColor: job.is_checked ? '#dc3545' : '#28a745',
                    }}
                  >
                    {job.is_checked ? 'Uncheck' : 'Mark as Checked'}
                  </button>
                </div>

                <div style={styles.jobBody}>
                  <a
                    href={job.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.jobLink}
                  >
                    {job.link}
                  </a>
                  {job.search_query && (
                    <p style={styles.jobQuery}>
                      <strong>Query:</strong> {job.search_query}
                    </p>
                  )}
                  {job.video_url && (
                    <a
                      href={job.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.videoLink}
                    >
                      📺 View Video
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Styles
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    marginTop: '5px',
  },
  logoutBtn: {
    padding: '10px 20px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px',
    marginBottom: '30px',
  },
  statCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  statNumber: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#007bff',
    margin: 0,
  },
  statLabel: {
    fontSize: '14px',
    color: '#666',
    marginTop: '5px',
  },
  filterCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '30px',
  },
  filterTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#333',
  },
  filterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
  },
  searchContainer: {
    gridColumn: 'span 1',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '8px',
    color: '#333',
  },
  select: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  jobsCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  jobsTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#333',
  },
  loader: {
    textAlign: 'center',
    padding: '40px',
    color: '#666',
  },
  noJobs: {
    textAlign: 'center',
    padding: '40px',
    color: '#666',
  },
  jobsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  jobCard: {
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    padding: '15px',
    backgroundColor: '#fafafa',
  },
  jobHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  jobInfo: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  jobId: {
    fontSize: '12px',
    color: '#666',
    fontWeight: 'bold',
  },
  jobDate: {
    fontSize: '12px',
    color: '#666',
  },
  checkedBadge: {
    fontSize: '12px',
    backgroundColor: '#28a745',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
  },
  checkBtn: {
    padding: '8px 16px',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  jobBody: {
    marginTop: '10px',
  },
  jobLink: {
    color: '#007bff',
    textDecoration: 'none',
    fontSize: '14px',
    wordBreak: 'break-all',
    display: 'block',
    marginBottom: '8px',
  },
  jobQuery: {
    fontSize: '12px',
    color: '#666',
    margin: '5px 0',
  },
  videoLink: {
    fontSize: '12px',
    color: '#007bff',
    textDecoration: 'none',
    marginTop: '8px',
    display: 'inline-block',
  },
};

export default JobSeekerDashboard;