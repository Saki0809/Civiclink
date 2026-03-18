import { useState, useRef, useCallback } from 'react';
import html2pdf from 'html2pdf.js';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../core/auth/AuthContext';
import {
  FileText, ChevronLeft, Download, Eye, Plus,
  Trash2, Briefcase, GraduationCap, Award,
  User, Mail, Phone, MapPin, Globe, Linkedin,
  Star, CheckCircle, Edit3, X, Save, Sparkles,
  Code, Palette, Zap, Target, Heart
} from 'lucide-react';
import '../DomainDashboard.css';
import './Education.css';

export function ResumeBuilderPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('personal');
  const [showPreview, setShowPreview] = useState(false);
  const [exporting, setExporting] = useState(false);
  const previewRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: user?.full_name || 'John Doe',
    email: user?.email || 'john.doe@example.com',
    phone: user?.phone || '+91 98765 43210',
    location: 'Hyderabad, India',
    linkedin: 'linkedin.com/in/johndoe',
    portfolio: 'johndoe.dev',
    title: 'Full Stack Developer',
    summary: 'Proactive and detail-oriented developer with experience in modern web technologies. Passionate about building scalable applications and contributing to open-source communities.',
  });

  const [experience, setExperience] = useState([
    { id: 1, title: 'Frontend Developer Intern', org: 'TechCorp Solutions', period: 'Jun 2025 - Present', description: 'Built responsive UIs with React and TypeScript. Improved page load times by 40%.', current: true },
    { id: 2, title: 'Community Volunteer', org: 'CivicLink Foundation', period: 'Jan 2024 - May 2025', description: 'Led digital literacy workshops for underserved communities. Organized health camps for 500+ residents.', current: false },
  ]);

  const [education, setEducation] = useState([
    { id: 1, degree: 'B.Tech in Computer Science', school: 'Indian Institute of Technology', period: '2022 - 2026', grade: 'CGPA: 8.9/10' },
  ]);

  const [skills, setSkills] = useState([
    { name: 'React', level: 90 }, { name: 'JavaScript', level: 85 },
    { name: 'TypeScript', level: 75 }, { name: 'Node.js', level: 70 },
    { name: 'Python', level: 65 }, { name: 'CSS/Tailwind', level: 80 },
  ]);

  const [newSkill, setNewSkill] = useState('');

  const [certifications] = useState([
    { id: 1, name: 'AWS Cloud Practitioner', issuer: 'Amazon Web Services', date: '2025' },
    { id: 2, name: 'React Developer Certificate', issuer: 'Meta', date: '2024' },
  ]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.find(s => s.name.toLowerCase() === newSkill.toLowerCase())) {
      setSkills(prev => [...prev, { name: newSkill.trim(), level: 50 }]);
      setNewSkill('');
    }
  };

  const removeSkill = (name) => {
    setSkills(prev => prev.filter(s => s.name !== name));
  };

  const removeExperience = (id) => {
    setExperience(prev => prev.filter(e => e.id !== id));
  };

  const removeEducation = (id) => {
    setEducation(prev => prev.filter(e => e.id !== id));
  };

  const completionScore = (() => {
    let score = 0;
    if (formData.fullName) score += 10;
    if (formData.email) score += 10;
    if (formData.phone) score += 10;
    if (formData.summary) score += 15;
    if (formData.title) score += 10;
    if (experience.length > 0) score += 15;
    if (education.length > 0) score += 15;
    if (skills.length >= 3) score += 10;
    if (formData.linkedin) score += 5;
    return Math.min(score, 100);
  })();

  const handleExportPDF = useCallback(async () => {
    setExporting(true);
    // Switch to preview mode so the resume renders
    const wasPreview = showPreview;
    if (!wasPreview) setShowPreview(true);

    // Wait for React to render the preview
    await new Promise(r => setTimeout(r, 300));

    const element = previewRef.current;
    if (!element) {
      setExporting(false);
      return;
    }

    const opt = {
      margin: 0.4,
      filename: `${formData.fullName.replace(/\s+/g, '_')}_Resume.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setExporting(false);
      if (!wasPreview) setShowPreview(false);
    }
  }, [showPreview, formData.fullName]);

  const sections = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Code },
    { id: 'certifications', label: 'Certificates', icon: Award },
  ];

  return (
    <div className="rb-page">
      {/* Header */}
      <header className="rb-header">
        <div className="rb-header-left">
          <button className="rb-back" onClick={() => navigate('/education')}>
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1>Resume Builder</h1>
            <p>Craft your professional story</p>
          </div>
        </div>
        <div className="rb-header-actions">
          <button className="rb-btn outline" onClick={() => setShowPreview(!showPreview)}>
            <Eye size={16} /> {showPreview ? 'Edit' : 'Preview'}
          </button>
          <button className="rb-btn primary" onClick={handleExportPDF} disabled={exporting}>
            <Download size={16} /> {exporting ? 'Generating...' : 'Export PDF'}
          </button>
        </div>
      </header>

      <div className="rb-layout">
        {/* Section Nav */}
        <nav className="rb-nav">
          {sections.map(sec => {
            const Icon = sec.icon;
            return (
              <button
                key={sec.id}
                className={`rb-nav-item ${activeSection === sec.id ? 'active' : ''}`}
                onClick={() => { setActiveSection(sec.id); setShowPreview(false); }}
              >
                <Icon size={18} />
                <span>{sec.label}</span>
              </button>
            );
          })}

          {/* Score Card */}
          <div className="rb-score-card">
            <div className="score-ring-container">
              <svg viewBox="0 0 80 80" className="score-ring">
                <circle cx="40" cy="40" r="34" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                <circle
                  cx="40" cy="40" r="34" fill="none"
                  stroke={completionScore >= 80 ? '#22c55e' : completionScore >= 50 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={`${(completionScore / 100) * 213.6} 213.6`}
                  transform="rotate(-90 40 40)"
                />
              </svg>
              <span className="score-value">{completionScore}%</span>
            </div>
            <span className="score-label">Profile Strength</span>
          </div>
        </nav>

        {/* Content */}
        <main className="rb-content">
          {showPreview ? (
            /* ---- LIVE PREVIEW ---- */
            <div className="rb-preview">
              <div className="rv-paper" ref={previewRef}>
                <div className="rv-header">
                  <h1>{formData.fullName}</h1>
                  <p className="rv-title">{formData.title}</p>
                  <div className="rv-contact">
                    <span><Mail size={12} /> {formData.email}</span>
                    <span><Phone size={12} /> {formData.phone}</span>
                    <span><MapPin size={12} /> {formData.location}</span>
                    {formData.linkedin && <span><Linkedin size={12} /> {formData.linkedin}</span>}
                  </div>
                </div>

                {formData.summary && (
                  <div className="rv-section">
                    <h2>Professional Summary</h2>
                    <p>{formData.summary}</p>
                  </div>
                )}

                {experience.length > 0 && (
                  <div className="rv-section">
                    <h2>Experience</h2>
                    {experience.map(exp => (
                      <div key={exp.id} className="rv-item">
                        <div className="rv-item-header">
                          <strong>{exp.title}</strong>
                          <span className="rv-period">{exp.period}</span>
                        </div>
                        <span className="rv-org">{exp.org}</span>
                        {exp.description && <p className="rv-desc">{exp.description}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {education.length > 0 && (
                  <div className="rv-section">
                    <h2>Education</h2>
                    {education.map(edu => (
                      <div key={edu.id} className="rv-item">
                        <div className="rv-item-header">
                          <strong>{edu.degree}</strong>
                          <span className="rv-period">{edu.period}</span>
                        </div>
                        <span className="rv-org">{edu.school}</span>
                        {edu.grade && <span className="rv-grade">{edu.grade}</span>}
                      </div>
                    ))}
                  </div>
                )}

                {skills.length > 0 && (
                  <div className="rv-section">
                    <h2>Skills</h2>
                    <div className="rv-skills">
                      {skills.map(s => (
                        <span key={s.name} className="rv-skill-tag">{s.name}</span>
                      ))}
                    </div>
                  </div>
                )}

                {certifications.length > 0 && (
                  <div className="rv-section">
                    <h2>Certifications</h2>
                    {certifications.map(c => (
                      <div key={c.id} className="rv-item compact">
                        <strong>{c.name}</strong>
                        <span className="rv-org">{c.issuer} · {c.date}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ---- FORM SECTIONS ---- */
            <>
              {activeSection === 'personal' && (
                <div className="rb-section">
                  <div className="rb-section-header">
                    <User size={22} />
                    <div>
                      <h2>Personal Information</h2>
                      <p>Your basic contact and profile details</p>
                    </div>
                  </div>

                  <div className="rb-form-grid">
                    <div className="rb-field">
                      <label><User size={14} /> Full Name</label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="rb-field">
                      <label><Briefcase size={14} /> Professional Title</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="e.g., Full Stack Developer"
                      />
                    </div>
                    <div className="rb-field">
                      <label><Mail size={14} /> Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                      />
                    </div>
                    <div className="rb-field">
                      <label><Phone size={14} /> Phone</label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                      />
                    </div>
                    <div className="rb-field">
                      <label><MapPin size={14} /> Location</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                      />
                    </div>
                    <div className="rb-field">
                      <label><Linkedin size={14} /> LinkedIn</label>
                      <input
                        type="text"
                        value={formData.linkedin}
                        onChange={(e) => handleInputChange('linkedin', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="rb-field full">
                    <label><FileText size={14} /> Professional Summary</label>
                    <textarea
                      rows={4}
                      value={formData.summary}
                      onChange={(e) => handleInputChange('summary', e.target.value)}
                      placeholder="Write a brief summary about yourself..."
                    />
                  </div>
                </div>
              )}

              {activeSection === 'experience' && (
                <div className="rb-section">
                  <div className="rb-section-header">
                    <Briefcase size={22} />
                    <div>
                      <h2>Work Experience</h2>
                      <p>Your professional journey and roles</p>
                    </div>
                    <button className="rb-add-btn">
                      <Plus size={16} /> Add Experience
                    </button>
                  </div>

                  <div className="rb-items-list">
                    {experience.map(exp => (
                      <div key={exp.id} className="rb-item-card">
                        <div className="rb-item-timeline">
                          <div className={`rb-timeline-dot ${exp.current ? 'current' : ''}`} />
                          <div className="rb-timeline-line" />
                        </div>
                        <div className="rb-item-body">
                          <div className="rb-item-top">
                            <div>
                              <h3>{exp.title}</h3>
                              <span className="rb-item-org">{exp.org}</span>
                            </div>
                            <div className="rb-item-right">
                              <span className="rb-item-period">{exp.period}</span>
                              {exp.current && <span className="rb-current-badge">Current</span>}
                              <button className="rb-delete" onClick={() => removeExperience(exp.id)}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          {exp.description && <p className="rb-item-desc">{exp.description}</p>}
                        </div>
                      </div>
                    ))}

                    {experience.length === 0 && (
                      <div className="rb-empty">
                        <Briefcase size={40} />
                        <h3>No experience added yet</h3>
                        <p>Add your work history to build a stronger profile</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeSection === 'education' && (
                <div className="rb-section">
                  <div className="rb-section-header">
                    <GraduationCap size={22} />
                    <div>
                      <h2>Education</h2>
                      <p>Your academic background</p>
                    </div>
                    <button className="rb-add-btn">
                      <Plus size={16} /> Add Education
                    </button>
                  </div>

                  <div className="rb-items-list">
                    {education.map(edu => (
                      <div key={edu.id} className="rb-item-card">
                        <div className="rb-item-timeline">
                          <div className="rb-timeline-dot" />
                          <div className="rb-timeline-line" />
                        </div>
                        <div className="rb-item-body">
                          <div className="rb-item-top">
                            <div>
                              <h3>{edu.degree}</h3>
                              <span className="rb-item-org">{edu.school}</span>
                            </div>
                            <div className="rb-item-right">
                              <span className="rb-item-period">{edu.period}</span>
                              <button className="rb-delete" onClick={() => removeEducation(edu.id)}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          {edu.grade && <span className="rb-grade-badge">{edu.grade}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'skills' && (
                <div className="rb-section">
                  <div className="rb-section-header">
                    <Code size={22} />
                    <div>
                      <h2>Skills & Expertise</h2>
                      <p>Showcase your technical and soft skills</p>
                    </div>
                  </div>

                  <div className="rb-skill-input-row">
                    <input
                      type="text"
                      placeholder="Add a skill (e.g., React, Leadership)..."
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                    />
                    <button className="rb-add-btn compact" onClick={addSkill} disabled={!newSkill.trim()}>
                      <Plus size={16} /> Add
                    </button>
                  </div>

                  <div className="rb-skills-grid">
                    {skills.map(skill => (
                      <div key={skill.name} className="rb-skill-card">
                        <div className="rb-skill-top">
                          <span className="rb-skill-name">{skill.name}</span>
                          <button className="rb-skill-remove" onClick={() => removeSkill(skill.name)}>
                            <X size={12} />
                          </button>
                        </div>
                        <div className="rb-skill-bar">
                          <div className="rb-skill-fill" style={{ width: `${skill.level}%` }} />
                        </div>
                        <span className="rb-skill-level">{skill.level}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'certifications' && (
                <div className="rb-section">
                  <div className="rb-section-header">
                    <Award size={22} />
                    <div>
                      <h2>Certifications</h2>
                      <p>Professional certifications and courses</p>
                    </div>
                    <button className="rb-add-btn">
                      <Plus size={16} /> Add Certificate
                    </button>
                  </div>

                  <div className="rb-cert-grid">
                    {certifications.map(cert => (
                      <div key={cert.id} className="rb-cert-card">
                        <div className="rb-cert-icon">
                          <Award size={24} />
                        </div>
                        <div className="rb-cert-info">
                          <h3>{cert.name}</h3>
                          <span>{cert.issuer}</span>
                          <span className="rb-cert-date">{cert.date}</span>
                        </div>
                        <CheckCircle size={18} className="rb-cert-check" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
