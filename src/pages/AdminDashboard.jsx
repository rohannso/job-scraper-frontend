// =============================================================================
// File: src/pages/AdminDashboard.jsx
// Admin Dashboard - Trigger Scraper and View Logs
// =============================================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI, jobAPI, logoutUser, getUser } from '../services/api';

function AdminDashboard() {
  const navigate = useNavigate();
  const user = getUser();

  const [stats, setStats] = useState(null);
  const [scraperStatus, setScraperStatus] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [triggering, setTriggering] = useState(false);

  // Fetch dashboard data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, statusData, logsData] = await Promise.all([
        jobAPI.getStats(),
        adminAPI.getScraperStatus(),
        adminAPI.getScraperLogs(),
      ]);
      setStats(statsData);
      setScraperStatus(statusData);
      setLogs(logsData.logs || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 10 seconds if scraper is running
    const interval = setInterval(() => {
      if (scraperStatus?.is_running) {
        fetchData();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [scraperStatus?.is_running]);

  // Trigger scraper
  const handleTriggerScraper = async () => {
    if (!confirm('Are you sure you want to trigger the scraper?')) {
      return;
    }

    setTriggering(true);
    try {
      await adminAPI.triggerScraper();
      alert('Scraper started successfully! Check logs below.');
      fetchData();
    } catch (error) {
      console.error('Error triggering scraper:', error);
      alert('Failed to trigger scraper');
    } finally {
      setTriggering(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Admin Dashboard</h1>
          <p style={styles.subtitle}>Welcome, {user?.username}!</p>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </button>
      </div>

      {/* Scraper Control */}
      <div style={styles.controlCard}>
        <h3 style={styles.cardTitle}>Scraper Control</h3>
        <div style={styles.controlContent}>
          <div>
            <p style={styles.statusText}>
              Status:{' '}
              <span
                style={{
                  ...styles.statusBadge,
                  backgroundColor: scraperStatus?.is_running
                    ? '#ffc107'
                    : '#28a745',
                }}
              >
                {scraperStatus?.is_running ? 'Running' : 'Idle'}
              </span>
            </p>
            {scraperStatus?.scraper && (
              <p style={styles.infoText}>
                Last run: {new Date(scraperStatus.scraper.started_at).toLocaleString()}
              </p>
            )}
          </div>
          <button
            onClick={handleTriggerScraper}
            disabled={triggering || scraperStatus?.is_running}
            style={{
              ...styles.triggerBtn,
              opacity: triggering || scraperStatus?.is_running ? 0.6 : 1,
              cursor:
                triggering || scraperStatus?.is_running
                  ? 'not-allowed'
                  : 'pointer',
            }}
          >
            {triggering
              ? 'Starting...'
              : scraperStatus?.is_running
              ? 'Scraper Running...'
              : 'Trigger Scraper'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <h3 style={styles.statNumber}>{stats.overview.total_jobs}</h3>
            <p style={styles.statLabel}>Total Jobs</p>
          </div>
          <div style={styles.statCard}>
            <h3 style={styles.statNumber}>{stats.today.total}</h3>
            <p style={styles.statLabel}>Today's Jobs</p>
          </div>
          <div style={styles.statCard}>
            <h3 style={styles.statNumber}>{stats.yesterday.total}</h3>
            <p style={styles.statLabel}>Yesterday's Jobs</p>
          </div>
          <div style={styles.statCard}>
            <h3 style={styles.statNumber}>{stats.overview.total_checked}</h3>
            <p style={styles.statLabel}>Total Checked</p>
          </div>
        </div>
      )}

      {/* Scraper Logs */}
      <div style={styles.logsCard}>
        <h3 style={styles.cardTitle}>Scraper Logs</h3>
        {loading ? (
          <div style={styles.loader}>Loading logs...</div>
        ) : logs.length === 0 ? (
          <div style={styles.noLogs}>No scraper logs found.</div>
        ) : (
          <div style={styles.logsTable}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Started At</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Videos</th>
                  <th style={styles.th}>Links Found</th>
                  <th style={styles.th}>New Links</th>
                  <th style={styles.th}>Triggered By</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td style={styles.td}>{log.id}</td>
                    <td style={styles.td}>
                      {new Date(log.started_at).toLocaleString()}
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.statusBadge,
                          backgroundColor:
                            log.status === 'completed'
                              ? '#28a745'
                              : log.status === 'running'
                              ? '#ffc107'
                              : '#dc3545',
                        }}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td style={styles.td}>{log.total_videos_scraped}</td>
                    <td style={styles.td}>{log.total_links_found}</td>
                    <td style={styles.td}>{log.new_links_added}</td>
                    <td style={styles.td}>
                      {log.triggered_by_username || 'Automated'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
  controlCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '30px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#333',
  },
  controlContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    fontSize: '16px',
    color: '#333',
    marginBottom: '8px',
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '4px',
    color: 'white',
    fontSize: '14px',
    fontWeight: '500',
  },
  infoText: {
    fontSize: '14px',
    color: '#666',
  },
  triggerBtn: {
    padding: '12px 24px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
  logsCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  loader: {
    textAlign: 'center',
    padding: '40px',
    color: '#666',
  },
  noLogs: {
    textAlign: 'center',
    padding: '40px',
    color: '#666',
  },
  logsTable: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '12px',
    textAlign: 'left',
    borderBottom: '2px solid #ddd',
    backgroundColor: '#f8f9fa',
    fontWeight: 'bold',
    fontSize: '14px',
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #ddd',
    fontSize: '14px',
  },
};

export default AdminDashboard;