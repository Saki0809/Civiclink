import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowLeft, MapPin, Calendar, Briefcase, Users, Search, Filter, X, Send, FileText, CheckCircle } from 'lucide-react';
import '../DomainDashboard.css';
import './Education.css';

export function ApplyJobPage() {
  const navigate = useNavigate();
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [filters, setFilters] = useState({
    locality: '',
    type: '',
    search: ''
  });

  const [applicationData, setApplicationData] = useState({
    resume: '',
    coverLetter: '',
    phone: '',
    experience: '',
    skills: '',
    expectedSalary: '',
    availability: ''
  });

  const localities = [
    'Sector 12', 'Sector 15', 'Park Avenue', 'Green Colony', 
    'New Town', 'City Center', 'Old Town', 'Remote'
  ];

  const jobTypes = [
    { value: 'full_time', label: 'Full Time' },
    { value: 'part_time', label: 'Part Time' },
    { value: 'internship', label: 'Internship' },
    { value: 'contract', label: 'Contract' },
    { value: 'scholarship', label: 'Scholarship' },
    { value: 'training', label: 'Training' }
  ];

  // Dummy job data
  const allJobs = [
    { 
      id: 1, 
      title: 'Software Developer Intern', 
      institution: 'Tech Academy', 
      type: 'internship', 
      location: 'Remote', 
      deadline: '2026-02-20', 
      applications: 24,
      salary: '₹15,000 - ₹20,000/month',
      description: 'Looking for enthusiastic interns to join our development team. You will work on real projects and learn from experienced developers.',
      requirements: ['Currently pursuing B.Tech/MCA', 'Knowledge of JavaScript/Python', 'Good communication skills'],
      posted: '2026-02-01'
    },
    { 
      id: 2, 
      title: 'Mathematics Teacher', 
      institution: 'City Public School', 
      type: 'full_time', 
      location: 'Sector 15', 
      deadline: '2026-02-25', 
      applications: 18,
      salary: '₹35,000 - ₹45,000/month',
      description: 'Experienced mathematics teacher needed for classes 9-12. Must have excellent teaching skills and patience.',
      requirements: ['B.Ed/M.Ed in Mathematics', '3+ years teaching experience', 'Board exam experience preferred'],
      posted: '2026-02-02'
    },
    { 
      id: 3, 
      title: 'Research Assistant', 
      institution: 'National University', 
      type: 'part_time', 
      location: 'City Center', 
      deadline: '2026-03-01', 
      applications: 45,
      salary: '₹18,000 - ₹25,000/month',
      description: 'Assist professors in ongoing research projects. Data collection, analysis, and report preparation.',
      requirements: ['Masters degree in relevant field', 'Strong analytical skills', 'Research methodology knowledge'],
      posted: '2026-02-03'
    },
    { 
      id: 4, 
      title: 'Merit Scholarship 2026', 
      institution: 'Education Foundation', 
      type: 'scholarship', 
      location: 'Remote', 
      deadline: '2026-03-15', 
      applications: 120,
      salary: 'Up to ₹1,00,000/year',
      description: 'Merit-based scholarship for outstanding students from economically weaker sections.',
      requirements: ['10th/12th marks above 85%', 'Family income below ₹3 LPA', 'Enrolled in recognized institution'],
      posted: '2026-01-15'
    },
    { 
      id: 5, 
      title: 'Data Entry Operator', 
      institution: 'Municipal Corporation', 
      type: 'contract', 
      location: 'Park Avenue', 
      deadline: '2026-02-18', 
      applications: 56,
      salary: '₹12,000 - ₹15,000/month',
      description: 'Data entry and record management for civic database. 6-month contract with extension possibility.',
      requirements: ['12th pass minimum', 'Typing speed 40+ WPM', 'Basic computer knowledge'],
      posted: '2026-02-04'
    },
    { 
      id: 6, 
      title: 'Healthcare Training Program', 
      institution: 'City Hospital', 
      type: 'training', 
      location: 'Sector 12', 
      deadline: '2026-02-28', 
      applications: 89,
      salary: 'Free training + Certificate',
      description: 'Free 3-month healthcare assistant training program. Certificate and job placement assistance.',
      requirements: ['10th pass minimum', 'Age 18-35', 'Basic English proficiency'],
      posted: '2026-02-01'
    },
    { 
      id: 7, 
      title: 'Content Writer', 
      institution: 'Digital Media House', 
      type: 'full_time', 
      location: 'New Town', 
      deadline: '2026-02-22', 
      applications: 34,
      salary: '₹25,000 - ₹35,000/month',
      description: 'Create engaging content for websites, blogs, and social media. SEO knowledge preferred.',
      requirements: ['Excellent English writing skills', 'Portfolio of writing samples', 'Creativity and research skills'],
      posted: '2026-02-03'
    },
    { 
      id: 8, 
      title: 'Lab Technician', 
      institution: 'Science College', 
      type: 'full_time', 
      location: 'Green Colony', 
      deadline: '2026-03-05', 
      applications: 22,
      salary: '₹20,000 - ₹28,000/month',
      description: 'Manage chemistry and biology labs. Equipment maintenance and student assistance.',
      requirements: ['B.Sc in Chemistry/Biology', '1+ year lab experience', 'Safety protocol knowledge'],
      posted: '2026-02-05'
    }
  ];

  const typeConfig = {
    full_time: { label: 'Full Time', color: 'var(--success-color)' },
    part_time: { label: 'Part Time', color: 'var(--info-color)' },
    internship: { label: 'Internship', color: 'var(--education-color)' },
    contract: { label: 'Contract', color: 'var(--warning-color)' },
    scholarship: { label: 'Scholarship', color: 'var(--primary-600)' },
    training: { label: 'Training', color: 'var(--healthcare-color)' }
  };

  // Filter jobs based on selected filters
  const filteredJobs = allJobs.filter(job => {
    const matchesLocality = !filters.locality || job.location === filters.locality;
    const matchesType = !filters.type || job.type === filters.type;
    const matchesSearch = !filters.search || 
      job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      job.institution.toLowerCase().includes(filters.search.toLowerCase());
    return matchesLocality && matchesType && matchesSearch;
  });

  const handleApply = (job) => {
    setSelectedJob(job);
    setShowApplicationModal(true);
  };

  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setSubmitted(true);
  };

  const closeModal = () => {
    setShowApplicationModal(false);
    setSelectedJob(null);
    setSubmitted(false);
    setApplicationData({
      resume: '',
      coverLetter: '',
      phone: '',
      experience: '',
      skills: '',
      expectedSalary: '',
      availability: ''
    });
  };

  return (
    <div className="domain-dashboard">
      <div className="page-header">
        <div>
          <button className="btn-back" onClick={() => navigate('/education')}>
            <ArrowLeft size={18} /> Back
          </button>
          <h1 className="page-title">Apply for Jobs</h1>
          <p className="page-description">Browse available opportunities in your locality and apply</p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search jobs by title or institution..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>
        
        <div className="filter-dropdowns">
          <div className="filter-group">
            <MapPin size={16} />
            <select
              value={filters.locality}
              onChange={(e) => setFilters(prev => ({ ...prev, locality: e.target.value }))}
            >
              <option value="">All Localities</option>
              {localities.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <Briefcase size={16} />
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            >
              <option value="">All Types</option>
              {jobTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {(filters.locality || filters.type || filters.search) && (
            <button 
              className="btn btn-text"
              onClick={() => setFilters({ locality: '', type: '', search: '' })}
            >
              <X size={16} /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="results-info">
        <span>{filteredJobs.length} opportunities found</span>
      </div>

      {/* Jobs Grid */}
      <div className="jobs-apply-grid">
        {filteredJobs.map(job => (
          <div key={job.id} className="job-apply-card">
            <div className="job-header">
              <span 
                className="job-type" 
                style={{ background: `${typeConfig[job.type].color}20`, color: typeConfig[job.type].color }}
              >
                {typeConfig[job.type].label}
              </span>
              <span className="job-applications">
                <Users size={14} /> {job.applications} applied
              </span>
            </div>
            
            <h3 className="job-title">{job.title}</h3>
            <p className="job-institution">{job.institution}</p>
            
            <p className="job-description">{job.description}</p>
            
            <div className="job-meta">
              <div className="job-detail">
                <MapPin size={14} />
                <span>{job.location}</span>
              </div>
              <div className="job-detail">
                <Calendar size={14} />
                <span>Due: {new Date(job.deadline).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="job-salary">
              <strong>{job.salary}</strong>
            </div>
            
            <div className="job-requirements">
              <h4>Requirements:</h4>
              <ul>
                {job.requirements.slice(0, 2).map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
                {job.requirements.length > 2 && (
                  <li className="more">+{job.requirements.length - 2} more</li>
                )}
              </ul>
            </div>
            
            <button className="btn btn-primary job-apply-btn" onClick={() => handleApply(job)}>
              Apply Now
            </button>
          </div>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="empty-state">
          <GraduationCap size={48} />
          <h3>No jobs found</h3>
          <p>Try adjusting your filters or search criteria</p>
        </div>
      )}

      {/* Application Modal */}
      {showApplicationModal && selectedJob && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              <X size={24} />
            </button>
            
            {submitted ? (
              <div className="application-success">
                <div className="success-icon education">
                  <GraduationCap size={48} />
                </div>
                <h2>Application Submitted!</h2>
                <p>Your application for <strong>{selectedJob.title}</strong> at {selectedJob.institution} has been submitted successfully.</p>
                <p className="success-note">You will receive updates via email. Good luck!</p>
                <button className="btn btn-primary" onClick={closeModal}>
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="modal-header">
                  <h2>Apply for {selectedJob.title}</h2>
                  <p>{selectedJob.institution}</p>
                </div>
                
                <form onSubmit={handleApplicationSubmit} className="application-form">
                  <div className="application-stepper">
                    <div className="step active">1. Profile</div>
                    <div className="step">2. Experience</div>
                    <div className="step">3. Finalize</div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Phone Number *</label>
                    <input
                      type="tel"
                      id="phone"
                      value={applicationData.phone}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Your contact number"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="skills">Key Skills *</label>
                    <input
                      type="text"
                      id="skills"
                      value={applicationData.skills}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, skills: e.target.value }))}
                      placeholder="e.g., JavaScript, Communication, Teaching"
                      required
                    />
                    <div className="skill-match-tag">
                      <CheckCircle size={14} /> 85% Match with job requirements
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="experience">Work Experience / Projects *</label>
                    <textarea
                      id="experience"
                      value={applicationData.experience}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, experience: e.target.value }))}
                      placeholder="Briefly describe your relevant projects or work history..."
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="coverLetter">Why are you interested in this role? *</label>
                    <textarea
                      id="coverLetter"
                      value={applicationData.coverLetter}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, coverLetter: e.target.value }))}
                      placeholder="Tell us why you're a great fit for this position..."
                      rows={4}
                      required
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="expectedSalary">Expected Salary</label>
                      <input
                        type="text"
                        id="expectedSalary"
                        value={applicationData.expectedSalary}
                        onChange={(e) => setApplicationData(prev => ({ ...prev, expectedSalary: e.target.value }))}
                        placeholder="e.g., ₹30,000/month"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="availability">Notice Period / Joining</label>
                      <input
                        type="text"
                        id="availability"
                        value={applicationData.availability}
                        onChange={(e) => setApplicationData(prev => ({ ...prev, availability: e.target.value }))}
                        placeholder="e.g., Immediate, 1 month"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="resume">Resume / Portfolio Link</label>
                    <input
                      type="url"
                      id="resume"
                      value={applicationData.resume}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, resume: e.target.value }))}
                      placeholder="Link to your Google Drive, LinkedIn, or personal website"
                    />
                  </div>
                  
                  <div className="modal-actions">
                    <button type="button" className="btn btn-outline" onClick={closeModal}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-education btn-lg" disabled={isSubmitting}>
                      {isSubmitting ? 'Processing...' : <><Send size={18} /> Submit Application</>}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ApplyJobPage;
