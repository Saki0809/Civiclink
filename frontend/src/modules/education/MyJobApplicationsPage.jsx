import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, MapPin, Clock, CheckCircle, XCircle, Loader, Calendar, Briefcase, Eye, FileText } from 'lucide-react';
import '../DomainDashboard.css';
import './Education.css';

export function MyJobApplicationsPage() {
  const [filter, setFilter] = useState('all');

  // Dummy data for user's job applications
  const myApplications = [
    { 
      id: 1, 
      jobTitle: 'Software Developer Intern', 
      institution: 'Tech Academy',
      type: 'internship',
      location: 'Remote',
      appliedAt: '2026-02-01',
      status: 'shortlisted',
      salary: '₹15,000 - ₹20,000/month',
      nextStep: 'Technical Interview scheduled for Feb 10, 2026 at 11:00 AM',
      interviewLink: 'https://meet.example.com/abc123'
    },
    { 
      id: 2, 
      jobTitle: 'Content Writer', 
      institution: 'Digital Media House',
      type: 'full_time',
      location: 'New Town',
      appliedAt: '2026-02-03',
      status: 'under_review',
      salary: '₹25,000 - ₹35,000/month',
      nextStep: null
    },
    { 
      id: 3, 
      jobTitle: 'Mathematics Teacher', 
      institution: 'City Public School',
      type: 'full_time',
      location: 'Sector 15',
      appliedAt: '2026-01-28',
      status: 'rejected',
      salary: '₹35,000 - ₹45,000/month',
      rejectionReason: 'We have selected another candidate whose experience better matches our requirements.'
    },
    { 
      id: 4, 
      jobTitle: 'Research Assistant', 
      institution: 'National University',
      type: 'part_time',
      location: 'Campus',
      appliedAt: '2026-02-04',
      status: 'applied',
      salary: '₹18,000 - ₹25,000/month',
      nextStep: null
    },
    { 
      id: 5, 
      jobTitle: 'Data Entry Operator', 
      institution: 'Municipal Corporation',
      type: 'contract',
      location: 'Park Avenue',
      appliedAt: '2026-01-20',
      status: 'hired',
      salary: '₹12,000 - ₹15,000/month',
      startDate: '2026-02-01',
      nextStep: 'Congratulations! Report to HR on your start date with documents.'
    },
    { 
      id: 6, 
      jobTitle: 'Merit Scholarship 2026', 
      institution: 'Education Foundation',
      type: 'scholarship',
      location: 'Online',
      appliedAt: '2026-01-25',
      status: 'approved',
      salary: 'Up to ₹1,00,000/year',
      nextStep: 'Scholarship approved! Amount will be credited to your registered bank account.'
    }
  ];

  const statusConfig = {
    applied: { label: 'Applied', color: 'var(--gray-500)', icon: Clock },
    under_review: { label: 'Under Review', color: 'var(--info-color)', icon: Eye },
    shortlisted: { label: 'Shortlisted', color: 'var(--education-color)', icon: FileText },
    approved: { label: 'Approved', color: 'var(--success-color)', icon: CheckCircle },
    hired: { label: 'Hired', color: 'var(--success-color)', icon: CheckCircle },
    rejected: { label: 'Not Selected', color: 'var(--error-color)', icon: XCircle },
  };

  const typeConfig = {
    full_time: { label: 'Full Time', color: 'var(--success-color)' },
    part_time: { label: 'Part Time', color: 'var(--info-color)' },
    internship: { label: 'Internship', color: 'var(--education-color)' },
    contract: { label: 'Contract', color: 'var(--warning-color)' },
    scholarship: { label: 'Scholarship', color: 'var(--primary-600)' },
  };

  const filteredApplications = filter === 'all' 
    ? myApplications 
    : myApplications.filter(app => app.status === filter);

  return (
    <div className="domain-dashboard">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Job Applications</h1>
          <p className="page-description">Track your job applications and scholarship requests</p>
        </div>
        <Link to="/education/jobs/apply" className="btn btn-primary">
          <Briefcase size={18} /> Browse More Jobs
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="stats-grid">
        <div className="stat-card" onClick={() => setFilter('all')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon education">
            <GraduationCap size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{myApplications.length}</div>
            <div className="stat-label">Total Applications</div>
          </div>
        </div>
        <div className="stat-card" onClick={() => setFilter('shortlisted')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon" style={{ background: 'var(--education-light)', color: 'var(--education-color)' }}>
            <FileText size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{myApplications.filter(a => a.status === 'shortlisted').length}</div>
            <div className="stat-label">Shortlisted</div>
          </div>
        </div>
        <div className="stat-card" onClick={() => setFilter('hired')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon" style={{ background: 'var(--success-light)', color: 'var(--success-color)' }}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{myApplications.filter(a => a.status === 'hired' || a.status === 'approved').length}</div>
            <div className="stat-label">Successful</div>
          </div>
        </div>
        <div className="stat-card" onClick={() => setFilter('under_review')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon" style={{ background: 'var(--gray-100)', color: 'var(--gray-500)' }}>
            <Loader size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{myApplications.filter(a => a.status === 'applied' || a.status === 'under_review').length}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {['all', 'applied', 'under_review', 'shortlisted', 'hired', 'rejected'].map(status => (
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
      <div className="job-applications-list">
        {filteredApplications.map(app => {
          const StatusIcon = statusConfig[app.status].icon;
          
          return (
            <div key={app.id} className="job-app-card">
              <div className="job-app-main">
                <div className="job-app-header">
                  <span 
                    className="job-type" 
                    style={{ background: `${typeConfig[app.type].color}20`, color: typeConfig[app.type].color }}
                  >
                    {typeConfig[app.type].label}
                  </span>
                  <span 
                    className="status-badge" 
                    style={{ background: `${statusConfig[app.status].color}20`, color: statusConfig[app.status].color }}
                  >
                    <StatusIcon size={12} />
                    {statusConfig[app.status].label}
                  </span>
                </div>
                
                <h3 className="job-app-title">{app.jobTitle}</h3>
                <p className="job-app-institution">{app.institution}</p>
                
                <div className="job-app-details">
                  <div className="job-app-detail">
                    <MapPin size={14} />
                    <span>{app.location}</span>
                  </div>
                  <div className="job-app-detail">
                    <Calendar size={14} />
                    <span>Applied: {new Date(app.appliedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="job-app-salary">
                  <strong>{app.salary}</strong>
                </div>
              </div>

              {app.status === 'shortlisted' && (
                <div className="job-app-timeline">
                  <div className="timeline-item">
                    <div className="timeline-dot success" />
                    <div className="timeline-content">
                      <p><strong>Shortlisted</strong> - Technical round scheduled</p>
                      <span>2026-02-04</span>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-dot success" />
                    <div className="timeline-content">
                      <p><strong>Assessment Passed</strong> - 92/100 score</p>
                      <span>2026-02-03</span>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-dot" />
                    <div className="timeline-content">
                      <p><strong>Applied</strong> - Application received</p>
                      <span>2026-02-01</span>
                    </div>
                  </div>
                </div>
              )}

              {app.nextStep && (
                <div className={`job-app-next-step ${app.status === 'shortlisted' ? 'interview' : app.status === 'hired' || app.status === 'approved' ? 'success' : ''}`}>
                  <div className="next-step-header">
                    <strong>📌 Next Step:</strong>
                    {app.interviewLink && <span className="urgent-badge">Action Required</span>}
                  </div>
                  <p>{app.nextStep}</p>
                  {app.interviewLink && (
                    <a href={app.interviewLink} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-education">
                      Join Interview <ArrowRight size={14} />
                    </a>
                  )}
                </div>
              )}

              {app.status === 'rejected' && app.rejectionReason && (
                <div className="job-app-rejection">
                  <strong>Feedback:</strong>
                  <p>{app.rejectionReason}</p>
                </div>
              )}

              {app.status === 'hired' && app.startDate && (
                <div className="job-app-start-date">
                  <strong>🗓️ Start Date:</strong> {new Date(app.startDate).toLocaleDateString()}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredApplications.length === 0 && (
        <div className="empty-state">
          <GraduationCap size={48} />
          <h3>No applications found</h3>
          <p>You haven't applied for any jobs in this category yet.</p>
          <Link to="/education/jobs/apply" className="btn btn-primary">
            Browse Jobs
          </Link>
        </div>
      )}
    </div>
  );
}

export default MyJobApplicationsPage;
