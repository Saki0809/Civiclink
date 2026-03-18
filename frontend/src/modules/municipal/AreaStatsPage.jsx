import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, ChevronLeft, TrendingUp, TrendingDown,
  Users, Building2, CheckCircle, Clock, Zap
} from 'lucide-react';
import '../DomainDashboard.css';
import './Municipal.css';

export function AreaStatsPage() {
  const navigate = useNavigate();

  const stats = [
    { label: 'Issue Resolution Rate', value: '84%', trend: 'up', change: '+2.4%' },
    { label: 'Avg. Response Time', value: '1.2h', trend: 'down', change: '-15m' },
    { label: 'Civic Participation', value: '12K+', trend: 'up', change: '+540' },
  ];

  return (
    <div className="municipal-dashboard">
      <header className="page-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/municipal')}>
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="page-title">Area Analytics</h1>
            <p className="page-description">Performance metrics for your municipal zone</p>
          </div>
        </div>
      </header>

      <div className="stats-dashboard">
        <div className="stats-grid">
          {stats.map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-content">
                <span className="stat-label">{s.label}</span>
                <div className="stat-value">{s.value}</div>
                <div className={`stat-change ${s.trend}`}>
                  {s.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  <span>{s.change} vs last month</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="charts-section mt-xl">
          <div className="chart-card">
            <div className="card-header">
              <h3>Issues Reported (Last 7 Days)</h3>
              <BarChart3 size={18} />
            </div>
            <div className="chart-placeholder">
              {/* Simulation of a bar chart */}
              <div className="bar-chart">
                <div className="bar" style={{ height: '40%' }} title="Mon"></div>
                <div className="bar" style={{ height: '70%' }} title="Tue"></div>
                <div className="bar" style={{ height: '55%' }} title="Wed"></div>
                <div className="bar" style={{ height: '85%' }} title="Thu"></div>
                <div className="bar" style={{ height: '65%' }} title="Fri"></div>
                <div className="bar" style={{ height: '95%' }} title="Sat"></div>
                <div className="bar" style={{ height: '30%' }} title="Sun"></div>
              </div>
              <div className="chart-axis">
                <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
              </div>
            </div>
          </div>

          <div className="analytics-details mt-lg">
            <div className="section-header">
              <h2>Top Performing Zones</h2>
            </div>
            <div className="zone-list">
              <div className="zone-item">
                <span className="zone-rank">1</span>
                <span className="zone-name">North Industrial Sector</span>
                <div className="zone-progress-wrap">
                  <div className="zone-progress" style={{ width: '92%' }}></div>
                </div>
                <span className="zone-value">92%</span>
              </div>
              <div className="zone-item">
                <span className="zone-rank">2</span>
                <span className="zone-name">Park View Residency</span>
                <div className="zone-progress-wrap">
                  <div className="zone-progress" style={{ width: '85%' }}></div>
                </div>
                <span className="zone-value">85%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
