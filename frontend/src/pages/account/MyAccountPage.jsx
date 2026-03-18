import { useState, useRef } from 'react';
import { useAuth } from '../../core/auth/AuthContext';
import { usePreferences } from '../../core/preferences/PreferencesContext';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, Shield, Camera, Edit3, Save, X,
  Lock, Eye, EyeOff, Bell, Moon, Sun, LogOut, Trash2,
  ChevronRight, CheckCircle, AlertCircle, Key, Globe
} from 'lucide-react';
import './MyAccount.css';

export function MyAccountPage() {
  const { user, logout, updateProfile } = useAuth();
  const { isDark, toggleTheme, language, setLanguage, t } = usePreferences();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.profile_picture || null);

  const [profileData, setProfileData] = useState({
    fullName: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: 'Passionate about building better communities through civic engagement.',
    location: 'Hyderabad, India',
    website: '',
  });

  const [passwordData, setPasswordData] = useState({
    current: '',
    newPass: '',
    confirm: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false, newPass: false, confirm: false,
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    twoFactor: false,
  });

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = () => {
    updateProfile({
      full_name: profileData.fullName,
      phone: profileData.phone,
      bio: profileData.bio,
      location: profileData.location,
      profile_picture: avatarPreview
    });
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setAvatarPreview(base64String);
        // Immediate update for app-wide sync
        updateProfile({
          full_name: profileData.fullName,
          phone: profileData.phone,
          bio: profileData.bio,
          location: profileData.location,
          profile_picture: base64String
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = () => {
    setPasswordError('');
    setPasswordSuccess(false);

    if (!passwordData.current || !passwordData.newPass || !passwordData.confirm) {
      setPasswordError(t('fillAllFields'));
      return;
    }
    if (passwordData.newPass.length < 6) {
      setPasswordError(t('passwordMinLength'));
      return;
    }
    if (passwordData.newPass !== passwordData.confirm) {
      setPasswordError(t('passwordMismatch'));
      return;
    }

    setPasswordSuccess(true);
    setPasswordData({ current: '', newPass: '', confirm: '' });
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const tabs = [
    { id: 'profile', label: t('profile'), icon: User },
    { id: 'security', label: t('security'), icon: Shield },
    { id: 'preferences', label: t('preferences'), icon: Bell },
  ];

  const getInitials = () => {
    if (user?.full_name) {
      return user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return 'U';
  };

  return (
    <div className="ma-page">
      {/* Header */}
      <div className="ma-hero">
        <div className="ma-hero-content">
          <div className="ma-avatar-section">
            <div className="ma-avatar-wrapper" onClick={() => fileInputRef.current?.click()}>
              {avatarPreview ? (
                <img src={avatarPreview} alt="Profile" className="ma-avatar-img" />
              ) : (
                <div className="ma-avatar-placeholder">{getInitials()}</div>
              )}
              <div className="ma-avatar-overlay">
                <Camera size={20} />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
            </div>
            <div className="ma-hero-info">
              <h1>{profileData.fullName || 'User'}</h1>
              <p className="ma-hero-email">{profileData.email}</p>
              <span className="ma-role-badge">
                {user?.role?.replace('_', ' ') || 'Citizen'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="ma-layout">
        {/* Tab Nav */}
        <nav className="ma-tabs">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`ma-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
          <div className="ma-tab-divider" />
          <button className="ma-tab danger" onClick={handleLogout}>
            <LogOut size={18} />
            <span>{t('logout')}</span>
          </button>
        </nav>

        {/* Content */}
        <main className="ma-content">
          {/* ---- PROFILE TAB ---- */}
          {activeTab === 'profile' && (
            <div className="ma-section" key="profile">
              <div className="ma-section-header">
                <div>
                  <h2>{t('personalInfo')}</h2>
                  <p>{t('manageProfile')}</p>
                </div>
                {!editing ? (
                  <button className="ma-edit-btn" onClick={() => setEditing(true)}>
                    <Edit3 size={16} /> {t('editProfile')}
                  </button>
                ) : (
                  <div className="ma-edit-actions">
                    <button className="ma-cancel-btn" onClick={() => setEditing(false)}>
                      <X size={16} /> {t('cancel')}
                    </button>
                    <button className="ma-save-btn" onClick={handleSaveProfile}>
                      <Save size={16} /> {t('saveChanges')}
                    </button>
                  </div>
                )}
              </div>

              {saved && (
                <div className="ma-toast success">
                <CheckCircle size={16} /> {t('profileUpdated')}
                </div>
              )}

              <div className="ma-form-grid">
                <div className="ma-field">
                  <label><User size={14} /> {t('fullName')}</label>
                  {editing ? (
                    <input
                      type="text"
                      value={profileData.fullName}
                      onChange={(e) => handleProfileChange('fullName', e.target.value)}
                    />
                  ) : (
                    <div className="ma-field-value">{profileData.fullName || '—'}</div>
                  )}
                </div>

                <div className="ma-field">
                  <label><Mail size={14} /> {t('email')}</label>
                  {editing ? (
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleProfileChange('email', e.target.value)}
                    />
                  ) : (
                    <div className="ma-field-value">{profileData.email || '—'}</div>
                  )}
                </div>

                <div className="ma-field">
                  <label><Phone size={14} /> {t('phone')}</label>
                  {editing ? (
                    <input
                      type="text"
                      value={profileData.phone}
                      onChange={(e) => handleProfileChange('phone', e.target.value)}
                    />
                  ) : (
                    <div className="ma-field-value">{profileData.phone || '—'}</div>
                  )}
                </div>

                <div className="ma-field">
                  <label><Globe size={14} /> {t('location')}</label>
                  {editing ? (
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={(e) => handleProfileChange('location', e.target.value)}
                    />
                  ) : (
                    <div className="ma-field-value">{profileData.location || '—'}</div>
                  )}
                </div>
              </div>

              <div className="ma-field full">
                <label><Edit3 size={14} /> {t('bio')}</label>
                {editing ? (
                  <textarea
                    rows={3}
                    value={profileData.bio}
                    onChange={(e) => handleProfileChange('bio', e.target.value)}
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <div className="ma-field-value bio">{profileData.bio || '—'}</div>
                )}
              </div>

              {/* Account Info Card */}
              <div className="ma-info-card">
                <h3>{t('accountDetails')}</h3>
                <div className="ma-info-rows">
                  <div className="ma-info-row">
                    <span className="ma-info-label">Account ID</span>
                    <span className="ma-info-value">#{user?.id || '000'}</span>
                  </div>
                  <div className="ma-info-row">
                    <span className="ma-info-label">Role</span>
                    <span className="ma-info-value capitalize">{user?.role?.replace('_', ' ') || 'Citizen'}</span>
                  </div>
                  <div className="ma-info-row">
                    <span className="ma-info-label">Domain</span>
                    <span className="ma-info-value capitalize">{user?.domain || 'Civilian'}</span>
                  </div>
                  <div className="ma-info-row">
                    <span className="ma-info-label">Member Since</span>
                    <span className="ma-info-value">March 2026</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ---- SECURITY TAB ---- */}
          {activeTab === 'security' && (
            <div className="ma-section" key="security">
              <div className="ma-section-header">
                <div>
                  <h2>{t('passwordSecurity')}</h2>
                  <p>{t('keepSafe')}</p>
                </div>
              </div>

              {/* Change Password */}
              <div className="ma-card">
                <h3><Key size={18} /> {t('changePassword')}</h3>

                {passwordError && (
                  <div className="ma-toast error">
                    <AlertCircle size={16} /> {passwordError}
                  </div>
                )}
                {passwordSuccess && (
                  <div className="ma-toast success">
                    <CheckCircle size={16} /> {t('passwordChanged')}
                  </div>
                )}

                <div className="ma-password-fields">
                  {[
                    { key: 'current', label: 'Current Password', placeholder: 'Enter current password' },
                    { key: 'newPass', label: 'New Password', placeholder: 'Enter new password' },
                    { key: 'confirm', label: 'Confirm New Password', placeholder: 'Re-enter new password' },
                  ].map(field => (
                    <div className="ma-pass-field" key={field.key}>
                      <label>{field.label}</label>
                      <div className="ma-pass-input-wrap">
                        <Lock size={16} />
                        <input
                          type={showPasswords[field.key] ? 'text' : 'password'}
                          placeholder={field.placeholder}
                          value={passwordData[field.key]}
                          onChange={(e) => setPasswordData(p => ({ ...p, [field.key]: e.target.value }))}
                        />
                        <button
                          className="ma-pass-toggle"
                          onClick={() => setShowPasswords(p => ({ ...p, [field.key]: !p[field.key] }))}
                          type="button"
                        >
                          {showPasswords[field.key] ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="ma-save-btn" onClick={handlePasswordChange}>
                  <Shield size={16} /> {t('updatePassword')}
                </button>
              </div>

              {/* Two-Factor */}
              <div className="ma-card">
                <div className="ma-toggle-row">
                  <div>
                    <h3><Shield size={18} /> {t('twoFactor')}</h3>
                    <p>{t('twoFactorDesc')}</p>
                  </div>
                  <label className="ma-switch">
                    <input
                      type="checkbox"
                      checked={preferences.twoFactor}
                      onChange={() => setPreferences(p => ({ ...p, twoFactor: !p.twoFactor }))}
                    />
                    <span className="ma-slider" />
                  </label>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="ma-card danger">
                <h3><Trash2 size={18} /> {t('dangerZone')}</h3>
                <p>{t('deleteWarning')}</p>
                <button className="ma-danger-btn">
                  <Trash2 size={16} /> {t('deleteAccount')}
                </button>
              </div>
            </div>
          )}

          {/* ---- PREFERENCES TAB ---- */}
          {activeTab === 'preferences' && (
            <div className="ma-section" key="preferences">
              <div className="ma-section-header">
                <div>
                  <h2>{t('preferences')}</h2>
                  <p>{t('customizeExperience')}</p>
                </div>
              </div>

              <div className="ma-card">
                <div className="ma-toggle-row">
                  <div>
                    <h3>{isDark ? <Sun size={18} /> : <Moon size={18} />} {isDark ? t('lightMode') : t('darkMode')}</h3>
                    <p>{isDark ? t('lightModeDesc') : t('darkModeDesc')}</p>
                  </div>
                  <label className="ma-switch">
                    <input
                      type="checkbox"
                      checked={isDark}
                      onChange={toggleTheme}
                    />
                    <span className="ma-slider" />
                  </label>
                </div>
              </div>

              <div className="ma-card">
                <div className="ma-toggle-row">
                  <div>
                    <h3><Mail size={18} /> {t('emailNotifications')}</h3>
                    <p>{t('emailNotifDesc')}</p>
                  </div>
                  <label className="ma-switch">
                    <input
                      type="checkbox"
                      checked={preferences.emailNotifications}
                      onChange={() => setPreferences(p => ({ ...p, emailNotifications: !p.emailNotifications }))}
                    />
                    <span className="ma-slider" />
                  </label>
                </div>
              </div>

              <div className="ma-card">
                <div className="ma-toggle-row">
                  <div>
                    <h3><Bell size={18} /> {t('pushNotifications')}</h3>
                    <p>{t('pushNotifDesc')}</p>
                  </div>
                  <label className="ma-switch">
                    <input
                      type="checkbox"
                      checked={preferences.pushNotifications}
                      onChange={() => setPreferences(p => ({ ...p, pushNotifications: !p.pushNotifications }))}
                    />
                    <span className="ma-slider" />
                  </label>
                </div>
              </div>

              <div className="ma-card">
                <div className="ma-toggle-row">
                  <div>
                    <h3><Globe size={18} /> {t('language')}</h3>
                    <p>{t('languageDesc')}</p>
                  </div>
                  <select
                    className="ma-select"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Telugu</option>
                    <option>Tamil</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default MyAccountPage;
