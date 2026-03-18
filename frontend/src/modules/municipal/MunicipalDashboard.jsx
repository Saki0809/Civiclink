import { useAuth } from '../../core/auth/AuthContext';
import { usePreferences } from '../../core/preferences/PreferencesContext';
import { Link } from 'react-router-dom';
import { 
  Building2, Plus, MapPin, Clock, AlertCircle, CheckCircle, 
  Loader, Map, BarChart3, Bell, Activity, ChevronRight,
  Droplet, Trash2, Zap, ShieldCheck, Info
} from 'lucide-react';
import './Municipal.css';

export function MunicipalDashboard() {
  const { user } = useAuth();
  const { t } = usePreferences();
  const isOfficer = ['municipal_officer', 'inspector', 'field_worker'].includes(user?.role);

  const stats = [
    { label: t('openIssues'), value: '23', icon: AlertCircle, color: 'var(--warning-color)' },
    { label: t('inProgress'), value: '15', icon: Loader, color: 'var(--info-color)' },
    { label: t('resolved'), value: '142', icon: CheckCircle, color: 'var(--success-color)' },
    { label: t('avgResolution'), value: '3.2d', icon: Clock, color: 'var(--municipal-color)' },
  ];

  const quickActions = [
    { label: t('reportIssue'), icon: Plus, path: '/municipal/issues/new', color: 'var(--municipal-color)' },
    { label: t('issuesMap'), icon: Map, path: '/municipal/map', color: 'var(--info-color)' },
    { label: t('areaStats') || 'Area Stats', icon: BarChart3, path: '/municipal/stats', color: 'var(--success-color)' },
    { label: t('emergency'), icon: ShieldCheck, path: '/municipal/emergency', color: 'var(--error-color)' },
  ];

  const recentIssues = [
    { id: 1, title: 'Pothole on Main Street', category: 'roads', status: 'in_progress', locality: 'Sector 12', priority: 'high', createdAt: '2026-02-03', updatedAt: '2 hours ago' },
    { id: 2, title: 'Street Light Not Working', category: 'street_lights', status: 'submitted', locality: 'Park Avenue', priority: 'medium', createdAt: '2026-02-04', updatedAt: '5 hours ago' },
    { id: 3, title: 'Garbage Not Collected', category: 'garbage', status: 'acknowledged', locality: 'Green Colony', priority: 'high', createdAt: '2026-02-02', updatedAt: '1 day ago' },
    { id: 4, title: 'Water Supply Issue', category: 'water_supply', status: 'resolved', locality: 'New Town', priority: 'critical', createdAt: '2026-01-28', updatedAt: '3 days ago' },
  ];

  const recentActivity = [
    { id: 1, message: 'Issue #1234 status updated to "In Progress"', time: '2 hours ago', icon: Loader, color: 'var(--info-color)' },
    { id: 2, message: 'Acknowledge received for "Street Light" complaint', time: '5 hours ago', icon: CheckCircle, color: 'var(--success-color)' },
    { id: 3, message: 'New waste collection schedule announced for Sector 15', time: '1 day ago', icon: Info, color: 'var(--municipal-color)' },
    { id: 4, message: 'Your report "Garbage Collection" was assigned to an officer', time: '1 day ago', icon: Building2, color: 'var(--gray-500)' },
  ];

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
                      <Link to={`/municipal/issues/${issue.id}`} className="view-link">
                        {t('details')}
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
    </div>
  );
}

export default MunicipalDashboard;
