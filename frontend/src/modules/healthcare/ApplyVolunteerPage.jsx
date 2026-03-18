import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../core/auth/AuthContext';
import { Heart, ArrowLeft, User, Mail, Phone, MapPin, Clock, Award, Send } from 'lucide-react';
import '../DomainDashboard.css';
import './Healthcare.css';

export function ApplyVolunteerPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: user?.full_name || '',
    email: user?.email || '',
    phone: '',
    locality: '',
    experience: '',
    availability: 'weekends',
    skills: [],
    motivation: '',
    emergencyContact: '',
    agreedToTerms: false
  });

  const [errors, setErrors] = useState({});

  const skillOptions = [
    'First Aid', 'CPR Certified', 'Nursing', 'Medical Assistance',
    'Patient Care', 'Data Entry', 'Communication', 'Counseling',
    'Blood Donation Support', 'Event Coordination', 'Transportation', 'Other'
  ];

  const availabilityOptions = [
    { value: 'weekends', label: 'Weekends Only' },
    { value: 'weekdays', label: 'Weekdays Only' },
    { value: 'mornings', label: 'Mornings (6 AM - 12 PM)' },
    { value: 'afternoons', label: 'Afternoons (12 PM - 6 PM)' },
    { value: 'evenings', label: 'Evenings (6 PM - 10 PM)' },
    { value: 'flexible', label: 'Flexible / Anytime' },
  ];

  const localities = [
    'Sector 12', 'Sector 15', 'Park Avenue', 'Green Colony', 
    'New Town', 'City Center', 'Old Town', 'Industrial Area',
    'University District', 'Medical Hub'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSkillToggle = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) newErrors.phone = 'Enter a valid 10-digit phone number';
    if (!formData.locality) newErrors.locality = 'Please select your locality';
    if (formData.skills.length === 0) newErrors.skills = 'Please select at least one skill';
    if (!formData.motivation.trim()) newErrors.motivation = 'Please tell us why you want to volunteer';
    if (!formData.agreedToTerms) newErrors.agreedToTerms = 'You must agree to the terms';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="domain-dashboard">
        <div className="success-container">
          <div className="success-icon">
            <Heart size={48} />
          </div>
          <h2>Application Submitted!</h2>
          <p>Thank you for your interest in volunteering. We will review your application and contact you within 3-5 business days.</p>
          <button className="btn btn-primary" onClick={() => navigate('/healthcare')}>
            Back to Healthcare Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="domain-dashboard">
      <div className="page-header">
        <div>
          <button className="btn-back" onClick={() => navigate('/healthcare')}>
            <ArrowLeft size={18} /> Back
          </button>
          <h1 className="page-title">Apply to be a Volunteer</h1>
          <p className="page-description">Join our healthcare volunteer program and make a difference in your community</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="volunteer-form">
        <div className="form-section">
          <h3 className="form-section-title">
            <User size={18} /> Personal Information
          </h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="fullName">Full Name *</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className={errors.fullName ? 'error' : ''}
              />
              {errors.fullName && <span className="error-text">{errors.fullName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <div className="input-icon">
                <Mail size={16} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  className={errors.email ? 'error' : ''}
                />
              </div>
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <div className="input-icon">
                <Phone size={16} />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="10-digit phone number"
                  className={errors.phone ? 'error' : ''}
                />
              </div>
              {errors.phone && <span className="error-text">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="locality">Locality *</label>
              <div className="input-icon">
                <MapPin size={16} />
                <select
                  id="locality"
                  name="locality"
                  value={formData.locality}
                  onChange={handleInputChange}
                  className={errors.locality ? 'error' : ''}
                >
                  <option value="">Select your locality</option>
                  {localities.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
              {errors.locality && <span className="error-text">{errors.locality}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="emergencyContact">Emergency Contact</label>
              <input
                type="text"
                id="emergencyContact"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleInputChange}
                placeholder="Name and phone number"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">
            <Clock size={18} /> Availability
          </h3>
          
          <div className="form-group">
            <label htmlFor="availability">When are you available to volunteer?</label>
            <div className="radio-group">
              {availabilityOptions.map(option => (
                <label key={option.value} className="radio-option">
                  <input
                    type="radio"
                    name="availability"
                    value={option.value}
                    checked={formData.availability === option.value}
                    onChange={handleInputChange}
                  />
                  <span className="radio-label">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">
            <Award size={18} /> Skills & Experience
          </h3>
          
          <div className="form-group">
            <label>Select your relevant skills * (select all that apply)</label>
            <div className="skills-grid">
              {skillOptions.map(skill => (
                <button
                  type="button"
                  key={skill}
                  className={`skill-tag ${formData.skills.includes(skill) ? 'selected' : ''}`}
                  onClick={() => handleSkillToggle(skill)}
                >
                  {skill}
                </button>
              ))}
            </div>
            {errors.skills && <span className="error-text">{errors.skills}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="experience">Previous Volunteer Experience</label>
            <textarea
              id="experience"
              name="experience"
              value={formData.experience}
              onChange={handleInputChange}
              placeholder="Tell us about any previous volunteer experience (optional)"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="motivation">Why do you want to volunteer? *</label>
            <textarea
              id="motivation"
              name="motivation"
              value={formData.motivation}
              onChange={handleInputChange}
              placeholder="Share your motivation for joining our volunteer program..."
              rows={4}
              className={errors.motivation ? 'error' : ''}
            />
            {errors.motivation && <span className="error-text">{errors.motivation}</span>}
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">
            <Award size={18} /> Additional Information
          </h3>
          
          <div className="form-group">
            <label htmlFor="reference">References or Certifications</label>
            <textarea
              id="reference"
              name="reference"
              placeholder="e.g., Red Cross CPR Certified, Previous NGO work with details..."
              rows={2}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group" style={{ marginTop: 'var(--spacing-md)' }}>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="hasVehicle"
                onChange={handleInputChange}
              />
              <span>I have my own transportation (bike/car) for field visits.</span>
            </label>
          </div>
        </div>

        <div className="form-section">
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="agreedToTerms"
                checked={formData.agreedToTerms}
                onChange={handleInputChange}
              />
              <span>I agree to the volunteer code of conduct and confirm that all information provided is true. *</span>
            </label>
            {errors.agreedToTerms && <span className="error-text">{errors.agreedToTerms}</span>}
          </div>
        </div>

        <div className="form-actions-footer">
          <div className="actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate('/healthcare')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-healthcare btn-lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <>Submitting Application...</>
              ) : (
                <><Send size={18} /> Submit Application</>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ApplyVolunteerPage;
