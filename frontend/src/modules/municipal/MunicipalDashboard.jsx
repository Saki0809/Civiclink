import { useState, useEffect } from 'react';
import { useAuth } from '../../core/auth/AuthContext';
import { usePreferences } from '../../core/preferences/PreferencesContext';
import { supabase } from '../../core/api/supabaseClient';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  Building2, Plus, MapPin, Clock, AlertCircle, CheckCircle, 
  Loader, Map, BarChart3, Bell, Activity, ChevronRight,
  Droplet, Trash2, Zap, ShieldCheck, Info, X
} from 'lucide-react';
import './Municipal.css';

export function MunicipalDashboard() {
  const { user } = useAuth();
  const { t } = usePreferences();
  const { id } = useParams();
  const navigate = useNavigate();
  const isOfficer = ['municipal_officer', 'inspector', 'field_worker'].includes(user?.role);

  const [stats, setStats] = useState([
    { label: t('openIssues'), value: '3', icon: AlertCircle, color: 'var(--warning-color)' },
    { label: t('inProgress'), value: '12', icon: Loader, color: 'var(--info-color)' },
    { label: t('resolved'), value: '156', icon: CheckCircle, color: 'var(--success-color)' },
    { label: t('avgResolution'), value: '4d', icon: Clock, color: 'var(--municipal-color)' },
  ]);

  const [recentIssues, setRecentIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    async function fetchMunicipalData() {
      if (!user) return;
      
      let data = [];
      try {
        let query = supabase.from('municipal_issues').select('*');
        
        // If not officer, filter by current user
        if (!isOfficer) {
          query = query.eq('citizen_id', user.id);
        }
        
        const { data: dbData } = await query.order('created_at', { ascending: false }).limit(5);
        data = dbData || [];
      } catch (err) {
        console.warn('Backend fetch failed, using local and baseline data only.', err);
      }

      // 2. Load Local Storage Issues
      const localIssues = JSON.parse(localStorage.getItem('local_municipal_issues') || '[]')
        .filter(i => !user || i.citizen_id === user.id);
        
      // 3. Robust Baseline Mock Data (Always available)
      const baselineIssues = [
        { id: 'b1', title: 'Road Repair - MG Road', category: 'roads', status: 'in_progress', locality: 'Sector 12', priority: 'high', createdAt: new Date(Date.now() - 86400000).toISOString() },
        { id: 'b2', title: 'Street Light Failure', category: 'street_lights', status: 'submitted', locality: 'Old Town', priority: 'medium', createdAt: new Date(Date.now() - 172800000).toISOString() },
        { id: 'b3', title: 'Garbage Overflow', category: 'garbage', status: 'acknowledged', locality: 'Block C', priority: 'critical', createdAt: new Date(Date.now() - 259200000).toISOString() },
        { id: 'b4', title: 'Water Leakage', category: 'water_supply', status: 'resolved', locality: 'Green Park', priority: 'high', createdAt: new Date(Date.now() - 345600000).toISOString() },
        { id: 'b6', title: 'Drainage Blockage', category: 'drainage', status: 'submitted', locality: 'Housing Colony', priority: 'high', createdAt: new Date(Date.now() - 518400000).toISOString() },
      ];

      // 4. Merge and Sort for Recent List
      const combinedRecent = [...localIssues, ...data, ...baselineIssues]
        .sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at))
        .slice(0, 5);

      setRecentIssues(combinedRecent);

      // 5. Aggregate stats (Database + Local + Baseline)
      let allCombined = [...localIssues];
      try {
        const { data: allDbData } = await supabase
          .from('municipal_issues')
          .select('status')
          .eq('citizen_id', user.id);
        allCombined = [...allCombined, ...(allDbData || [])];
      } catch (err) {
        console.warn('Backend activity summary failed.', err);
      }
      
      const open = allCombined.filter(i => i.status === 'submitted' || i.status === 'acknowledged').length;
      const prog = allCombined.filter(i => i.status === 'in_progress').length;
      const res = allCombined.filter(i => i.status === 'resolved').length;
      
      setStats([
        { label: t('openIssues'), value: (open + 3).toString(), icon: AlertCircle, color: 'var(--warning-color)' },
        { label: t('inProgress'), value: (prog + 1).toString(), icon: Loader, color: 'var(--info-color)' },
        { label: t('resolved'), value: (res + 1).toString(), icon: CheckCircle, color: 'var(--success-color)' },
        { label: t('avgResolution'), value: '4d', icon: Clock, color: 'var(--municipal-color)' },
      ]);
    }

    fetchMunicipalData();
  }, [user, isOfficer, t]);

  // Sync selected issue from URL ID
  useEffect(() => {
    if (id && recentIssues.length > 0) {
      const issue = recentIssues.find(i => i.id === id);
      if (issue && (!selectedIssue || selectedIssue.id !== issue.id)) {
        setSelectedIssue(issue);
      }
    } else if (!id && selectedIssue) {
      setSelectedIssue(null);
    }
  }, [id, recentIssues, selectedIssue]);

  const closeModal = () => {
    navigate('/municipal');
    setSelectedIssue(null);
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedIssue) return;
    setUpdatingStatus(true);
    
    // 1. Update Local Storage for Instant Feedback (Functional Logic)
    const localIssues = JSON.parse(localStorage.getItem('local_municipal_issues') || '[]');
    const updatedLocal = localIssues.map(i => i.id === selectedIssue.id ? { ...i, status: newStatus } : i);
    localStorage.setItem('local_municipal_issues', JSON.stringify(updatedLocal));

    // 2. Best-effort Supabase Sync
    try {
      if (!selectedIssue.id.startsWith('b')) { // Don't sync baseline mock data
        await supabase.from('municipal_issues').update({ status: newStatus }).eq('id', selectedIssue.id);
      }
    } catch (err) {
      console.warn('Silent sync failure during status update:', err);
    }

    // 3. Update local state
    setRecentIssues(prev => prev.map(i => i.id === selectedIssue.id ? { ...i, status: newStatus } : i));
    setSelectedIssue(prev => ({ ...prev, status: newStatus }));
    setUpdatingStatus(false);
  };

  const quickActions = [
    { label: t('reportIssue'), icon: Plus, path: '/municipal/issues/new', color: 'var(--municipal-color)' },
    { label: t('issuesMap'), icon: Map, path: '/municipal/map', color: 'var(--info-color)' },
    { label: t('areaStats') || 'Area Stats', icon: BarChart3, path: '/municipal/stats', color: 'var(--success-color)' },
    { label: t('emergency'), icon: ShieldCheck, path: '/municipal/emergency', color: 'var(--error-color)' },
  ];

  const recentActivity = []; // To be implemented with real triggers

  const notifications = [
    { id: 1, title: 'Water Shutdown Alert', message: 'Planned maintenance in Sector 12 on Feb 8th', urgent: true },
    { id: 2, title: 'Taxes Due', message: 'Property tax payment deadline approaching', urgent: false },
    { id: 3, title: 'New Scheme', message: 'Clean City initiative starts next month', urgent: false },
  ];

  const statusConfig = {
    submitted: { label: t('submitted'), color: 'var(--gray-500)' },
    acknowledged: { label: t('acknowledged'), color: 'var(--info-color)' },
    in_progress: { label: t('inProgress'), color: 'var(--warning-color)' },
    resolved: { label: t('resolved'), color: 'var(--success-color)' },
  };

  const priorityConfig = {
    low: { label: t('low'), color: 'var(--gray-400)' },
    medium: { label: t('medium'), color: 'var(--info-color)' },
    high: { label: t('high'), color: 'var(--warning-color)' },
    critical: { label: t('critical'), color: 'var(--error-color)' },
  };

  const categoryIcons = {
    roads: Building2,
    street_lights: Zap,
    garbage: Trash2,
    water_supply: Droplet,
    drainage: Activity,
    public_spaces: Building2,
  };

  return (
    <div className="municipal-dashboard">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('municipalDashboard')}</h1>
          <p className="page-description">
            {isOfficer ? t('municipalDescOff') : t('municipalDescCiv')}
          </p>
        </div>
        {isOfficer ? (
          <Link to="/municipal/issues/assigned" className="btn btn-primary">
            <AlertCircle size={18} /> {t('viewAll')} ({stats[0].value})
          </Link>
        ) : (
          <div className="header-actions">
            <Link to="/municipal/my-issues" className="btn btn-outline">
              <AlertCircle size={18} /> {t('myReports')}
            </Link>
            <Link to="/municipal/issues/new" className="btn btn-primary">
              <Plus size={18} /> {t('reportIssue')}
            </Link>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="stat-card">
              <div className="stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
                <Icon size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      {!isOfficer && (
        <div className="quick-actions-section">
          <h2 className="section-title">{t('quickActions')}</h2>
          <div className="quick-actions-grid">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link key={index} to={action.path} className="quick-action-card">
                  <div className="action-icon" style={{ background: `${action.color}15`, color: action.color }}>
                    <Icon size={24} />
                  </div>
                  <span className="action-label">{action.label}</span>
                  <ChevronRight size={16} className="action-arrow" />
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        {/* Main Content */}
        <div className="main-content">
          <div className="dashboard-section">
            <div className="section-header">
              <h2>{isOfficer ? t('assignedIssues') : t('myReports')}</h2>
              <Link to={isOfficer ? '/municipal/issues/assigned' : '/municipal/my-issues'} className="section-link">
                {t('viewAll')} <ChevronRight size={16} />
              </Link>
            </div>
            <div className="issues-list">
              {recentIssues.map(issue => {
                const CategoryIcon = categoryIcons[issue.category] || Building2;
                return (
                  <div key={issue.id} className="issue-card-horizontal">
                    <div className="issue-icon-wrapper" style={{ background: 'var(--municipal-color)15' }}>
                      <CategoryIcon size={24} style={{ color: 'var(--municipal-color)' }} />
                    </div>
                    <div className="issue-info">
                      <div className="issue-header-row">
                        <h3 className="issue-title">{issue.title}</h3>
                        <span 
                          className="status-badge"
                          style={{ background: `${statusConfig[issue.status].color}15`, color: statusConfig[issue.status].color }}
                        >
                          {statusConfig[issue.status].label}
                        </span>
                      </div>
                      <div className="issue-meta">
                        <span className="meta-item">
                          <MapPin size={12} /> {issue.locality}
                        </span>
                        <span className="meta-item">
                          <Clock size={12} /> Reported: {new Date(issue.createdAt).toLocaleDateString()}
                        </span>
                        <span className="meta-item" style={{ color: priorityConfig[issue.priority].color }}>
                          <AlertCircle size={12} /> {priorityConfig[issue.priority].label} Priority
                        </span>
                      </div>
                    </div>
                    <div className="issue-actions">
                      <Link 
                        to={isOfficer ? `/municipal/issues/inspect/${issue.id}` : `/municipal/issues/${issue.id}`} 
                        className="view-link"
                      >
                        {isOfficer ? t('inspect') : t('details')}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="sidebar-content">
          {/* Notifications */}
          <div className="dashboard-card notifications-card">
            <div className="card-header">
              <h3><Bell size={18} /> {t('townHallUpdates')}</h3>
              <span className="notification-count">{notifications.filter(n => n.urgent).length}</span>
            </div>
            <div className="notifications-list">
              {notifications.map(notif => (
                <div key={notif.id} className={`notification-item ${notif.urgent ? 'urgent' : ''}`}>
                  <div className="notification-dot" />
                  <div className="notification-content">
                    <h4>{notif.title}</h4>
                    <p>{notif.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="dashboard-card activity-card">
            <div className="card-header">
              <h3><Activity size={18} /> {t('activityLog')}</h3>
            </div>
            <div className="activity-list">
              {recentActivity.map(activity => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-icon" style={{ background: `${activity.color}15`, color: activity.color }}>
                      <Icon size={16} />
                    </div>
                    <div className="activity-content">
                      <p>{activity.message}</p>
                      <span className="activity-time">{activity.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Citizen Tip */}
          <div className="dashboard-card tips-card municipal">
            <div className="card-header">
              <h3><Info size={18} /> {t('civicTip')}</h3>
            </div>
            <div className="tip-content">
              <p>🌱 <strong>Waste Segregation</strong></p>
              <p>Segregating wet and dry waste helps in better recycling and reduces landfill burden. Use green bins for organic and blue for dry waste.</p>
            </div>
          </div>
        </div>
      </div>
      {/* Issue Detail Modal */}
      {selectedIssue && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content municipal-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              <X size={20} />
            </button>
            <div className="hc-modal-header municipal">
              <div className="hc-modal-icon" style={{ background: 'var(--municipal-color)15', color: 'var(--municipal-color)' }}>
                <Building2 size={32} />
              </div>
              <h3 className="hc-modal-title">{selectedIssue.title}</h3>
              <p className="hc-modal-desc">{selectedIssue.locality}</p>
            </div>
            
            <div className="registration-form">
              <div className="registration-field">
                <label>Current Status</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                   <span 
                    className="status-badge"
                    style={{ 
                      background: `${statusConfig[selectedIssue.status].color}15`, 
                      color: statusConfig[selectedIssue.status].color,
                      fontSize: '1rem',
                      padding: '0.5rem 1rem'
                    }}
                  >
                    {statusConfig[selectedIssue.status].label}
                  </span>
                </div>
              </div>

              <div className="registration-field">
                <label>Report Details</label>
                <div style={{ background: 'var(--bg-100)', padding: '1rem', borderRadius: '8px', marginTop: '0.5rem' }}>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <MapPin size={14} /> <strong>Location:</strong> {selectedIssue.locality}
                  </p>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Clock size={14} /> <strong>Reported On:</strong> {new Date(selectedIssue.createdAt).toLocaleDateString()}
                  </p>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertCircle size={14} style={{ color: priorityConfig[selectedIssue.priority].color }} /> 
                    <strong>Priority:</strong> <span style={{ color: priorityConfig[selectedIssue.priority].color }}>{priorityConfig[selectedIssue.priority].label}</span>
                  </p>
                </div>
              </div>

              {isOfficer && (
                <div className="registration-field">
                  <label>Update Status (Officer Only)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
                    <button 
                      className="btn btn-outline" 
                      disabled={updatingStatus || selectedIssue.status === 'in_progress'}
                      onClick={() => handleUpdateStatus('in_progress')}
                    >
                      Process Issue
                    </button>
                    <button 
                      className="btn btn-primary" 
                      style={{ background: 'var(--success-color)', borderColor: 'var(--success-color)' }}
                      disabled={updatingStatus || selectedIssue.status === 'resolved'}
                      onClick={() => handleUpdateStatus('resolved')}
                    >
                      Mark Resolved
                    </button>
                  </div>
                </div>
              )}

              <div className="registration-actions" style={{ marginTop: '2rem' }}>
                <button className="registration-btn-cancel" onClick={closeModal} style={{ width: '100%' }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MunicipalDashboard;
