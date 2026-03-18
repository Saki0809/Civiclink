import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../core/auth/AuthContext';
import { Heart, Building2, GraduationCap, Users, Eye, EyeOff, Loader2 } from 'lucide-react';
import './Auth.css';

const domains = [
  { value: 'civilian', label: 'Common Citizen', icon: Users, description: 'Access all domains' },
  { value: 'healthcare', label: 'Healthcare', icon: Heart, description: 'Hospitals, NGOs' },
  { value: 'municipal', label: 'Municipal', icon: Building2, description: 'Officers, Workers' },
  { value: 'education', label: 'Education', icon: GraduationCap, description: 'Schools, Colleges' },
];

export function LoginPage() {
  const navigate = useNavigate();
  const { login, loading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    domain: 'civilian',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    clearError();
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDomainSelect = (domain) => {
    clearError();
    setFormData({ ...formData, domain });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(formData.email, formData.password, formData.domain);
      
      // Redirect based on domain
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
      <div className="auth-card animate-slide-up">
        <div className="auth-header">
          <div className="auth-logo">
            <span>🏛️</span>
            <h1>Civic Link</h1>
          </div>
          <p className="auth-subtitle">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="auth-error">
              {error}
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
                    <span className="domain-desc">{domain.description}</span>
                  </button>
                );
              })}
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

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                className="form-input"
                placeholder="Enter your password"
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

          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={18} className="spin" /> Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/signup">Sign up</Link>
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

export default LoginPage;
