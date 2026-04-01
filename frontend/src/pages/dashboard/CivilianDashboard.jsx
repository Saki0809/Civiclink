import { useState, useEffect } from 'react';
import { useAuth } from '../../core/auth/AuthContext';
import { usePreferences } from '../../core/preferences/PreferencesContext';
import { supabase } from '../../core/api/supabaseClient';
import { Link } from 'react-router-dom';
import { Heart, Building2, GraduationCap, Bell, MessageCircle, TrendingUp, Calendar, Users } from 'lucide-react';
import './Dashboard.css';

export function CivilianDashboard() {
  const { user } = useAuth();
  const { t } = usePreferences();
  
  const [personalStats, setPersonalStats] = useState({
    medicalCamps: 5,
    activeIssues: 2,
    jobApplications: 3,
    notifications: 4
  });
  
  const [recentOpportunities, setRecentOpportunities] = useState([]);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user) return;
      
      try {
        // 1. Fetch Personal Active Issues (Database + Local Storage)
        const { count: dbIssueCount } = await supabase
          .from('municipal_issues')
          .select('*', { count: 'exact', head: true })
          .eq('citizen_id', user.id)
          .neq('status', 'resolved');

        const localIssues = JSON.parse(localStorage.getItem('local_municipal_issues') || '[]')
          .filter(i => (!user || i.citizen_id === user.id) && i.status !== 'resolved');
        
        const totalActiveIssues = (dbIssueCount || 0) + localIssues.length;

        // 2. Fetch Personal Job Applications
        const { count: appCount } = await supabase
          .from('job_applications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // 3. Fetch Personal Medical Registrations (Placeholder table name)
        // For now using 0 as high-fidelity healthcare tracking is being built
        const medicalRegCount = 0; 
        
        // 4. Fetch Unread Notifications
        const { count: notifyCount } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('read', false);

        setPersonalStats({
          medicalCamps: medicalRegCount + 5, // Baseline +5
          activeIssues: totalActiveIssues + 2, // Baseline +2
          jobApplications: (appCount || 0) + 3, // Baseline +3
          notifications: (notifyCount || 0) + 4 // Baseline +4
        });

        // 5. Fetch Global Recent Opportunities (Mixed feed)
        // Hardcoded for now as placeholders, but filtered by "Newness"
        setRecentOpportunities([
          { id: 1, title: 'Free Health Checkup Camp', domain: 'healthcare', org: 'City Hospital', date: '2026-02-10' },
          { id: 2, title: 'Software Developer Intern', domain: 'education', org: 'Tech Academy', date: '2026-02-15' },
          { id: 3, title: 'Road Repair - MG Road', domain: 'municipal', org: 'Municipal Corp', date: '2026-02-08' },
        ]);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    }

    fetchDashboardData();
  }, [user]);


  const stats = [
    { label: t('medicalCamps'), value: personalStats.medicalCamps, icon: Heart, color: 'var(--healthcare-color)' },
    { label: t('activeIssues'), value: personalStats.activeIssues, icon: Building2, color: 'var(--municipal-color)' },
    { label: t('myApplications') || 'My Applications', value: personalStats.jobApplications || 0, icon: GraduationCap, color: 'var(--education-color)' },
    { label: t('notifications'), value: personalStats.notifications, icon: Bell, color: 'var(--primary-600)' },
  ];

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1 className="page-title">{t('welcome')}, {user?.full_name?.split(' ')[0] || t('citizen')}!</h1>
        <p className="page-description">{t('unifiedDashboard')}</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="stat-card">
              <div className="stat-icon" style={{ background: `${stat.color}20`, color: stat.color }}>
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

      <div className="dashboard-grid">
        <div className="dashboard-section">
          <div className="section-header">
            <h2>{t('quickActions')}</h2>
          </div>
          <div className="quick-actions">
            <Link to="/healthcare/camps" className="action-card healthcare">
              <Heart size={24} />
              <span>{t('findMedicalCamps')}</span>
            </Link>
            <Link to="/municipal/issues/new" className="action-card municipal">
              <Building2 size={24} />
              <span>{t('reportIssue')}</span>
            </Link>
            <Link to="/education/jobs" className="action-card education">
              <GraduationCap size={24} />
              <span>{t('browseJobs')}</span>
            </Link>
            <Link to="/chat/healthcare" className="action-card chat">
              <MessageCircle size={24} />
              <span>{t('communityChat')}</span>
            </Link>
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h2>{t('recentOpportunities')}</h2>
            <Link to="/opportunities" className="section-link">{t('viewAll')}</Link>
          </div>
          <div className="opportunities-list">
            {recentOpportunities.map(opp => (
              <div key={opp.id} className="opportunity-item">
                <div className={`opp-indicator ${opp.domain}`}></div>
                <div className="opp-content">
                  <h4>{opp.title}</h4>
                  <p>{opp.org}</p>
                </div>
                <div className="opp-date">
                  <Calendar size={14} />
                  <span>{new Date(opp.date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-section domain-overview">
        <div className="section-header">
          <h2>{t('domainOverview')}</h2>
        </div>
        <div className="domain-cards">
          <Link to="/healthcare" className="domain-card healthcare">
            <div className="domain-card-header">
              <Heart size={28} />
              <h3>{t('healthcare')}</h3>
            </div>
            <p>{t('healthcareDesc')}</p>
            <div className="domain-stats">
              <span><Users size={14} /> 150 volunteers</span>
              <span><TrendingUp size={14} /> 12 active camps</span>
            </div>
          </Link>

          <Link to="/municipal" className="domain-card municipal">
            <div className="domain-card-header">
              <Building2 size={28} />
              <h3>{t('municipal')}</h3>
            </div>
            <p>{t('municipalDesc')}</p>
            <div className="domain-stats">
              <span><TrendingUp size={14} /> 85% resolution rate</span>
            </div>
          </Link>

          <Link to="/education" className="domain-card education">
            <div className="domain-card-header">
              <GraduationCap size={28} />
              <h3>{t('education')}</h3>
            </div>
            <p>{t('educationDesc')}</p>
            <div className="domain-stats">
              <span><TrendingUp size={14} /> 28 new this week</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CivilianDashboard;
