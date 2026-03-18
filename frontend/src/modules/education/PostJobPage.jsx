import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../core/auth/AuthContext';
import { GraduationCap, Briefcase, MapPin, Calendar, DollarSign, Users, ArrowLeft, Check } from 'lucide-react';
import '../DomainDashboard.css';
import './Education.css';

export function PostJobPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    job_type: 'full_time',
    department: '',
    location: '',
    is_remote: false,
    salary_range: '',
    application_deadline: '',
    positions_available: 1,
    eligibility: '',
    requirements: '',
    responsibilities: '',
    benefits: '',
  });

  const jobTypes = [
    { value: 'full_time', label: 'Full Time' },
    { value: 'part_time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' },
    { value: 'volunteer', label: 'Volunteer' },
    { value: 'scholarship', label: 'Scholarship' },
    { value: 'training', label: 'Training Program' },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => navigate('/education'), 2000);
  };

  if (submitted) {
    return (
      <div className="success-page">
        <div className="success-card education">
          <div className="success-icon education">
            <Check size={48} />
          </div>
          <h2>Opportunity Posted!</h2>
          <p>Your {jobTypes.find(t => t.value === formData.job_type)?.label} posting is now live.</p>
          <p className="redirect-text">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page">
      <div className="form-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1>Post Opportunity</h1>
          <p>Create a new job, internship, or scholarship posting</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="domain-form">
        <div className="form-section education">
          <h3><Briefcase size={18} /> Basic Information</h3>
          
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              type="text"
              name="title"
              className="form-input"
              placeholder="e.g., Software Developer Intern, Math Teacher"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Type *</label>
              <select
                name="job_type"
                className="form-select"
                value={formData.job_type}
                onChange={handleChange}
                required
              >
                {jobTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Department</label>
              <input
                type="text"
                name="department"
                className="form-input"
                placeholder="e.g., Computer Science, HR"
                value={formData.department}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              name="description"
              className="form-textarea"
              placeholder="Describe the role, expectations, and what makes this opportunity great..."
              rows={4}
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-section education">
          <h3><MapPin size={18} /> Location & Compensation</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Location *</label>
              <input
                type="text"
                name="location"
                className="form-input"
                placeholder="e.g., Mumbai, Bangalore, Campus"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Salary/Stipend Range</label>
              <input
                type="text"
                name="salary_range"
                className="form-input"
                placeholder="e.g., ₹15,000-25,000/month"
                value={formData.salary_range}
                onChange={handleChange}
              />
            </div>
          </div>

          <label className="checkbox-item inline">
            <input
              type="checkbox"
              name="is_remote"
              checked={formData.is_remote}
              onChange={handleChange}
            />
            <span>This is a remote/work-from-home opportunity</span>
          </label>
        </div>

        <div className="form-section education">
          <h3><Users size={18} /> Requirements</h3>
          
          <div className="form-group">
            <label className="form-label">Eligibility Criteria</label>
            <textarea
              name="eligibility"
              className="form-textarea"
              placeholder="e.g., - Final year B.Tech students&#10;- Minimum 60% aggregate&#10;- No active backlogs"
              rows={3}
              value={formData.eligibility}
              onChange={handleChange}
            />
            <small className="form-hint">Enter each criteria on a new line</small>
          </div>

          <div className="form-group">
            <label className="form-label">Skills Required</label>
            <textarea
              name="requirements"
              className="form-textarea"
              placeholder="e.g., - Python/JavaScript&#10;- Problem solving&#10;- Communication skills"
              rows={3}
              value={formData.requirements}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Responsibilities</label>
            <textarea
              name="responsibilities"
              className="form-textarea"
              placeholder="e.g., - Develop and maintain web applications&#10;- Collaborate with team members&#10;- Write clean, documented code"
              rows={3}
              value={formData.responsibilities}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-section education">
          <h3><Calendar size={18} /> Deadline & Positions</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Application Deadline *</label>
              <input
                type="date"
                name="application_deadline"
                className="form-input"
                value={formData.application_deadline}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Positions Available</label>
              <input
                type="number"
                name="positions_available"
                className="form-input"
                min={1}
                max={100}
                value={formData.positions_available}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Benefits & Perks</label>
            <textarea
              name="benefits"
              className="form-textarea"
              placeholder="e.g., - Health insurance&#10;- Flexible hours&#10;- Learning opportunities"
              rows={3}
              value={formData.benefits}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-lg">
            <GraduationCap size={18} /> Publish Opportunity
          </button>
        </div>
      </form>
    </div>
  );
}

export default PostJobPage;
