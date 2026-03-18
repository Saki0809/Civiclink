import { useNavigate } from 'react-router-dom';
import { 
  Award, ChevronLeft, Search, Filter, 
  Calendar, CheckCircle, ExternalLink, Info,
  DollarSign, GraduationCap, MapPin
} from 'lucide-react';
import '../DomainDashboard.css';
import './Education.css';

export function ScholarshipsPage() {
  const navigate = useNavigate();

  const scholarships = [
    { id: 1, title: 'Merit-Based Excellence Scholarship 2026', provider: 'City Education Board', amount: '₹50,000', deadline: '2026-03-15', category: 'Academic', coverage: 'Full Tuition' },
    { id: 2, title: 'STEM Career Grant for Women', provider: 'Tech Women Foundation', amount: '₹1,00,000', deadline: '2026-04-01', category: 'Technology', coverage: 'Research & Books' },
    { id: 3, title: 'Local Community Leadership Award', provider: 'Mayor\'s Office', amount: '₹25,000', deadline: '2026-02-28', category: 'Community', coverage: 'Maintenance Allowance' },
  ];

  return (
    <div className="education-dashboard">
      <header className="page-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/education')}>
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="page-title">Scholarships & Grants</h1>
            <p className="page-description">Find financial support for your educational journey</p>
          </div>
        </div>
      </header>

      <div className="scholarships-dashboard">
        <div className="matching-prompt card-like municipal mb-xl">
          <div className="prompt-content">
            <GraduationCap size={24} />
            <div>
              <h3>Scholarships matching your profile!</h3>
              <p>Based on your B.Tech profile, we found 8 new opportunities you are eligible for.</p>
            </div>
          </div>
          <button className="btn btn-sm btn-outline-white">See Matches</button>
        </div>

        <div className="search-section card-like">
          <div className="search-bar-wrapper">
            <Search size={20} />
            <input type="text" placeholder="Search by name, category, or provider..." />
            <button className="filter-btn"><Filter size={18} /> Eligibility</button>
          </div>
        </div>

        <div className="scholarships-list mt-lg">
          {scholarships.map(s => (
            <div key={s.id} className="camp-card-horizontal scholarship-card">
              <div className="camp-icon-wrapper" style={{ background: 'var(--warning-light)' }}>
                <Award size={24} style={{ color: 'var(--warning-color)' }} />
              </div>
              <div className="camp-info">
                <div className="camp-header-row">
                  <h3 className="camp-title">{s.title}</h3>
                  <span className="scholarship-type">{s.category}</span>
                </div>
                <p className="dr-specialty">{s.provider}</p>
                <div className="camp-meta">
                  <span><DollarSign size={14} /> Amount: <strong>{s.amount}</strong></span>
                  <span><Calendar size={14} /> Application Deadline: {new Date(s.deadline).toLocaleDateString()}</span>
                  <span><CheckCircle size={14} /> Coverage: {s.coverage}</span>
                </div>
              </div>
              <div className="dr-actions">
                <button className="register-btn">Apply Now</button>
                <button className="btn btn-sm btn-outline mt-xs"><ExternalLink size={14} /> Details</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
