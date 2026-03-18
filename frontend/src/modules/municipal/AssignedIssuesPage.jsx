import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../core/auth/AuthContext';
import { Building2, MapPin, Clock, AlertCircle, CheckCircle, MessageSquare, ArrowRight } from 'lucide-react';
import '../DomainDashboard.css';
import './Municipal.css';

// Dummy assigned issues data
const assignedIssues = [
  {
    id: 1,
    title: 'Pothole on Main Street causing traffic issues',
    category: 'roads',
    status: 'in_progress',
    priority: 'high',
    locality: 'Sector 12',
    citizen_name: 'Rajesh Kumar',
    citizen_phone: '+91 98765 43210',
    created_at: '2026-02-03',
    last_update: '2026-02-04',
    description: 'Large pothole near the intersection of Main Street and 5th Avenue. Multiple vehicles have been damaged.',
    updates_count: 3,
  },
  {
    id: 2,
    title: 'Street Light Not Working - Dark area unsafe',
    category: 'street_lights',
    status: 'acknowledged',
    priority: 'medium',
    locality: 'Park Avenue',
    citizen_name: 'Priya Sharma',
    citizen_phone: '+91 87654 32109',
    created_at: '2026-02-04',
    last_update: '2026-02-04',
    description: 'Street light at pole #456 near Park Avenue has been out for a week. Area is very dark at night.',
    updates_count: 1,
  },
  {
    id: 3,
    title: 'Garbage Not Collected for 3 days',
    category: 'garbage',
    status: 'in_progress',
    priority: 'high',
    locality: 'Green Colony',
    citizen_name: 'Amit Patel',
    citizen_phone: '+91 76543 21098',
    created_at: '2026-02-02',
    last_update: '2026-02-03',
    description: 'Garbage has not been collected from Block B, Green Colony. Bad smell and health hazard.',
    updates_count: 4,
  },
  {
    id: 4,
    title: 'Water pipeline leak flooding street',
    category: 'water_supply',
    status: 'acknowledged',
    priority: 'critical',
    locality: 'New Town',
    citizen_name: 'Sunita Devi',
    citizen_phone: '+91 65432 10987',
    created_at: '2026-02-04',
    last_update: '2026-02-04',
    description: 'Major water pipeline leak near New Town market. Water is flooding the street and shops.',
    updates_count: 2,
  },
];

const statusConfig = {
  submitted: { label: 'New', color: 'var(--gray-500)', bg: 'var(--gray-100)' },
  acknowledged: { label: 'Acknowledged', color: 'var(--info-color)', bg: '#cffafe' },
  in_progress: { label: 'In Progress', color: 'var(--warning-color)', bg: '#fef3c7' },
  on_hold: { label: 'On Hold', color: 'var(--gray-600)', bg: 'var(--gray-200)' },
  resolved: { label: 'Resolved', color: 'var(--success-color)', bg: '#d1fae5' },
};

const priorityConfig = {
  low: { label: 'Low', color: 'var(--gray-400)' },
  medium: { label: 'Medium', color: 'var(--info-color)' },
  high: { label: 'High', color: 'var(--warning-color)' },
  critical: { label: 'Critical', color: 'var(--error-color)' },
};

export function AssignedIssuesPage() {
  const { user } = useAuth();
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [updateText, setUpdateText] = useState('');
  const [newStatus, setNewStatus] = useState('');

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    alert(`Update submitted: "${updateText}" with status change to "${newStatus || 'No change'}"`);
    setUpdateText('');
    setNewStatus('');
  };

  return (
    <div className="assigned-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Assigned Issues</h1>
          <p className="page-description">
            {assignedIssues.length} issues assigned to you in {user?.zone || 'your zone'}
          </p>
        </div>
      </div>

      <div className="issues-layout">
        <div className="issues-list-panel">
          {assignedIssues.map(issue => (
            <div 
              key={issue.id} 
              className={`issue-card ${selectedIssue?.id === issue.id ? 'selected' : ''}`}
              onClick={() => setSelectedIssue(issue)}
            >
              <div className="issue-card-header">
                <span 
                  className="priority-dot" 
                  style={{ background: priorityConfig[issue.priority].color }}
                  title={priorityConfig[issue.priority].label}
                />
                <span 
                  className="status-tag"
                  style={{ background: statusConfig[issue.status].bg, color: statusConfig[issue.status].color }}
                >
                  {statusConfig[issue.status].label}
                </span>
              </div>
              <h4 className="issue-card-title">{issue.title}</h4>
              <div className="issue-card-meta">
                <span><MapPin size={12} /> {issue.locality}</span>
                <span><Clock size={12} /> {issue.last_update}</span>
                <span><MessageSquare size={12} /> {issue.updates_count}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="issue-detail-panel">
          {selectedIssue ? (
            <>
              <div className="detail-header">
                <div className="detail-badges">
                  <span 
                    className="status-tag large"
                    style={{ background: statusConfig[selectedIssue.status].bg, color: statusConfig[selectedIssue.status].color }}
                  >
                    {statusConfig[selectedIssue.status].label}
                  </span>
                  <span 
                    className="priority-tag"
                    style={{ color: priorityConfig[selectedIssue.priority].color }}
                  >
                    {priorityConfig[selectedIssue.priority].label} Priority
                  </span>
                </div>
                <h2>{selectedIssue.title}</h2>
                <p className="detail-category">{selectedIssue.category.replace('_', ' ')}</p>
              </div>

              <div className="detail-section">
                <h3>Description</h3>
                <p>{selectedIssue.description}</p>
              </div>

              <div className="detail-section">
                <h3>Location</h3>
                <p><MapPin size={14} /> {selectedIssue.locality}</p>
              </div>

              <div className="detail-section">
                <h3>Reported By</h3>
                <p><strong>{selectedIssue.citizen_name}</strong></p>
                <p>{selectedIssue.citizen_phone}</p>
                <p className="text-muted">Reported on {selectedIssue.created_at}</p>
              </div>

              <div className="detail-section">
                <h3>Update History</h3>
                <div className="timeline">
                  <div className="timeline-item">
                    <div className="timeline-dot" />
                    <div className="timeline-content">
                      <p><strong>Acknowledge Receipt</strong> - Investigation started</p>
                      <span>2026-02-04 10:30 AM</span>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-dot" />
                    <div className="timeline-content">
                      <p><strong>Initial Report</strong> - Ticket created by citizen</p>
                      <span>2026-02-04 09:00 AM</span>
                    </div>
                  </div>
                </div>
              </div>

              <form className="update-form officer-update" onSubmit={handleUpdateSubmit}>
                <h3>Post Progress Update</h3>
                <p className="form-hint">Update the citizen on the current status of their report.</p>
                <textarea
                  className="form-textarea"
                  placeholder="Provide specific details about the progress or any requirements..."
                  rows={3}
                  value={updateText}
                  onChange={(e) => setUpdateText(e.target.value)}
                  required
                />
                <div className="update-actions">
                  <div className="status-selector">
                    <label>New Status</label>
                    <select 
                      className="form-select"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                    >
                      <option value="">No Change</option>
                      <option value="in_progress">In Progress</option>
                      <option value="on_hold">On Hold</option>
                      <option value="resolved">Mark Resolved</option>
                    </select>
                  </div>
                  <button type="submit" className="btn btn-municipal btn-lg">
                    <CheckCircle size={18} /> Submit Status Update
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="no-selection">
              <AlertCircle size={48} />
              <h3>Select an Issue</h3>
              <p>Click on an issue from the list to view details and add updates</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AssignedIssuesPage;
