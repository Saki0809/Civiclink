import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, ChevronLeft, PhoneCall, AlertTriangle,
  Siren, Flame, Zap, ShieldAlert, HeartPulse
} from 'lucide-react';
import '../DomainDashboard.css';
import './Municipal.css';

export function EmergencyServicesPage() {
  const navigate = useNavigate();

  const emergencyContacts = [
    { label: 'Police Emergency', number: '100', icon: Siren, color: 'var(--info-color)' },
    { label: 'Ambulance', number: '102', icon: HeartPulse, color: 'var(--error-color)' },
    { label: 'Fire Department', number: '101', icon: Flame, color: 'var(--warning-color)' },
    { label: 'Disaster Mgmt', number: '108', icon: ShieldAlert, color: 'var(--primary-600)' },
  ];

  return (
    <div className="municipal-dashboard">
      <header className="page-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/municipal')}>
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="page-title">Emergency Services</h1>
            <p className="page-description">Immediate resources and crisis helplines</p>
          </div>
        </div>
      </header>

      <div className="emergency-dashboard">
        <div className="urgent-alert mb-xl">
          <AlertTriangle size={24} />
          <div className="alert-content">
            <h3>Active Disaster Alert: Heavy Rainfall</h3>
            <p>Avoid coastal areas and stay indoors. Low-lying areas are being evacuated for precaution.</p>
          </div>
          <button className="btn btn-sm btn-outline-white">Live Updates</button>
        </div>

        <div className="section-header">
          <h2>Quick Dial Helplines</h2>
        </div>
        <div className="emergency-grid">
          {emergencyContacts.map(contact => (
            <div key={contact.label} className="emergency-dial-card">
              <div className="contact-icon" style={{ background: `${contact.color}15`, color: contact.color }}>
                <contact.icon size={32} />
              </div>
              <div className="contact-info">
                <h3>{contact.label}</h3>
                <span className="phone-number">{contact.number}</span>
              </div>
              <button className="dial-btn"><PhoneCall size={20} /></button>
            </div>
          ))}
        </div>

        <div className="mt-2xl">
          <div className="section-header">
            <h2>Specialized Helplines</h2>
          </div>
          <div className="helpline-table card-like">
            <div className="table-row">
              <span className="label">Women Help Line</span>
              <span className="value">1091</span>
            </div>
            <div className="table-row">
              <span className="label">Child Help Line</span>
              <span className="value">1098</span>
            </div>
            <div className="table-row">
              <span className="label">Senior Citizen Helpline</span>
              <span className="value">14567</span>
            </div>
            <div className="table-row">
              <span className="label">Electricity Emergency</span>
              <span className="value">1912</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
