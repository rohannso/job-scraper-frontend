// =============================================================================
// File: src/pages/Login.jsx
// Login Page - For both Admin and Job Seekers
// =============================================================================

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI, saveAuthData } from '../services/api';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    console.log('🔄 Attempting login...');
    
    const response = await authAPI.login(formData);
    
    console.log('✅ Login response:', response);
    
    // Save tokens and user data
    saveAuthData(response);
    
    // Check user role and redirect
    const userRole = response.user?.role;
    
    if (userRole === 'admin') {
      console.log('🔐 Admin user - redirecting to admin dashboard');
      navigate('/admin/dashboard');
    } else if (userRole === 'job_seeker') {
      console.log('👤 Job seeker - redirecting to dashboard');
      navigate('/dashboard');
    } else {
      console.log('👤 Unknown role - redirecting to dashboard');
      navigate('/dashboard');
    }
    
  } catch (err) {
    console.error('❌ Login failed:', err);
    console.error('❌ Response:', err.response?.data);
    
    const errorMessage = err.response?.data?.error 
      || err.response?.data?.detail 
      || err.response?.data?.message
      || 'Invalid username or password';
    
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <h2 style={styles.title}>Job Scraper Login</h2>
        <p style={styles.subtitle}>Sign in to your account</p>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Enter your username"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              style={styles.input}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={styles.footer}>
          <p>
            Don't have an account?{' '}
            <Link to="/register" style={styles.link}>
              Register here
            </Link>
          </p>
        </div>

        <div style={styles.demoAccounts}>
          <p style={styles.demoTitle}>Demo Accounts:</p>
          <p style={styles.demoText}>Admin: admin / admin123</p>
          <p style={styles.demoText}>Job Seeker: Register a new account</p>
        </div>
      </div>
    </div>
  );
}

// Inline styles
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: '20px',
  },
  loginBox: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '10px',
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    textAlign: 'center',
    marginBottom: '30px',
  },
  error: {
    backgroundColor: '#fee',
    color: '#c33',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '20px',
    fontSize: '14px',
    border: '1px solid #fcc',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: '10px',
  },
  footer: {
    marginTop: '20px',
    textAlign: 'center',
    fontSize: '14px',
    color: '#666',
  },
  link: {
    color: '#007bff',
    textDecoration: 'none',
    fontWeight: '500',
  },
  demoAccounts: {
    marginTop: '30px',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    border: '1px solid #dee2e6',
  },
  demoTitle: {
    fontSize: '12px',
    fontWeight: 'bold',
    marginBottom: '8px',
    color: '#495057',
  },
  demoText: {
    fontSize: '12px',
    color: '#6c757d',
    margin: '4px 0',
  },
};

export default Login;