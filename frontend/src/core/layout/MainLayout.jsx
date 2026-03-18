import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { usePreferences } from '../preferences/PreferencesContext';
import {
  Menu, X, Bell, LogOut, User, Home, Heart, Building2, GraduationCap, Users,
  MessageCircle, Settings, ChevronDown, Plus, HandHeart, FileText, Calendar, MapPin, Briefcase, Search,
  Sun, Moon
} from 'lucide-react';
import './Layout.css';

const domainConfig = {
  civilian: {
    label: 'Civilian',
    icon: Users,
    color: 'var(--civilian-color)',
    routes: [
      { path: '/dashboard', label: 'Overview', icon: Home },
      { path: '/profile', label: 'My Account', icon: User },
    ]
  },
  healthcare: {
    label: 'Healthcare',
    icon: Heart,
    color: 'var(--healthcare-color)',
    routes: (isInstitution) => [
      { path: '/healthcare', label: 'Dashboard', icon: Home },
      ...(isInstitution 
        ? [{ path: '/healthcare/camps/new', label: 'Create Camp', icon: Plus }]
        : [
            { path: '/healthcare/volunteer/apply', label: 'Volunteer', icon: HandHeart },
            { path: '/healthcare/my-applications', label: 'My Applications', icon: FileText }
          ]
      ),
      { path: '/healthcare/camps', label: 'All Camps', icon: Calendar },
      { path: '/profile', label: 'My Account', icon: User },
    ]
  },
  municipal: {
    label: 'Municipal',
    icon: Building2,
    color: 'var(--municipal-color)',
    routes: (isInstitution) => [
      { path: '/municipal', label: 'Dashboard', icon: Home },
      ...(isInstitution 
        ? [{ path: '/municipal/issues/assigned', label: 'Assigned Issues', icon: FileText }]
        : [
            { path: '/municipal/issues/new', label: 'Report Issue', icon: Plus },
            { path: '/municipal/my-issues', label: 'My Reports', icon: FileText }
          ]
      ),
      { path: '/municipal/issues', label: 'Issues Map', icon: MapPin },
      { path: '/profile', label: 'My Account', icon: User },
    ]
  },
  education: {
    label: 'Education',
    icon: GraduationCap,
    color: 'var(--education-color)',
    routes: (isInstitution) => [
      { path: '/education', label: 'Dashboard', icon: Home },
      ...(isInstitution 
        ? [{ path: '/education/jobs/new', label: 'Post Opportunity', icon: Plus }]
        : [
            { path: '/education/jobs/apply', label: 'Apply for Jobs', icon: Briefcase },
            { path: '/education/my-applications', label: 'My Applications', icon: GraduationCap }
          ]
      ),
      { path: '/education/jobs', label: 'All Postings', icon: Search },
      { path: '/profile', label: 'My Account', icon: User },
    ]
  }
};

export function MainLayout({ children }) {
  const { user, logout } = useAuth();
  const { t, theme, toggleTheme } = usePreferences();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Determine current domain from URL path
  const getActiveDomain = () => {
    const path = location.pathname;
    if (path.startsWith('/healthcare')) return 'healthcare';
    if (path.startsWith('/municipal')) return 'municipal';
    if (path.startsWith('/education')) return 'education';
    return 'civilian';
  };

  const activeDomain = getActiveDomain();
  const isInstitution = user?.role && !['civilian', 'citizen'].includes(user.role);
  const config = domainConfig[activeDomain] || domainConfig.civilian;
  const DomainIcon = config.icon;

  const routes = typeof config.routes === 'function' ? config.routes(isInstitution) : config.routes;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="layout">
      {/* Mobile Header */}
      <header className="layout-header">
        <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <Link to="/dashboard" className="logo">
          <span className="logo-icon">🏛️</span>
          <span className="logo-text">Civic Link</span>
        </Link>

        <div className="header-actions">
          <button className="icon-btn">
            <Bell size={20} />
            <span className="notification-badge">3</span>
          </button>

          <div className="user-menu-wrapper">
            <button 
              className="user-menu-trigger"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <div className="user-avatar">
                {user?.profile_picture ? (
                  <img src={user.profile_picture} alt="Avatar" className="avatar-img" />
                ) : (
                  user?.full_name?.charAt(0) || 'U'
                )}
              </div>
              <ChevronDown size={16} />
            </button>

            {userMenuOpen && (
              <div className="user-menu">
                <div className="user-menu-header">
                  <p className="user-name">{user?.full_name}</p>
                  <p className="user-email">{user?.email}</p>
                  <span className="user-role badge">{user?.role}</span>
                </div>
                <div className="user-menu-items">
                  <Link to="/profile" className="user-menu-item" onClick={() => setUserMenuOpen(false)}>
                    <User size={16} /> {t('profile')}
                  </Link>
                  <Link to="/settings" className="user-menu-item" onClick={() => setUserMenuOpen(false)}>
                    <Settings size={16} /> {t('settings')}
                  </Link>
                  <button className="user-menu-item logout" onClick={handleLogout}>
                    <LogOut size={16} /> {t('logout')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/dashboard" className="logo">
            <span className="logo-icon">🏛️</span>
            <span className="logo-text">Civic Link</span>
          </Link>
        </div>

        <div className="sidebar-domain" style={{ borderColor: config.color }}>
          <DomainIcon size={20} style={{ color: config.color }} />
          <span>{t(activeDomain)}</span>
        </div>

        <nav className="sidebar-nav">
          {routes.map(route => {
            const RouteIcon = route.icon;
            return (
              <Link
                key={route.path}
                to={route.path}
                className={`nav-link ${isActive(route.path) ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <RouteIcon size={20} />
                <span>{t(route.label.toLowerCase().replace(/ /g, ''))}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-section">
          <h4 className="section-title">{t('communication')}</h4>
          <Link
            to={activeDomain === 'civilian' ? '/community' : `/${activeDomain}/community`}
            className={`nav-link ${location.pathname.endsWith('/community') || location.pathname.startsWith('/chat') ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <MessageCircle size={20} />
            <span>{t('communityHub')}</span>
          </Link>
        </div>

        {/* Domain Switcher - Only for civilians */}
        {(user?.role === 'civilian' || user?.role === 'citizen') && (
          <div className="sidebar-section">
            <h4 className="section-title">{t('switchDomain')}</h4>
            <div className="domain-switcher">
              {Object.entries(domainConfig).map(([key, cfg]) => {
                const Icon = cfg.icon;
                return (
                  <Link
                    key={key}
                    to={key === 'civilian' ? '/dashboard' : `/${key}`}
                    className={`domain-link ${activeDomain === key ? 'active' : ''}`}
                    style={{ '--domain-color': cfg.color }}
                    title={cfg.label}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon size={16} />
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Logout Section */}
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar-sm">
              {user?.profile_picture ? (
                <img src={user.profile_picture} alt="Avatar" className="avatar-img" />
              ) : (
                user?.full_name?.charAt(0) || 'U'
              )}
            </div>
            <div className="user-details">
              <span className="user-name-sm">{user?.full_name}</span>
              <span className="user-role-sm">{user?.role?.replace('_', ' ')}</span>
            </div>
            <button 
              className="theme-toggle-sidebar" 
              onClick={toggleTheme}
              title={theme === 'dark' ? t('lightMode') : t('darkMode')}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <main className="layout-main">
        {children}
      </main>
    </div>
  );
}

export default MainLayout;
