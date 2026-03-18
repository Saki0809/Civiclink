import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Droplet, MapPin, Calendar, Clock, ChevronLeft, 
  Search, Filter, CheckCircle, AlertCircle, Phone, X
} from 'lucide-react';
import '../DomainDashboard.css';
import './Healthcare.css';

export function BloodDonationPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingStatus, setBookingStatus] = useState(null); // 'checking', 'success'

  const bloodCenters = [
    {
      id: 1,
      name: 'City Central Blood Bank',
      address: 'Medical Enclave, Sector 12, Main Road',
      distance: '2.4 km',
      inventory: { 'O+': 'high', 'A+': 'medium', 'B+': 'low', 'AB+': 'medium' },
      phone: '+91 98765 43210',
      openUntil: '8:00 PM'
    },
    {
      id: 2,
      name: 'Red Cross Donation Center',
      address: 'Community Square, East Wing, Level 2',
      distance: '4.8 km',
      inventory: { 'O-': 'critical', 'A-': 'low', 'B-': 'medium', 'AB-': 'high' },
      phone: '+91 91234 56789',
      openUntil: '6:30 PM'
    },
    {
      id: 3,
      name: 'LifeLine Medical Services',
      address: 'Hill View, West Side Bypass',
      distance: '7.1 km',
      inventory: { 'O+': 'medium', 'O-': 'medium', 'B+': 'high' },
      phone: '+91 88888 77777',
      openUntil: 'Open 24/7'
    }
  ];

  const handleBookSlot = (center) => {
    setSelectedCenter(center);
    setShowBookingModal(true);
  };

  const confirmBooking = () => {
    setBookingStatus('checking');
    setTimeout(() => {
      setBookingStatus('success');
    }, 1500);
  };

  return (
    <div className="healthcare-dashboard">
      <div className="page-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/healthcare')}>
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="page-title">Blood Donation</h1>
            <p className="page-description">Find donation centers and save lives in your community</p>
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
                placeholder="Search donation centers by name or locality..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="filter-btn">
                <Filter size={18} />
                <span>Filters</span>
              </button>
            </div>
          </div>

          <div className="centers-list mt-lg">
            <div className="section-header">
              <h2>Nearby Donation Centers</h2>
            </div>
            {bloodCenters.map(center => (
              <div key={center.id} className="camp-card-horizontal center-card">
                <div className="camp-icon-wrapper" style={{ background: 'var(--error-light)' }}>
                  <Droplet size={24} style={{ color: 'var(--error-color)' }} />
                </div>
                <div className="camp-info">
                  <div className="camp-header-row">
                    <h3 className="camp-title">{center.name}</h3>
                    <span className="distance-badge">{center.distance} away</span>
                  </div>
                  <div className="camp-meta">
                    <span><MapPin size={14} /> {center.address}</span>
                    <span><Clock size={14} /> Open until {center.openUntil}</span>
                    <span><Phone size={14} /> {center.phone}</span>
                  </div>
                  <div className="inventory-status">
                    <span className="inventory-label">Need level:</span>
                    {Object.entries(center.inventory).slice(0, 4).map(([type, level]) => (
                      <span key={type} className={`blood-badge ${level}`}>
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
                <button className="register-btn" onClick={() => handleBookSlot(center)}>
                  Book Slot
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="sidebar-content">
          <div className="dashboard-card status-card">
            <div className="card-header">
              <h3><AlertCircle size={18} /> Emergency Needs</h3>
            </div>
            <div className="emergency-alerts">
              <div className="emergency-item urgent">
                <div className="emergency-icon"><Droplet size={16} /></div>
                <div className="emergency-text">
                  <strong>O- Required Urgently</strong>
                  <p>City Hospital needs 5 units for trauma case.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-card info-card">
            <h3>Why Donate?</h3>
            <ul className="info-list">
              <li>1 donation can save 3 lives</li>
              <li>Free health screening included</li>
              <li>Regenerates new blood cells</li>
            </ul>
          </div>
        </div>
      </div>

      {showBookingModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            {bookingStatus === 'success' ? (
              <div className="success-state">
                <div className="success-icon"><CheckCircle size={48} /></div>
                <h2>Appointment Confirmed!</h2>
                <p>Your slot at <strong>{selectedCenter?.name}</strong> is booked for tomorrow at 10:30 AM.</p>
                <div className="appointment-details">
                  <p><strong>Token:</strong> BLD-4492-X</p>
                  <p>Check your email for instructions.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowBookingModal(false)}>Done</button>
              </div>
            ) : (
              <>
                <div className="modal-header">
                  <h2>Book Donation Slot</h2>
                  <button className="close-btn" onClick={() => setShowBookingModal(false)}><X size={20} /></button>
                </div>
                <div className="modal-body">
                  <p>Select a preferred time at <strong>{selectedCenter?.name}</strong></p>
                  <div className="time-grid">
                    <button className="time-btn">09:00 AM</button>
                    <button className="time-btn active">10:30 AM</button>
                    <button className="time-btn">01:00 PM</button>
                    <button className="time-btn">03:30 PM</button>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-outline" onClick={() => setShowBookingModal(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={confirmBooking} disabled={bookingStatus === 'checking'}>
                    {bookingStatus === 'checking' ? 'Confirming...' : 'Confirm Appointment'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
