import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../core/auth/AuthContext';
import { 
  Syringe, Search, MapPin, ChevronLeft, 
  Calendar, Clock, ShieldCheck, AlertCircle, 
  ChevronRight, Info, CheckCircle
} from 'lucide-react';
import '../DomainDashboard.css';
import './Healthcare.css';

export function VaccinationPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isInstitution = ['hospital_admin', 'medical_ngo', 'health_department'].includes(user?.role);
  const [bookingState, setBookingState] = useState('idle');
  const [activeCenter, setActiveCenter] = useState(null);

  const vaccines = [
    { id: 1, name: 'COVID-19 Booster', dose: 'Dose 3', availability: 'High', coverage: 'Free', eligibility: '18+ years' },
    { id: 2, name: 'Influenza (Flu)', dose: 'Annual', availability: 'Limited', coverage: 'Paid', eligibility: 'All ages' },
    { id: 3, name: 'Hepatitis B', dose: 'Standard', availability: 'High', coverage: 'Insurance', eligibility: 'Adults' },
  ];

  const centers = [
    { id: 1, name: 'District Vaccination Center', address: 'Model Town, Phase 1', slots: 42, vaccine: 'COVID-19' },
    { id: 2, name: 'City Hospital Annex', address: 'Market Road', slots: 18, vaccine: 'All types' },
  ];

  const handleBookSlot = (center) => {
    setActiveCenter(center);
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
            <h1 className="page-title">Vaccination Center</h1>
            <p className="page-description">{isInstitution ? 'Manage vaccine inventory, slots, and center operations' : 'Schedule and manage your immunizations'}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="main-content">
          <div className="vaccine-grid-header">
            <h3>Available Vaccines</h3>
          </div>
          <div className="vaccine-cards-row">
            {vaccines.map(v => (
              <div key={v.id} className="vaccine-card">
                <div className="vaccine-icon"><Syringe size={24} /></div>
                <h4>{v.name}</h4>
                <div className="v-dose">{v.dose}</div>
                <div className="v-badges">
                  <span className={`v-badge ${v.availability.toLowerCase()}`}>
                    {v.availability} Availability
                  </span>
                  <span className="v-badge eligibility">{v.eligibility}</span>
                </div>
                <div className="v-footer">
                  <span className="v-coverage">{v.coverage}</span>
                  <button className="btn-healthcare btn-sm">Details</button>
                </div>
              </div>
            ))}
          </div>

          <div className="section-header mt-xl">
            <h2>{isInstitution ? 'Your Centers' : 'Nearby Centers'}</h2>
          </div>
          <div className="centers-list">
            {centers.map(center => (
              <div key={center.id} className="camp-card-horizontal">
                <div className="camp-icon-wrapper" style={{ background: 'var(--success-light)' }}>
                  <ShieldCheck size={24} style={{ color: 'var(--success-color)' }} />
                </div>
                <div className="camp-info">
                  <h3 className="camp-title">{center.name}</h3>
                  <div className="camp-meta">
                    <span><MapPin size={14} /> {center.address}</span>
                    <span><Info size={14} /> Available: {center.vaccine}</span>
                  </div>
                </div>
                <div className="slot-info">
                  <span className="slot-count">{center.slots} Slots</span>
                  {isInstitution ? (
                    <button className="btn-book-premium">
                      <Calendar size={18} />
                      Manage Slots
                    </button>
                  ) : (
                    <button 
                      className="btn-book-premium"
                      onClick={() => handleBookSlot(center)}
                      disabled={bookingState === 'booking'}
                    >
                      {bookingState === 'booking' && activeCenter?.id === center.id ? (
                        <>
                          <Clock size={18} className="loading-spinner" />
                          Booking...
                        </>
                      ) : (
                        <>
                          <Calendar size={18} />
                          Book Slot
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sidebar-content">
          {isInstitution ? (
            <>
              <div className="dashboard-card status-card">
                <h3>Vaccine Stock</h3>
                <div className="cert-item">
                  <Syringe size={18} color="var(--success-color)" />
                  <div className="cert-info">
                    <strong>COVID-19 Booster</strong>
                    <p>1,240 doses available</p>
                  </div>
                </div>
                <div className="cert-item">
                  <Syringe size={18} color="var(--warning-color)" />
                  <div className="cert-info">
                    <strong>Influenza</strong>
                    <p>83 doses — restock soon</p>
                  </div>
                </div>
              </div>
              <div className="dashboard-card help-card">
                <h3>Admin Actions</h3>
                <p className="help-text">Update vaccine stock, add new slots, or schedule new drives from your admin panel.</p>
              </div>
            </>
          ) : (
            <>
              <div className="dashboard-card status-card">
                <h3>Your Certificates</h3>
                <div className="cert-item">
                  <CheckCircle size={18} color="var(--success-color)" />
                  <div className="cert-info">
                    <strong>COVID-19 Full</strong>
                    <p>Generated on Jan 12, 2026</p>
                  </div>
                  <ChevronRight size={16} />
                </div>
              </div>
              <div className="dashboard-card help-card">
                <h3>Need Help?</h3>
                <p className="help-text">Contact the National Health Helpline at 1075 for vaccination queries.</p>
              </div>
            </>
          )}
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
              <h2>Booking Confirmed!</h2>
              <p>Your slot has been successfully reserved.</p>
            </div>
            <div className="ticket-body">
              <div className="ticket-details">
                <div className="ticket-row">
                  <span className="ticket-label">Center</span>
                  <span className="ticket-value">{activeCenter?.name}</span>
                </div>
                <div className="ticket-row">
                  <span className="ticket-label">Address</span>
                  <span className="ticket-value">{activeCenter?.address}</span>
                </div>
                <div className="ticket-row">
                  <span className="ticket-label">Date</span>
                  <span className="ticket-value">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="ticket-row">
                  <span className="ticket-label">Time</span>
                  <span className="ticket-value">10:30 AM - 11:00 AM</span>
                </div>
              </div>
              <div className="ticket-qr-placeholder">
                <div style={{ textAlign: 'center' }}>
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=CIVICLINK-VACC-2026" alt="QR Code" style={{ width: '80px', opacity: 0.5 }} />
                  <div style={{ fontSize: '10px', marginTop: '5px', fontWeight: 'bold' }}>SCAN AT CENTER</div>
                </div>
              </div>
            </div>
            <div className="ticket-footer">
              <button 
                className="ticket-close-btn"
                onClick={() => setBookingState('idle')}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
