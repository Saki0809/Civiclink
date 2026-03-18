import { useAuth } from '../../core/auth/AuthContext';
import { usePreferences } from '../../core/preferences/PreferencesContext';
import { Link } from 'react-router-dom';
import { 
  Heart, Plus, Calendar, MapPin, Users, Clock, HandHeart, FileText, 
  Activity, Bell, TrendingUp, Droplet, Stethoscope, Syringe, Eye,
  ChevronRight, CheckCircle, AlertCircle, Star
} from 'lucide-react';
import './Healthcare.css';

export function HealthcareDashboard() {
  const { user } = useAuth();
  const { t } = usePreferences();
  const isInstitution = ['hospital_admin', 'medical_ngo', 'health_department'].includes(user?.role);

  const stats = [
    { label: t('activeCamps'), value: '12', icon: Heart, trend: '+3', color: 'var(--healthcare-color)' },
    { label: t('totalRegistrations'), value: '458', icon: Users, trend: '+24', color: 'var(--info-color)' },
    { label: t('volunteersActive'), value: '87', icon: HandHeart, trend: '+12', color: 'var(--success-color)' },
    { label: t('livesImpacted'), value: '2.4K', icon: Activity, trend: '+156', color: 'var(--primary-600)' },
  ];

  const quickActions = [
    { label: t('registerForCamp'), icon: Calendar, path: '/healthcare/volunteer/apply', color: 'var(--healthcare-color)' },
    { label: t('bloodDonation'), icon: Droplet, path: '/healthcare/blood-donation', color: 'var(--error-color)' },
    { label: t('findDoctors'), icon: Stethoscope, path: '/healthcare/doctors', color: 'var(--info-color)' },
    { label: t('vaccination'), icon: Syringe, path: '/healthcare/vaccination', color: 'var(--success-color)' },
  ];

  const upcomingCamps = [
    { id: 1, title: 'General Health Checkup Camp', location: 'Community Hall, Sector 15', date: '2026-02-10', time: '9:00 AM - 4:00 PM', registrations: 45, maxCapacity: 100, type: 'checkup', organizer: 'City Hospital' },
    { id: 2, title: 'Eye Care Camp', location: 'Municipal School Ground', date: '2026-02-15', time: '10:00 AM - 3:00 PM', registrations: 32, maxCapacity: 50, type: 'eye', organizer: 'Vision Care NGO' },
    { id: 3, title: 'Blood Donation Drive', location: 'City Hospital', date: '2026-02-18', time: '8:00 AM - 6:00 PM', registrations: 78, maxCapacity: 150, type: 'blood', organizer: 'Red Cross Society' },
    { id: 4, title: 'Dental Checkup Camp', location: 'Town Hall, Main Road', date: '2026-02-22', time: '10:00 AM - 5:00 PM', registrations: 28, maxCapacity: 80, type: 'dental', organizer: 'Smile Dental Clinic' },
  ];

  const recentActivity = [
    { id: 1, type: 'registration', message: 'You registered for General Health Checkup Camp', time: '2 hours ago', icon: CheckCircle, color: 'var(--success-color)' },
    { id: 2, type: 'reminder', message: 'Blood Donation Drive is in 3 days', time: '5 hours ago', icon: Bell, color: 'var(--warning-color)' },
    { id: 3, type: 'update', message: 'New Eye Care Camp announced in your area', time: '1 day ago', icon: Eye, color: 'var(--info-color)' },
    { id: 4, type: 'volunteer', message: 'Your volunteer application was approved!', time: '2 days ago', icon: Star, color: 'var(--healthcare-color)' },
  ];

  const notifications = [
    { id: 1, title: 'Camp Registration Open', message: 'Register now for the upcoming free health checkup', urgent: true },
    { id: 2, title: 'Volunteer Orientation', message: 'Attend the orientation session on Feb 8th', urgent: false },
    { id: 3, title: 'Blood Shortage Alert', message: 'O- blood type urgently needed', urgent: true },
  ];

  const campTypeIcons = {
    checkup: Stethoscope,
    eye: Eye,
    blood: Droplet,
    dental: Heart,
  };

  return (
    <div className="healthcare-dashboard">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('healthcareDashboard')}</h1>
          <p className="page-description">
            {isInstitution ? t('healthcareDescInst') : t('healthcareDescCiv')}
          </p>
        </div>
        {isInstitution ? (
          <Link to="/healthcare/camps/new" className="btn btn-primary">
            <Plus size={18} /> {t('createCamp')}
          </Link>
        ) : (
          <div className="header-actions">
            <Link to="/healthcare/my-applications" className="btn btn-outline">
              <FileText size={18} /> {t('myApplications')}
            </Link>
            <Link to="/healthcare/volunteer/apply" className="btn btn-primary">
              <HandHeart size={18} /> {t('volunteer')}
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
                <div className="stat-value">
                  {stat.value}
                  {stat.trend && <span className="stat-trend positive">{stat.trend}</span>}
                </div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions - Only for civilians */}
      {!isInstitution && (
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
        {/* Main Content - Camps */}
        <div className="main-content">
          <div className="dashboard-section">
            <div className="section-header">
              <h2>{t('upcomingMedicalCamps')}</h2>
              <Link to="/healthcare/camps" className="section-link">{t('viewAll')} <ChevronRight size={16} /></Link>
            </div>
            <div className="camps-list">
              {upcomingCamps.map(camp => {
                const TypeIcon = campTypeIcons[camp.type] || Heart;
                const percentFull = (camp.registrations / camp.maxCapacity) * 100;
                return (
                  <Link key={camp.id} to={`/healthcare/camps/${camp.id}`} className="camp-card-horizontal">
                    <div className="camp-icon-wrapper" style={{ background: 'var(--healthcare-color)15' }}>
                      <TypeIcon size={24} style={{ color: 'var(--healthcare-color)' }} />
                    </div>
                    <div className="camp-info">
                      <div className="camp-header-row">
                        <h3 className="camp-title">{camp.title}</h3>
                        <span className={`camp-status ${percentFull > 80 ? 'filling' : 'open'}`}>
                          {percentFull > 80 ? t('fillingFast') : t('open')}
                        </span>
                      </div>
                      <p className="camp-organizer">by {camp.organizer}</p>
                      <div className="camp-meta">
                        <span><MapPin size={14} /> {camp.location}</span>
                        <span><Calendar size={14} /> {new Date(camp.date).toLocaleDateString()}</span>
                        <span><Clock size={14} /> {camp.time}</span>
                      </div>
                      <div className="camp-progress">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${percentFull}%` }} />
                        </div>
                        <span className="progress-text">{camp.registrations}/{camp.maxCapacity} {t('members')}</span>
                      </div>
                    </div>
                    <button className="register-btn">{t('register')}</button>
                  </Link>
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
              <h3><Bell size={18} /> {t('notifications')}</h3>
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

          {/* Recent Activity */}
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

          {/* Health Tips */}
          <div className="dashboard-card tips-card">
            <div className="card-header">
              <h3><TrendingUp size={18} /> Health Tip</h3>
            </div>
            <div className="tip-content">
              <p>💧 <strong>Stay Hydrated!</strong></p>
              <p>Drink at least 8 glasses of water daily. Proper hydration improves energy, brain function, and overall health.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HealthcareDashboard;
