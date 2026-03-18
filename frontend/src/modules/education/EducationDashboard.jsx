import { useAuth } from '../../core/auth/AuthContext';
import { usePreferences } from '../../core/preferences/PreferencesContext';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, Plus, MapPin, Calendar, Briefcase, Users, Clock, 
  Search, FileText, Bell, Activity, ChevronRight, BookOpen, 
  Award, Newspaper, Library, Info, Eye, CheckCircle, Lightbulb
} from 'lucide-react';
import './Education.css';

export function EducationDashboard() {
  const { user } = useAuth();
  const { t } = usePreferences();
  const isInstitution = ['school_admin', 'college_admin', 'institution_admin'].includes(user?.role);

  const stats = [
    { label: t('activePostings'), value: '28', icon: Briefcase, trend: '+5', color: 'var(--education-color)' },
    { label: t('totalApplications'), value: '156', icon: Users, trend: '+18', color: 'var(--info-color)' },
    { label: t('positionsFilled'), value: '12', icon: GraduationCap, trend: '+3', color: 'var(--success-color)' },
    { label: t('coursesOpen'), value: '45', icon: BookOpen, trend: '+8', color: 'var(--primary-600)' },
  ];

  const quickActions = [
    { label: t('searchJobs'), icon: Search, path: '/education/jobs', color: 'var(--education-color)' },
    { label: t('resumeBuilder'), icon: FileText, path: '/education/resume', color: 'var(--info-color)' },
    { label: t('onlineCourses'), icon: Library, path: '/education/courses', color: 'var(--success-color)' },
    { label: t('scholarships'), icon: Award, path: '/education/scholarships', color: 'var(--warning-color)' },
  ];

  const recentJobs = [
    { id: 1, title: 'Software Developer Intern', institution: 'Tech Academy', type: 'internship', location: 'Remote', deadline: '2026-02-20', applications: 24, salary: '$500 - $800/mo' },
    { id: 2, title: 'Mathematics Teacher', institution: 'City Public School', type: 'full_time', location: 'Sector 15', deadline: '2026-02-25', applications: 18, salary: 'Competitive' },
    { id: 3, title: 'Research Assistant', institution: 'National University', type: 'part_time', location: 'Campus', deadline: '2026-03-01', applications: 45, salary: '$20/hr' },
    { id: 4, title: 'Merit Scholarship 2026', institution: 'Education Foundation', type: 'scholarship', location: 'Online', deadline: '2026-03-15', applications: 120, salary: '$2000 Grant' },
  ];

  const recentActivity = [
    { id: 1, message: 'Your application for "Tech Academy" was viewed', time: '2 hours ago', icon: Eye, color: 'var(--info-color)' },
    { id: 2, message: 'New scholarship matching your profile found', time: '5 hours ago', icon: Award, color: 'var(--warning-color)' },
    { id: 3, message: 'Upcoming Webinar: Career in AI - Register now', time: '1 day ago', icon: Calendar, color: 'var(--education-color)' },
    { id: 4, message: 'Assessment result for "Basic JS" is out', time: '2 days ago', icon: CheckCircle, color: 'var(--success-color)' },
  ];

  const notifications = [
    { id: 1, title: 'Application Deadline', message: 'Math Teacher position expires in 2 days', urgent: true },
    { id: 2, title: 'Interview Scheduled', message: 'Technical round for intern post on Feb 10th', urgent: true },
    { id: 3, title: 'New Course Added', message: 'Advanced Data Science is now live', urgent: false },
  ];

  const typeConfig = {
    full_time: { label: 'Full Time', color: 'var(--success-color)' },
    part_time: { label: 'Part Time', color: 'var(--info-color)' },
    internship: { label: 'Internship', color: 'var(--education-color)' },
    scholarship: { label: 'Scholarship', color: 'var(--warning-color)' },
  };

  return (
    <div className="education-dashboard">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('educationDashboard')}</h1>
          <p className="page-description">
            {isInstitution ? t('educationDescInst') : t('educationDescCiv')}
          </p>
        </div>
        {isInstitution ? (
          <div className="header-actions">
            <Link to="/education/jobs/new" className="btn btn-primary">
              <Plus size={18} /> {t('postOpportunity')}
            </Link>
          </div>
        ) : (
          <div className="header-actions">
            <Link to="/education/my-applications" className="btn btn-outline">
              <FileText size={18} /> {t('myApplications')}
            </Link>
            <Link to="/education/profile" className="btn btn-primary">
              <GraduationCap size={18} /> {t('profile')}
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

      {/* Quick Actions */}
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
        {/* Main Content */}
        <div className="main-content">
          <div className="dashboard-section">
            <div className="section-header">
              <h2>{isInstitution ? t('yourPostings') : t('featuredOpportunities')}</h2>
              <Link to="/education/jobs" className="section-link">{t('viewAll')} <ChevronRight size={16} /></Link>
            </div>
            <div className="opportunities-list">
              {recentJobs.map(job => (
                <Link key={job.id} to={`/education/jobs/${job.id}`} className="job-card-horizontal">
                  <div className="job-icon-wrapper" style={{ background: 'var(--education-color)15' }}>
                    <Briefcase size={24} style={{ color: 'var(--education-color)' }} />
                  </div>
                  <div className="job-info">
                    <div className="job-header-row">
                      <h3 className="job-title">{job.title}</h3>
                      <span 
                        className="status-badge"
                        style={{ background: `${typeConfig[job.type].color}15`, color: typeConfig[job.type].color }}
                      >
                        {typeConfig[job.type].label}
                      </span>
                    </div>
                    <p className="job-institution">{job.institution}</p>
                    <div className="job-meta">
                      <span className="meta-item"><MapPin size={12} /> {job.location}</span>
                      <span className="meta-item"><Users size={12} /> {job.applications} Applied</span>
                      <span className="meta-item"><Clock size={12} /> Ends: {new Date(job.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="job-salary">
                    <span>{job.salary}</span>
                    <button className="apply-btn">{t('applyNow')}</button>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="sidebar-content">
          {/* Notifications */}
          <div className="dashboard-card notifications-card">
            <div className="card-header">
              <h3><Bell size={18} /> Updates</h3>
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
              <h3><Activity size={18} /> Recent Activity</h3>
            </div>
            <div className="activity-list">
              {recentActivity.map(activity => {
                const Icon = activity.icon || Activity;
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

          {/* Education Tip */}
          <div className="dashboard-card tips-card education">
            <div className="card-header">
              <h3><Lightbulb size={18} /> Career Tip</h3>
            </div>
            <div className="tip-content">
              <p>🎓 <strong>Continuous Learning</strong></p>
              <p>The job market evolves rapidly. Dedicate 30 minutes a day to learn a new skill or keep up with industry trends to stay competitive.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EducationDashboard;
