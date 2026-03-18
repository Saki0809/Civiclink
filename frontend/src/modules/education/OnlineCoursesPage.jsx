import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Library, ChevronLeft, Search, Filter, 
  PlayCircle, Clock, Star, BookOpen, 
  Award, CheckCircle, Smartphone
} from 'lucide-react';
import '../DomainDashboard.css';
import './Education.css';

export function OnlineCoursesPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');

  const courses = [
    { id: 1, title: 'English Communication Skills', provider: 'City Ed Center', duration: '12 hours', rating: 4.8, students: '1.2k', image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&h=250&fit=crop', category: 'Language' },
    { id: 2, title: 'Basic Digital Literacy', provider: 'Tech Foundation', duration: '8 hours', rating: 4.9, students: '4.5k', image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=250&fit=crop', category: 'Technology' },
    { id: 3, title: 'Financial Planning for Adults', provider: 'Municipal Bank', duration: '5 hours', rating: 4.6, students: '800', image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop', category: 'Finance' },
  ];

  return (
    <div className="education-dashboard">
      <header className="page-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/education')}>
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="page-title">Online Courses</h1>
            <p className="page-description">Learn new skills and earn certifications from top providers</p>
          </div>
        </div>
      </header>

      <div className="courses-dashboard">
        <div className="search-section card-like">
          <div className="search-bar-wrapper">
            <Search size={20} />
            <input type="text" placeholder="What do you want to learn today?" />
            <button className="filter-btn"><Filter size={18} /> Filters</button>
          </div>
        </div>

        <div className="category-scroll mt-lg">
          {['All', 'Technology', 'Language', 'Finance', 'Vocational', 'Personal Dev'].map(cat => (
            <button 
              key={cat} 
              className={`cat-pill ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="courses-grid mt-xl">
          {courses.map(course => (
            <div key={course.id} className="course-card">
              <div className="course-image">
                <img src={course.image} alt={course.title} />
                <div className="course-play-overlay"><PlayCircle size={48} /></div>
              </div>
              <div className="course-content">
                <span className="course-cat">{course.category}</span>
                <h4>{course.title}</h4>
                <p className="course-provider">{course.provider}</p>
                <div className="course-meta">
                  <span className="meta-item"><Clock size={14} /> {course.duration}</span>
                  <span className="meta-item rating"><Star size={14} fill="var(--warning-color)" /> {course.rating}</span>
                </div>
                <div className="course-footer">
                  <span className="students-count">{course.students} students</span>
                  <button className="enroll-btn">Enroll Now</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="my-learning-bar mt-2xl card-like">
          <div className="learning-status">
            <h3>Continue Learning</h3>
            <div className="current-course">
              <div className="course-progress-mini"><div className="fill" style={{ width: '45%' }}></div></div>
              <div className="course-details">
                <strong>Project Management Basics</strong>
                <span>Lesson 4 of 12 • 45% Complete</span>
              </div>
            </div>
          </div>
          <button className="btn btn-primary">Resume Class</button>
        </div>
      </div>
    </div>
  );
}
