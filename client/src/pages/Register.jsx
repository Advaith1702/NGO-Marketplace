import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser, HiOutlinePhone, HiOutlineIdentification } from 'react-icons/hi';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'donor',
    description: '',
    registrationId: '',
    contact: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const data = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        description: formData.description,
        registrationId: formData.registrationId,
        contact: formData.contact,
      });
      switch (data.role) {
        case 'ngo':
          navigate('/ngo/dashboard');
          break;
        case 'donor':
          navigate('/donor/dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <span className="auth-icon">🌟</span>
            <h1>Join NGOConnect</h1>
            <p>Create your account today</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>I am a</label>
              <div className="role-selector">
                <button
                  type="button"
                  className={`role-btn ${formData.role === 'donor' ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, role: 'donor' })}
                >
                  💝 Donor
                </button>
                <button
                  type="button"
                  className={`role-btn ${formData.role === 'ngo' ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, role: 'ngo' })}
                >
                  🏛️ NGO
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="name">{formData.role === 'ngo' ? 'Organization Name' : 'Full Name'}</label>
              <div className="input-wrapper">
                <HiOutlineUser className="input-icon" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder={formData.role === 'ngo' ? 'Your NGO name' : 'John Doe'}
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-email">Email Address</label>
              <div className="input-wrapper">
                <HiOutlineMail className="input-icon" />
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {formData.role === 'ngo' && (
              <>
                <div className="form-group">
                  <label htmlFor="description">Mission / Description</label>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="Describe your organization's mission..."
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="registrationId">Registration ID</label>
                    <div className="input-wrapper">
                      <HiOutlineIdentification className="input-icon" />
                      <input
                        id="registrationId"
                        name="registrationId"
                        type="text"
                        placeholder="NGO-XXXX"
                        value={formData.registrationId}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="contact">Contact Number</label>
                    <div className="input-wrapper">
                      <HiOutlinePhone className="input-icon" />
                      <input
                        id="contact"
                        name="contact"
                        type="tel"
                        placeholder="+91 9876543210"
                        value={formData.contact}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="form-group">
              <label htmlFor="reg-password">Password</label>
              <div className="input-wrapper">
                <HiOutlineLockClosed className="input-icon" />
                <input
                  id="reg-password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-wrapper">
                <HiOutlineLockClosed className="input-icon" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? <span className="spinner-sm"></span> : 'Create Account'}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>

          {formData.role === 'ngo' && (
            <p className="auth-note">
              ⓘ NGO accounts require admin verification before accessing marketplace features.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
