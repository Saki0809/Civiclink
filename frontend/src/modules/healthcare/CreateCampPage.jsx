import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../core/auth/AuthContext';
import { Heart, Calendar, Clock, MapPin, Users, ArrowLeft, Check } from 'lucide-react';
import '../DomainDashboard.css';
import './Healthcare.css';

export function CreateCampPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    camp_date: '',
    start_time: '09:00',
    end_time: '17:00',
    location_name: '',
    address: '',
    locality: user?.locality || '',
    services_offered: [],
    max_registrations: 100,
    volunteers_needed: 10,
  });

  const services = [
    'General Checkup', 'Eye Care', 'Dental Care', 'Blood Pressure', 
    'Diabetes Screening', 'Vaccination', 'Blood Donation', 'Pediatric Care'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleServiceToggle = (service) => {
    const current = formData.services_offered;
    if (current.includes(service)) {
      setFormData({ ...formData, services_offered: current.filter(s => s !== service) });
    } else {
      setFormData({ ...formData, services_offered: [...current, service] });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Demo mode - just show success
    setSubmitted(true);
    setTimeout(() => navigate('/healthcare'), 2000);
  };

  if (submitted) {
    return (
      <div className="success-page">
        <div className="success-card">
          <div className="success-icon">
            <Check size={48} />
          </div>
          <h2>Camp Created Successfully!</h2>
          <p>Your medical camp has been published. Citizens in {formData.locality} will be notified.</p>
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
          <h1>Create Medical Camp</h1>
          <p>Publish a new health camp for citizens</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="domain-form">
        <div className="form-section">
          <h3><Heart size={18} /> Camp Details</h3>
          
          <div className="form-group">
            <label className="form-label">Camp Title *</label>
            <input
              type="text"
              name="title"
              className="form-input"
              placeholder="e.g., Free General Health Checkup Camp"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              name="description"
              className="form-textarea"
              placeholder="Describe the camp, services offered, who should attend..."
              rows={4}
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Services Offered *</label>
            <div className="checkbox-grid">
              {services.map(service => (
                <label key={service} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={formData.services_offered.includes(service)}
                    onChange={() => handleServiceToggle(service)}
                  />
                  <span>{service}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3><Calendar size={18} /> Date & Time</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Camp Date *</label>
              <input
                type="date"
                name="camp_date"
                className="form-input"
                value={formData.camp_date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Start Time *</label>
              <input
                type="time"
                name="start_time"
                className="form-input"
                value={formData.start_time}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Time *</label>
              <input
                type="time"
                name="end_time"
                className="form-input"
                value={formData.end_time}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3><MapPin size={18} /> Location</h3>
          
          <div className="form-group">
            <label className="form-label">Venue Name *</label>
            <input
              type="text"
              name="location_name"
              className="form-input"
              placeholder="e.g., Community Hall, City Hospital"
              value={formData.location_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Full Address *</label>
            <textarea
              name="address"
              className="form-textarea"
              placeholder="Complete address with landmarks"
              rows={2}
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Locality *</label>
            <input
              type="text"
              name="locality"
              className="form-input"
              placeholder="e.g., Sector 15, Downtown"
              value={formData.locality}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h3><Users size={18} /> Organizing Team & Resources</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Head Doctor/Officer Name</label>
              <input
                type="text"
                name="coordinator_name"
                className="form-input"
                placeholder="Dr. John Doe"
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Team Size</label>
              <input
                type="number"
                name="team_size"
                className="form-input"
                min={1}
                defaultValue={5}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 'var(--spacing-md)' }}>
            <label className="form-label">Required Equipment/Resources</label>
            <textarea
              name="equipment_needed"
              className="form-textarea"
              placeholder="e.g., First aid kits, oxygen cylinders, stretchers..."
              rows={2}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-section">
          <h3><Users size={18} /> Capacity & Volunteer Needs</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Max Registrations</label>
              <input
                type="number"
                name="max_registrations"
                className="form-input"
                min={10}
                max={1000}
                value={formData.max_registrations}
                onChange={handleChange}
              />
              <span className="input-hint">Total number of citizens allowed</span>
            </div>
            <div className="form-group">
              <label className="form-label">Volunteers Needed</label>
              <input
                type="number"
                name="volunteers_needed"
                className="form-input"
                min={0}
                max={100}
                value={formData.volunteers_needed}
                onChange={handleChange}
              />
              <span className="input-hint">Will be posted in Volunteer portal</span>
            </div>
          </div>
        </div>

        <div className="form-actions-footer">
          <div className="checkbox-item inline">
            <input type="checkbox" required />
            <span>I confirm that all medical protocols will be followed during this camp.</span>
          </div>
          <div className="actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-healthcare btn-lg">
              <Heart size={18} /> Publish Medical Camp
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CreateCampPage;
