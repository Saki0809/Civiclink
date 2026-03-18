import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../core/auth/AuthContext';
import { Heart, Building2, GraduationCap, Users, Eye, EyeOff, Loader2 } from 'lucide-react';
import './Auth.css';

const domains = [
  { value: 'civilian', label: 'Common Citizen', icon: Users, description: 'Access all domains', roles: ['citizen'] },
  { value: 'healthcare', label: 'Healthcare', icon: Heart, description: 'Hospitals, NGOs', roles: ['hospital_admin', 'medical_ngo', 'health_department'] },
  { value: 'municipal', label: 'Municipal', icon: Building2, description: 'Officers, Workers', roles: ['municipal_officer', 'inspector', 'field_worker'] },
  { value: 'education', label: 'Education', icon: GraduationCap, description: 'Schools, Colleges', roles: ['school_admin', 'college_admin', 'institution_admin'] },
];

const roleLabels = {
  citizen: 'Citizen',
  hospital_admin: 'Hospital Admin',
  medical_ngo: 'Medical NGO',
  health_department: 'Health Department',
  municipal_officer: 'Municipal Officer',
  inspector: 'Inspector',
  field_worker: 'Field Worker',
  school_admin: 'School Admin',
  college_admin: 'College Admin',
  institution_admin: 'Institution Admin',
};

export function SignupPage() {
  const navigate = useNavigate();
  const { signup, loading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: '',
    domain: 'civilian',
    role: 'citizen',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  const selectedDomain = domains.find(d => d.value === formData.domain);
  const availableRoles = selectedDomain?.roles || ['citizen'];

  const handleChange = (e) => {
    clearError();
    setFormError('');
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDomainSelect = (domain) => {
    clearError();
    setFormError('');
    const domainConfig = domains.find(d => d.value === domain);
    setFormData({
      ...formData,
      domain,
      role: domainConfig?.roles[0] || 'citizen',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setFormError('Password must be at least 8 characters');
      return;
    }

    try {
      const userData = {
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        phone: formData.phone || null,
        domain: formData.domain,
        role: formData.role,
      };

      const user = await signup(userData);

      const redirectMap = {
        civilian: '/dashboard',
        healthcare: '/healthcare',
        municipal: '/municipal',
        education: '/education',
      };
      navigate(redirectMap[user.domain] || '/dashboard');
    } catch (err) {
      // Error is handled by context
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card auth-card-lg animate-slide-up">
        <div className="auth-header">
          <div className="auth-logo">
            <span>🏛️</span>
            <h1>Civic Link</h1>
          </div>
          <p className="auth-subtitle">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {(error || formError) && (
            <div className="auth-error">
              {error || formError}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Select Domain</label>
            <div className="domain-grid">
              {domains.map((domain) => {
                const Icon = domain.icon;
                return (
                  <button
                    key={domain.value}
                    type="button"
                    className={`domain-option ${domain.value} ${formData.domain === domain.value ? 'selected' : ''}`}
                    onClick={() => handleDomainSelect(domain.value)}
                  >
                    <Icon size={24} />
                    <span className="domain-label">{domain.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {availableRoles.length > 1 && (
            <div className="form-group">
              <label htmlFor="role" className="form-label">Your Role</label>
              <select
                id="role"
                name="role"
                className="form-select"
                value={formData.role}
                onChange={handleChange}
              >
                {availableRoles.map(role => (
                  <option key={role} value={role}>{roleLabels[role]}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="full_name" className="form-label">Full Name</label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                className="form-input"
                placeholder="Enter your full name"
                value={formData.full_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="form-label">Phone (Optional)</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="form-input"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="off"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  className="form-input"
                  placeholder="Min. 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                className="form-input"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={18} className="spin" /> Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>

      <div className="auth-decoration">
        <div className="decoration-circle c1"></div>
        <div className="decoration-circle c2"></div>
        <div className="decoration-circle c3"></div>
      </div>
    </div>
  );
}

export default SignupPage;
