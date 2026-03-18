import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Clock, AlertCircle, CheckCircle, Loader, Eye, Calendar, ArrowUpRight } from 'lucide-react';
import '../DomainDashboard.css';
import './Municipal.css';

export function MyIssuesPage() {
  const [filter, setFilter] = useState('all');

  // Dummy data for user's submitted issues
  const myIssues = [
    { 
      id: 1, 
      title: 'Pothole on Main Street', 
      category: 'roads', 
      status: 'in_progress', 
      locality: 'Sector 12', 
      priority: 'high', 
      createdAt: '2026-02-03',
      updatedAt: '2026-02-04',
      ticketNumber: 'MUN-2026-4521',
      updates: [
        { date: '2026-02-04', message: 'Issue assigned to road maintenance team', status: 'in_progress' },
        { date: '2026-02-03', message: 'Issue acknowledged by municipal office', status: 'acknowledged' },
        { date: '2026-02-03', message: 'Issue submitted successfully', status: 'submitted' }
      ]
    },
    { 
      id: 2, 
      title: 'Street Light Not Working', 
      category: 'street_lights', 
      status: 'acknowledged', 
      locality: 'Park Avenue', 
      priority: 'medium', 
      createdAt: '2026-02-04',
      updatedAt: '2026-02-04',
      ticketNumber: 'MUN-2026-4532',
      updates: [
        { date: '2026-02-04', message: 'Issue acknowledged, scheduled for inspection', status: 'acknowledged' },
        { date: '2026-02-04', message: 'Issue submitted successfully', status: 'submitted' }
      ]
    },
    { 
      id: 3, 
      title: 'Garbage Not Collected for 3 Days', 
      category: 'garbage', 
      status: 'resolved', 
      locality: 'Green Colony', 
      priority: 'high', 
      createdAt: '2026-01-28',
      updatedAt: '2026-01-30',
      ticketNumber: 'MUN-2026-4102',
      updates: [
        { date: '2026-01-30', message: 'Issue resolved - garbage collection completed', status: 'resolved' },
        { date: '2026-01-29', message: 'Sanitation team dispatched', status: 'in_progress' },
        { date: '2026-01-28', message: 'Issue submitted successfully', status: 'submitted' }
      ]
    },
    { 
      id: 4, 
      title: 'Water Pipeline Leak', 
      category: 'water_supply', 
      status: 'submitted', 
      locality: 'New Town', 
      priority: 'critical', 
      createdAt: '2026-02-05',
      updatedAt: '2026-02-05',
      ticketNumber: 'MUN-2026-4598',
      updates: [
        { date: '2026-02-05', message: 'Issue submitted successfully', status: 'submitted' }
      ]
    }
  ];

  const statusConfig = {
    submitted: { label: 'Submitted', color: 'var(--gray-500)', icon: Clock },
    acknowledged: { label: 'Acknowledged', color: 'var(--info-color)', icon: Eye },
    in_progress: { label: 'In Progress', color: 'var(--warning-color)', icon: Loader },
    resolved: { label: 'Resolved', color: 'var(--success-color)', icon: CheckCircle },
  };

  const priorityConfig = {
    low: { label: 'Low', color: 'var(--gray-400)' },
    medium: { label: 'Medium', color: 'var(--info-color)' },
    high: { label: 'High', color: 'var(--warning-color)' },
    critical: { label: 'Critical', color: 'var(--error-color)' },
  };

  const filteredIssues = filter === 'all' 
    ? myIssues 
    : myIssues.filter(issue => issue.status === filter);

  const [expandedIssue, setExpandedIssue] = useState(null);

  return (
    <div className="domain-dashboard">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Reported Issues</h1>
          <p className="page-description">Track the status of your submitted municipal issues</p>
        </div>
        <Link to="/municipal/issues/new" className="btn btn-primary">
          <AlertCircle size={18} /> Report New Issue
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="stats-grid">
        <div className="stat-card" onClick={() => setFilter('all')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon" style={{ background: 'var(--gray-100)', color: 'var(--gray-600)' }}>
            <Building2 size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{myIssues.length}</div>
            <div className="stat-label">Total Issues</div>
          </div>
        </div>
        <div className="stat-card" onClick={() => setFilter('in_progress')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon" style={{ background: 'var(--warning-light)', color: 'var(--warning-color)' }}>
            <Loader size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{myIssues.filter(i => i.status === 'in_progress').length}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>
        <div className="stat-card" onClick={() => setFilter('resolved')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon" style={{ background: 'var(--success-light)', color: 'var(--success-color)' }}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{myIssues.filter(i => i.status === 'resolved').length}</div>
            <div className="stat-label">Resolved</div>
          </div>
        </div>
        <div className="stat-card" onClick={() => setFilter('submitted')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon" style={{ background: 'var(--gray-100)', color: 'var(--gray-500)' }}>
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{myIssues.filter(i => i.status === 'submitted' || i.status === 'acknowledged').length}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {['all', 'submitted', 'acknowledged', 'in_progress', 'resolved'].map(status => (
          <button
            key={status}
            className={`filter-tab ${filter === status ? 'active' : ''}`}
            onClick={() => setFilter(status)}
          >
            {status === 'all' ? 'All Issues' : statusConfig[status]?.label || status}
          </button>
        ))}
      </div>

      {/* Issues List */}
      <div className="my-issues-list">
        {filteredIssues.map(issue => {
          const StatusIcon = statusConfig[issue.status].icon;
          const isExpanded = expandedIssue === issue.id;
          
          return (
            <div key={issue.id} className={`my-issue-card ${isExpanded ? 'expanded' : ''}`}>
              <div className="issue-main" onClick={() => setExpandedIssue(isExpanded ? null : issue.id)}>
                <div className="issue-status-indicator" style={{ background: statusConfig[issue.status].color }} />
                
                <div className="issue-info">
                  <div className="issue-header-row">
                    <span className="issue-ticket">{issue.ticketNumber}</span>
                    <span 
                      className="priority-badge" 
                      style={{ background: `${priorityConfig[issue.priority].color}20`, color: priorityConfig[issue.priority].color }}
                    >
                      {priorityConfig[issue.priority].label}
                    </span>
                  </div>
                  <h3 className="issue-title">{issue.title}</h3>
                  <div className="issue-meta">
                    <span><MapPin size={12} /> {issue.locality}</span>
                    <span><Calendar size={12} /> {new Date(issue.createdAt).toLocaleDateString()}</span>
                    <span className="issue-category">{issue.category.replace('_', ' ')}</span>
                  </div>
                </div>
                
                <div className="issue-status">
                  <span 
                    className="status-badge large" 
                    style={{ background: `${statusConfig[issue.status].color}20`, color: statusConfig[issue.status].color }}
                  >
                    <StatusIcon size={14} />
                    {statusConfig[issue.status].label}
                  </span>
                  <ArrowUpRight size={16} className={`expand-icon ${isExpanded ? 'rotated' : ''}`} />
                </div>
              </div>
              
              {isExpanded && (
                <div className="issue-timeline">
                  <h4>Status Updates</h4>
                  <div className="timeline">
                    {issue.updates.map((update, idx) => (
                      <div key={idx} className="timeline-item">
                        <div 
                          className="timeline-dot" 
                          style={{ background: statusConfig[update.status].color }}
                        />
                        <div className="timeline-content">
                          <span className="timeline-date">{new Date(update.date).toLocaleDateString()}</span>
                          <p className="timeline-message">{update.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredIssues.length === 0 && (
        <div className="empty-state">
          <Building2 size={48} />
          <h3>No issues found</h3>
          <p>You haven't reported any issues in this category yet.</p>
          <Link to="/municipal/issues/new" className="btn btn-primary">
            Report an Issue
          </Link>
        </div>
      )}
    </div>
  );
}

export default MyIssuesPage;
