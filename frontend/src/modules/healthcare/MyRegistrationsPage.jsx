import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../core/auth/AuthContext';
import { Heart, MapPin, Clock, CheckCircle, Loader, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';
import '../DomainDashboard.css';
import './Healthcare.css';

export function MyRegistrationsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState([]);

  useEffect(() => {
    async function fetchRegs() {
      if (!user) return;
      try {
        setLoading(true);
        // 1. Load Local Storage Registrations
        const localRegs = JSON.parse(localStorage.getItem('local_camp_registrations') || '[]')
          .filter(r => !user || r.user_id === user.id);

        // 2. Baseline Mock Data
        const baselineRegs = [
          {
            id: 'b-reg-1',
            camp_title: 'General Health Checkup Camp',
            location: 'Sector 12',
            date: '2026-04-10',
            time: '9:00 AM',
            status: 'registered',
            organizer: 'City Hospital',
            createdAt: new Date(Date.now() - 432000000).toISOString()
          },
          {
            id: 'b-reg-2',
            camp_title: 'Eye Care & Screening',
            location: 'Old Town',
            date: '2026-04-15',
            time: '10:00 AM',
            status: 'completed',
            organizer: 'Vision Care NGO',
            createdAt: new Date(Date.now() - 1296000000).toISOString()
          }
        ];

        const combined = [...localRegs, ...baselineRegs]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setRegistrations(combined);
      } catch (err) {
        console.error('Error fetching registrations:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchRegs();
  }, [user]);

  return (
    <div className="domain-dashboard">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Registrations</h1>
          <p className="page-description">Track your upcoming medical camps and health checkups</p>
        </div>
        <Link to="/healthcare/camps" className="btn btn-primary">
          <Heart size={18} /> Browse More Camps
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--healthcare-light)', color: 'var(--healthcare-color)' }}>
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{registrations.filter(r => r.status === 'registered').length}</div>
            <div className="stat-label">Upcoming Camps</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-light)', color: 'var(--success-color)' }}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{registrations.filter(r => r.status === 'completed').length}</div>
            <div className="stat-label">Camps Attended</div>
          </div>
        </div>
      </div>

      <div className="registrations-list report-list-premium" style={{ marginTop: '2rem' }}>
        {loading ? (
          <div className="loading-state">
            <Loader size={40} className="spin" />
            <p>Loading your registrations...</p>
          </div>
        ) : registrations.length > 0 ? (
          registrations.map(reg => (
            <div key={reg.id} className="issue-card-horizontal">
              <div className="issue-icon-wrapper" style={{ background: 'var(--healthcare-color)15' }}>
                <Heart size={24} style={{ color: 'var(--healthcare-color)' }} />
              </div>
              <div className="issue-info">
                <div className="issue-header-row">
                  <h3 className="issue-title">{reg.camp_title}</h3>
                  <span className={`status-badge ${reg.status}`}>
                    {reg.status.charAt(0) + reg.status.slice(1)}
                  </span>
                </div>
                <p className="issue-subtext">Organized by {reg.organizer || 'Healthcare Dept'}</p>
                <div className="issue-meta">
                  <span><MapPin size={12} /> {reg.location}</span>
                  <span><Calendar size={12} /> {reg.date}</span>
                  <span><Clock size={12} /> {reg.time}</span>
                </div>
              </div>
              <div className="issue-actions">
                <button className="btn btn-outline btn-sm">View Details</button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <ShieldCheck size={48} />
            <p>You haven't registered for any camps yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyRegistrationsPage;
