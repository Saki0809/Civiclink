import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../core/auth/AuthContext';
import { 
  Stethoscope, Search, MapPin, Star, ChevronLeft, 
  Clock, Calendar, Filter, Phone, CheckCircle, Video
} from 'lucide-react';
import '../DomainDashboard.css';
import './Healthcare.css';

export function FindDoctorsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isInstitution = ['hospital_admin', 'medical_ngo', 'health_department'].includes(user?.role);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingState, setBookingState] = useState('idle');
  const [activeDoctor, setActiveDoctor] = useState(null);

  const doctors = [
    {
      id: 1,
      name: 'Dr. Sarah Wilson',
      specialty: 'Cardiologist',
      experience: '12 years',
      rating: 4.9,
      reviews: 128,
      location: 'City Heart Center, Sector 15',
      availability: 'Wed, Fri from 10:00 AM',
      fee: '800',
      teleconsult: true
    },
    {
      id: 2,
      name: 'Dr. James Miller',
      specialty: 'Pediatrician',
      experience: '8 years',
      rating: 4.7,
      reviews: 95,
      location: 'KiddieCare Clinic, Downtown',
      availability: 'Mon - Thu from 04:00 PM',
      fee: '600',
      teleconsult: false
    },
    {
      id: 3,
      name: 'Dr. Ananya Rao',
      specialty: 'General Physician',
      experience: '15 years',
      rating: 4.8,
      reviews: 210,
      location: 'Wellness Hub, Greenfield',
      availability: 'Mon - Sat from 09:00 AM',
      fee: '500',
      teleconsult: true
    }
  ];

  const handleBookDoctor = (dr) => {
    setActiveDoctor(dr);
    setBookingState('booking');
    
    // Simulate API call
    setTimeout(() => {
      setBookingState('success');
    }, 2000);
  };

  return (
    <div className="healthcare-dashboard">
      <div className="page-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/healthcare')}>
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="page-title">Find Doctors</h1>
            <p className="page-description">{isInstitution ? 'View and manage affiliated doctors and specialists' : 'Consult with top-rated specialists in your area'}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="main-content">
          <div className="search-section card-like">
            <div className="search-bar-wrapper">
              <Search size={20} />
              <input 
                type="text" 
                placeholder="Search doctors by name, specialty, or clinic..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="filter-btn">
                <Filter size={18} />
                <span>Specialties</span>
              </button>
            </div>
          </div>

          <div className="doctors-list mt-lg">
            {doctors.map(dr => (
              <div key={dr.id} className="camp-card-horizontal doctor-card">
                <div className="doctor-avatar">
                  <div className="avatar-placeholder">{dr.name.charAt(0)}</div>
                  {dr.teleconsult && (
                    <div className="tele-badge" title="Video Consultation Available">
                      <Video size={12} />
                    </div>
                  )}
                </div>
                <div className="camp-info">
                  <div className="camp-header-row">
                    <h3 className="camp-title">{dr.name}</h3>
                    <div className="rating-badge">
                      <Star size={14} fill="var(--warning-color)" />
                      <span>{dr.rating}</span>
                      <span className="review-count">({dr.reviews})</span>
                    </div>
                  </div>
                  <p className="dr-specialty">{dr.specialty} • {dr.experience} exp.</p>
                  <div className="camp-meta">
                    <span><MapPin size={14} /> {dr.location}</span>
                    <span><Clock size={14} /> {dr.availability}</span>
                    <span><CheckCircle size={14} /> Consultation: ₹{dr.fee}</span>
                  </div>
                </div>
                <div className="dr-actions">
                  {isInstitution ? (
                    <>
                      <button className="btn btn-outline btn-sm mb-xs"><Phone size={14} /> Contact</button>
                      <button className="btn-book-premium">
                        <Stethoscope size={18} />
                        View Profile
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="btn btn-outline btn-sm mb-xs"><Video size={14} /> Video Call</button>
                      <button 
                        className="btn-book-premium"
                        onClick={() => handleBookDoctor(dr)}
                        disabled={bookingState === 'booking'}
                      >
                        {bookingState === 'booking' && activeDoctor?.id === dr.id ? (
                          <>
                            <Clock size={18} className="loading-spinner" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Stethoscope size={18} />
                            Book Appointment
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sidebar-content">
          <div className="dashboard-card categories-card">
            <h3>Specialties</h3>
            <div className="specialty-grid">
              <div className="specialty-item active">General</div>
              <div className="specialty-item">Cardiology</div>
              <div className="specialty-item">Pediatrics</div>
              <div className="specialty-item">Dermatology</div>
              <div className="specialty-item">Orthopedic</div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {bookingState === 'success' && (
        <div className="booking-overlay">
          <div className="appointment-ticket">
            <div className="ticket-header">
              <div className="ticket-success-icon">
                <CheckCircle size={32} />
              </div>
              <h2>Appointment Confirmed!</h2>
              <p>Your consultation with {activeDoctor?.name} is scheduled.</p>
            </div>
            <div className="ticket-body">
              <div className="ticket-details">
                <div className="ticket-row">
                  <span className="ticket-label">Doctor</span>
                  <span className="ticket-value">{activeDoctor?.name}</span>
                </div>
                <div className="ticket-row">
                  <span className="ticket-label">Specialty</span>
                  <span className="ticket-value">{activeDoctor?.specialty}</span>
                </div>
                <div className="ticket-row">
                  <span className="ticket-label">Location</span>
                  <span className="ticket-value">{activeDoctor?.location}</span>
                </div>
                <div className="ticket-row">
                  <span className="ticket-label">Booking ID</span>
                  <span className="ticket-value">#DR-{activeDoctor?.id}2026</span>
                </div>
                <div className="ticket-row">
                  <span className="ticket-label">Fee</span>
                  <span className="ticket-value">₹{activeDoctor?.fee} (Unpaid)</span>
                </div>
              </div>
              <div className="ticket-qr-placeholder">
                <div style={{ textAlign: 'center' }}>
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=DOCTOR-APP-2026" alt="QR Code" style={{ width: '80px', opacity: 0.5 }} />
                  <div style={{ fontSize: '10px', marginTop: '5px', fontWeight: 'bold' }}>SCAN AT CLINIC</div>
                </div>
              </div>
            </div>
            <div className="ticket-footer">
              <button 
                className="ticket-close-btn"
                onClick={() => setBookingState('idle')}
              >
                Close Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
