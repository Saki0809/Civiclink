import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../core/auth/AuthContext';
import { supabase } from '../../core/api/supabaseClient';
import { Building2, MapPin, Clock, AlertCircle, CheckCircle, MessageSquare, ArrowRight, Loader2 } from 'lucide-react';
import '../DomainDashboard.css';
import './Municipal.css';

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
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [updateText, setUpdateText] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    async function fetchAssigned() {
      if (!user) return;
      try {
        setLoading(true);
        // 1. Fetch from DB
        const { data, error } = await supabase
          .from('municipal_issues')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // 2. Baseline Mock Data for Officers
        const baselineIssues = [
          { id: 'b1', title: 'Road Repair - MG Road', category: 'roads', status: 'in_progress', priority: 'high', locality: 'Sector 12', citizen_name: 'Rajesh Kumar', citizen_phone: '+91 98765 43210', created_at: '2026-03-31', last_update: '2026-03-31', description: 'Large pothole near the intersection. Traffic slowed.', updates_count: 3 },
          { id: 'b2', title: 'Street Light Failure', category: 'street_lights', status: 'submitted', priority: 'medium', locality: 'Old Town', citizen_name: 'Priya Sharma', citizen_phone: '+91 87654 32109', created_at: '2026-04-01', last_update: '2026-04-01', description: 'Dark area unsafe for pedestrians.', updates_count: 0 },
          { id: 'b3', title: 'Garbage Overflow', category: 'garbage', status: 'acknowledged', priority: 'critical', locality: 'Block C', citizen_name: 'Amit Patel', citizen_phone: '+91 76543 21098', created_at: '2026-03-30', last_update: '2026-03-31', description: 'Health hazard near school gate.', updates_count: 2 },
        ];

        const combined = [...(data || []), ...baselineIssues];
        setIssues(combined);
        if (combined.length > 0) setSelectedIssue(combined[0]);
      } catch (err) {
        console.error('Error fetching assigned issues:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAssigned();
  }, [user]);

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedIssue) return;
    
    setIsUpdating(true);
    const updatedStatus = newStatus || selectedIssue.status;
    
    try {
      // 1. Update Local State for instant feedback
      setIssues(prev => prev.map(ish => ish.id === selectedIssue.id ? { ...ish, status: updatedStatus, last_update: 'Just now' } : ish));
      setSelectedIssue(prev => ({ ...prev, status: updatedStatus, last_update: 'Just now' }));

      // 2. Update Local Storage for persistence
      const localIssues = JSON.parse(localStorage.getItem('local_municipal_issues') || '[]');
      const updatedLocal = localIssues.map(i => i.id === selectedIssue.id ? { ...i, status: updatedStatus } : i);
      localStorage.setItem('local_municipal_issues', JSON.stringify(updatedLocal));

      // 3. Sync to DB if not baseline
      if (typeof selectedIssue.id === 'number' || !selectedIssue.id.toString().startsWith('b')) {
        await supabase.from('municipal_issues').update({ status: updatedStatus }).eq('id', selectedIssue.id);
      }

      setUpdateText('');
      setNewStatus('');
    } catch (err) {
      console.warn('Sync warning:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="assigned-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Assigned Issues</h1>
          <p className="page-description">
            {issues.length} issues assigned to you in {user?.zone || 'your zone'}
          </p>
        </div>
      </div>

      <div className="issues-layout">
        <div className="issues-list-panel">
          {loading ? (
            <div className="panel-loading">
              <Loader2 size={24} className="spin" />
              <p>Loading assignments...</p>
            </div>
          ) : issues.length > 0 ? (
            issues.map(issue => (
              <div 
                key={issue.id} 
                className={`issue-card ${selectedIssue?.id === issue.id ? 'selected' : ''}`}
                onClick={() => setSelectedIssue(issue)}
              >
                <div className="issue-card-header">
                  <span 
                    className="priority-dot" 
                    style={{ background: priorityConfig[issue.priority]?.color || 'var(--gray-400)' }}
                    title={priorityConfig[issue.priority]?.label || 'Medium'}
                  />
                  <span 
                    className="status-tag"
                    style={{ background: statusConfig[issue.status]?.bg || 'var(--gray-100)', color: statusConfig[issue.status]?.color || 'var(--gray-500)' }}
                  >
                    {statusConfig[issue.status]?.label || issue.status}
                  </span>
                </div>
                <h4 className="issue-card-title">{issue.title}</h4>
                <div className="issue-card-meta">
                  <span><MapPin size={12} /> {issue.locality}</span>
                  <span><Clock size={12} /> {issue.last_update || new Date(issue.created_at).toLocaleDateString()}</span>
                  <span><MessageSquare size={12} /> {issue.updates_count || 0}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="no-issues">No issues assigned to you.</div>
          )}
        </div>

        <div className="issue-detail-panel">
          {selectedIssue ? (
            <>
              <div className="detail-header">
                <div className="detail-badges">
                  <span 
                    className="status-tag large"
                    style={{ background: statusConfig[selectedIssue.status]?.bg, color: statusConfig[selectedIssue.status]?.color }}
                  >
                    {statusConfig[selectedIssue.status]?.label}
                  </span>
                  <span 
                    className="priority-tag"
                    style={{ color: priorityConfig[selectedIssue.priority]?.color }}
                  >
                    {priorityConfig[selectedIssue.priority]?.label} Priority
                  </span>
                </div>
                <h2>{selectedIssue.title}</h2>
                <p className="detail-category">{selectedIssue.category?.replace('_', ' ')}</p>
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
                <p><strong>{selectedIssue.citizen_name || 'Anonymous'}</strong></p>
                <p>{selectedIssue.citizen_phone}</p>
                <p className="text-muted">Reported on {new Date(selectedIssue.created_at).toLocaleDateString()}</p>
              </div>

              <div className="update-history-section detail-section">
                <h3>Update History</h3>
                <div className="timeline">
                  <div className="timeline-item">
                    <div className="timeline-dot" />
                    <div className="timeline-content">
                      <p><strong>Last Activity</strong> - {selectedIssue.last_update || 'Initial review'}</p>
                      <span>{new Date().toLocaleString()}</span>
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
                      <option value="acknowledged">Acknowledge</option>
                      <option value="in_progress">In Progress</option>
                      <option value="on_hold">On Hold</option>
                      <option value="resolved">Mark Resolved</option>
                    </select>
                  </div>
                  <button type="submit" className="btn btn-municipal btn-lg" disabled={isUpdating}>
                    {isUpdating ? <Loader2 size={18} className="spin" /> : <CheckCircle size={18} />} 
                    {isUpdating ? ' Updating...' : ' Submit Status Update'}
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
