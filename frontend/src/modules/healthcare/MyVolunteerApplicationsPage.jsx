import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Clock, CheckCircle, XCircle, Loader, Calendar, HandHeart, Eye } from 'lucide-react';
import '../DomainDashboard.css';
import './Healthcare.css';

export function MyVolunteerApplicationsPage() {
  const [filter, setFilter] = useState('all');

  // Dummy data for user's volunteer applications
  const myApplications = [
    { 
      id: 1, 
      campName: 'General Health Checkup Camp', 
      organization: 'City Hospital',
      location: 'Community Hall, Sector 15',
      campDate: '2026-02-10',
      appliedAt: '2026-02-02',
      status: 'approved',
      role: 'Patient Registration',
      shifts: 'Morning (9 AM - 1 PM)',
      instructions: 'Please report at 8:30 AM for briefing. Wear comfortable clothes and bring your ID.'
    },
    { 
      id: 2, 
      campName: 'Blood Donation Drive', 
      organization: 'Red Cross Society',
      location: 'City Hospital',
      campDate: '2026-02-18',
      appliedAt: '2026-02-04',
      status: 'pending',
      role: 'Donor Assistance',
      shifts: 'Full Day (8 AM - 6 PM)',
      instructions: null
    },
    { 
      id: 3, 
      campName: 'Eye Care Camp', 
      organization: 'Vision Foundation',
      location: 'Municipal School Ground',
      campDate: '2026-02-15',
      appliedAt: '2026-02-03',
      status: 'under_review',
      role: 'General Support',
      shifts: 'Afternoon (12 PM - 4 PM)',
      instructions: null
    },
    { 
      id: 4, 
      campName: 'Vaccination Camp', 
      organization: 'Health Department',
      location: 'PHC Center',
      campDate: '2026-01-20',
      appliedAt: '2026-01-15',
      status: 'completed',
      role: 'Crowd Management',
      shifts: 'Morning (9 AM - 12 PM)',
      instructions: 'Thank you for your service! Certificate has been issued.',
      certificate: true
    },
    { 
      id: 5, 
      campName: 'Mental Health Awareness', 
      organization: 'Mind Care NGO',
      location: 'University Auditorium',
      campDate: '2026-02-25',
      appliedAt: '2026-02-01',
      status: 'rejected',
      role: 'Event Coordination',
      shifts: 'Evening (4 PM - 8 PM)',
      rejectionReason: 'All volunteer positions have been filled. Please apply for future camps.'
    }
  ];

  const statusConfig = {
    pending: { label: 'Pending', color: 'var(--gray-500)', icon: Clock },
    under_review: { label: 'Under Review', color: 'var(--info-color)', icon: Eye },
    approved: { label: 'Approved', color: 'var(--success-color)', icon: CheckCircle },
    rejected: { label: 'Rejected', color: 'var(--error-color)', icon: XCircle },
    completed: { label: 'Completed', color: 'var(--healthcare-color)', icon: Heart },
  };

  const filteredApplications = filter === 'all' 
    ? myApplications 
    : myApplications.filter(app => app.status === filter);

  return (
    <div className="domain-dashboard">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Volunteer Applications</h1>
          <p className="page-description">Track your healthcare volunteer applications and assignments</p>
        </div>
        <Link to="/healthcare/volunteer/apply" className="btn btn-primary">
          <HandHeart size={18} /> Apply for More
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="stats-grid">
        <div className="stat-card" onClick={() => setFilter('all')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon healthcare">
            <Heart size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{myApplications.length}</div>
            <div className="stat-label">Total Applications</div>
          </div>
        </div>
        <div className="stat-card" onClick={() => setFilter('approved')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon" style={{ background: 'var(--success-light)', color: 'var(--success-color)' }}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{myApplications.filter(a => a.status === 'approved').length}</div>
            <div className="stat-label">Approved</div>
          </div>
        </div>
        <div className="stat-card" onClick={() => setFilter('pending')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon" style={{ background: 'var(--gray-100)', color: 'var(--gray-500)' }}>
            <Loader size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{myApplications.filter(a => a.status === 'pending' || a.status === 'under_review').length}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
        <div className="stat-card" onClick={() => setFilter('completed')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon healthcare">
            <Heart size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{myApplications.filter(a => a.status === 'completed').length}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {['all', 'pending', 'under_review', 'approved', 'completed', 'rejected'].map(status => (
          <button
            key={status}
            className={`filter-tab ${filter === status ? 'active' : ''}`}
            onClick={() => setFilter(status)}
          >
            {status === 'all' ? 'All' : statusConfig[status]?.label || status}
          </button>
        ))}
      </div>

      {/* Applications List */}
      <div className="applications-grid">
        {filteredApplications.map(app => {
          const StatusIcon = statusConfig[app.status].icon;
          
          return (
            <div key={app.id} className="volunteer-app-card">
              <div className="app-header">
                <span 
                  className="status-badge" 
                  style={{ background: `${statusConfig[app.status].color}20`, color: statusConfig[app.status].color }}
                >
                  <StatusIcon size={12} />
                  {statusConfig[app.status].label}
                </span>
                {app.certificate && (
                  <span className="certificate-badge">🏆 Certificate Issued</span>
                )}
              </div>
              
              <h3 className="app-camp-name">{app.campName}</h3>
              <p className="app-organization">{app.organization}</p>
              
              <div className="app-details">
                <div className="app-detail">
                  <MapPin size={14} />
                  <span>{app.location}</span>
                </div>
                <div className="app-detail">
                  <Calendar size={14} />
                  <span>Camp Date: {new Date(app.campDate).toLocaleDateString()}</span>
                </div>
                <div className="app-detail">
                  <Clock size={14} />
                  <span>Applied: {new Date(app.appliedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="app-role-info">
                <span className="role-label">Role:</span>
                <span className="role-value">{app.role}</span>
              </div>
              <div className="app-role-info">
                <span className="role-label">Shift:</span>
                <span className="role-value">{app.shifts}</span>
              </div>

              {app.status === 'approved' && app.instructions && (
                <div className="app-instructions">
                  <strong>📋 Instructions:</strong>
                  <p>{app.instructions}</p>
                </div>
              )}

              {app.status === 'rejected' && app.rejectionReason && (
                <div className="app-rejection">
                  <strong>Reason:</strong>
                  <p>{app.rejectionReason}</p>
                </div>
              )}

              {app.status === 'completed' && app.instructions && (
                <div className="app-completed-note">
                  <p>{app.instructions}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredApplications.length === 0 && (
        <div className="empty-state">
          <Heart size={48} />
          <h3>No applications found</h3>
          <p>You haven't applied for any volunteer positions in this category yet.</p>
          <Link to="/healthcare/volunteer/apply" className="btn btn-primary">
            Apply to Volunteer
          </Link>
        </div>
      )}
    </div>
  );
}

export default MyVolunteerApplicationsPage;
