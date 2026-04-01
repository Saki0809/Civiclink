import { useState, useEffect } from 'react';
import { useAuth } from '../../core/auth/AuthContext';
import { usePreferences } from '../../core/preferences/PreferencesContext';
import { supabase } from '../../core/api/supabaseClient';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, Plus, MapPin, Calendar, Briefcase, Users, Clock, 
  Search, FileText, Bell, Activity, ChevronRight, BookOpen, 
  Award, Newspaper, Library, Info, Eye, CheckCircle, Lightbulb, X
} from 'lucide-react';
import './Education.css';

export function EducationDashboard() {
  const { user } = useAuth();
  const { t } = usePreferences();
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const isInstitution = ['school_admin', 'college_admin', 'institution_admin'].includes(user?.role);

  const [stats, setStats] = useState([
    { label: t('activePostings'), value: '28', icon: Briefcase, trend: '4 new', color: 'var(--education-color)' },
    { label: t('totalApplications'), value: '5', icon: Users, trend: '+1 recently', color: 'var(--info-color)' },
    { label: t('positionsFilled'), value: '12', icon: GraduationCap, trend: '', color: 'var(--success-color)' },
    { label: t('coursesOpen'), value: '45', icon: BookOpen, trend: '8 new courses', color: 'var(--primary-600)' },
  ]);

  const [recentActivity, setRecentActivity] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    async function fetchEducationData() {
      if (!user) return;
      
      try {
        // 1. Fetch real application count for the user
        const { count: appCount } = await supabase
          .from('job_applications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // 2. Fetch global job posting count (placeholder logic)
        // await supabase.from('job_postings'); 

        // 3. Fetch recent applications to generate activity feed
        const { data: apps, error: fetchErr } = await supabase
          .from('job_applications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);

        if (!fetchErr && apps) {
          const activities = apps.map(app => ({
            id: app.id,
            message: `Applied for "${app.job_title}" at ${app.institution_name}`,
            time: new Date(app.created_at).toLocaleDateString(),
            icon: CheckCircle,
            color: 'var(--success-color)'
          }));
          setRecentActivity(activities);
        }

        setStats([
          { label: t('activePostings'), value: '28', icon: Briefcase, trend: '4 new', color: 'var(--education-color)' },
          { label: t('totalApplications'), value: ((appCount || 0) + 5).toString(), icon: Users, trend: '+1 recently', color: 'var(--info-color)' },
          { label: t('positionsFilled'), value: '12', icon: GraduationCap, trend: '', color: 'var(--success-color)' },
          { label: t('coursesOpen'), value: '45', icon: BookOpen, trend: '8 new', color: 'var(--primary-600)' },
        ]);

      } catch (err) {
        console.error('Error fetching education data:', err);
      }
    }

    fetchEducationData();
  }, [user, t]);

  const quickActions = [
    { label: t('searchJobs'), icon: Search, path: '/education/jobs', color: 'var(--education-color)' },
    { label: t('resumeBuilder'), icon: FileText, path: '/education/resume', color: 'var(--info-color)' },
    { label: t('onlineCourses'), icon: Library, path: '/education/courses', color: 'var(--success-color)' },
    { label: t('scholarships'), icon: Award, path: '/education/scholarships', color: 'var(--warning-color)' },
  ];

  const recentJobs = [
    { id: '449e7578-831e-450f-a496-51d02f3a6336', title: 'Software Developer Intern', institution: 'Tech Academy', type: 'internship', location: 'Remote', deadline: '2026-04-20', applications: 24, salary: '₹15,000 - ₹20,000/month', description: 'Looking for enthusiastic interns to join our development team. You will work on real projects and learn from experienced developers.', requirements: ['Currently pursuing B.Tech/MCA', 'Knowledge of JavaScript/Python', 'Good communication skills'] },
    { id: '8294a02d-9473-4560-b6f1-88981f33f673', title: 'Mathematics Teacher', institution: 'City Public School', type: 'full_time', location: 'Sector 15', deadline: '2026-04-25', applications: 18, salary: '₹35,000 - ₹45,000/month', description: 'Experienced mathematics teacher needed for classes 9-12. Must have excellent teaching skills and patience.', requirements: ['B.Ed/M.Ed in Mathematics', '3+ years teaching experience', 'Board exam experience preferred'] },
    { id: '6e21019d-7db0-4c17-9c98-13b7e71f92e8', title: 'Research Assistant', institution: 'National University', type: 'part_time', location: 'City Center', deadline: '2026-05-01', applications: 45, salary: '₹18,000 - ₹25,000/month', description: 'Assist professors in ongoing research projects. Data collection, analysis, and report preparation.', requirements: ['Masters degree in relevant field', 'Strong analytical skills', 'Research methodology knowledge'] },
    { id: 'b83d1c4a-6d63-41c1-9d21-f3b1458e0a1b', title: 'Merit Scholarship 2026', institution: 'Education Foundation', type: 'scholarship', location: 'Online', deadline: '2026-05-15', applications: 120, salary: '₹2000 Grant', description: 'Merit-based scholarship for outstanding students from economically weaker sections.', requirements: ['Minimum 85% in previous grade', 'Family income less than 5 LPA', 'Resident of City'] },
    { id: 'c123', title: 'Librarian Assistant', institution: 'Town Library', type: 'part_time', location: 'Old Port', deadline: '2026-04-30', applications: 8, salary: '₹12,000/month', description: 'Assist in organizing library books, managing checkouts, and helping visitors.', requirements: ['High School Graduate', 'Passion for books', 'Basic computer skills'] },
    { id: 'd456', title: 'Physics Lab Tech', institution: 'Science College', type: 'full_time', location: 'Industrial Area', deadline: '2026-05-10', applications: 12, salary: '₹28,000 - ₹32,000/month', description: 'Maintain physics lab equipment and assist during practical sessions.', requirements: ['B.Sc in Physics', 'Lab safety certification', 'Available for full-time'] },
  ];

  useEffect(() => {
    if (jobId) {
      const job = recentJobs.find(j => j.id === jobId);
      if (job) setSelectedJob(job);
    } else {
      setSelectedJob(null);
    }
  }, [jobId]);

  const closeModal = () => {
    navigate('/education');
    setSelectedJob(null);
  };

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
                <Link 
                  key={job.id} 
                  to={isInstitution ? `/education/jobs/${job.id}` : "/education/jobs/apply"} 
                  state={{ selectedJobId: job.id }} 
                  className="job-card-horizontal"
                >
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
                    <button className="apply-btn">
                      {isInstitution ? t('viewDetails') : t('applyNow')}
                    </button>
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
      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content education-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              <X size={20} />
            </button>
            <div className="hc-modal-header education">
              <div className="hc-modal-icon" style={{ background: 'var(--education-color)15', color: 'var(--education-color)' }}>
                <Briefcase size={32} />
              </div>
              <h3 className="hc-modal-title">{selectedJob.title}</h3>
              <p className="hc-modal-desc">{selectedJob.institution}</p>
            </div>
            
            <div className="registration-form">
              <div className="registration-field">
                <label>Description</label>
                <p style={{ color: 'var(--text-600)', lineHeight: '1.6' }}>{selectedJob.description}</p>
              </div>
              <div className="registration-field">
                <label>Requirements</label>
                <ul style={{ listStyle: 'disc', paddingLeft: '1.2rem', color: 'var(--text-600)', marginTop: '0.5rem' }}>
                  {selectedJob.requirements.map((req, i) => <li key={i}>{req}</li>)}
                </ul>
              </div>
              <div className="registration-field">
                <label>Salary & Benefits</label>
                <p style={{ fontWeight: '600', color: 'var(--education-color)', fontSize: '1.1rem' }}>{selectedJob.salary}</p>
              </div>

              <div className="registration-actions" style={{ marginTop: '2rem' }}>
                <button className="registration-btn-cancel" onClick={closeModal}>
                  Close
                </button>
                {isInstitution ? (
                  <button className="registration-btn-confirm education" onClick={() => navigate(`/education/jobs/edit/${selectedJob.id}`)}>
                    Manage Posting
                  </button>
                ) : (
                  <button className="registration-btn-confirm education" onClick={() => navigate("/education/jobs/apply", { state: { selectedJobId: selectedJob.id } })}>
                    Apply for Role
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EducationDashboard;
