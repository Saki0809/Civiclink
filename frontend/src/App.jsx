import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './core/auth/AuthContext';
import { PreferencesProvider } from './core/preferences/PreferencesProvider';
import { AuthGuard, GuestGuard } from './core/auth/AuthGuard';
import { MainLayout } from './core/layout/MainLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { CivilianDashboard } from './pages/dashboard/CivilianDashboard';
import { CommunityChatPage } from './pages/community/CommunityChatPage';
import { MyAccountPage } from './pages/account/MyAccountPage';
import { HealthcareDashboard } from './modules/healthcare/HealthcareDashboard';
import { CreateCampPage } from './modules/healthcare/CreateCampPage';
import { MyRegistrationsPage } from './modules/healthcare/MyRegistrationsPage';
import { ApplyVolunteerPage } from './modules/healthcare/ApplyVolunteerPage';
import { MyVolunteerApplicationsPage } from './modules/healthcare/MyVolunteerApplicationsPage';
import { BloodDonationPage } from './modules/healthcare/BloodDonationPage';
import { FindDoctorsPage } from './modules/healthcare/FindDoctorsPage';
import { VaccinationPage } from './modules/healthcare/VaccinationPage';
import { MunicipalDashboard } from './modules/municipal/MunicipalDashboard';
import { AssignedIssuesPage } from './modules/municipal/AssignedIssuesPage';
import { ReportIssuePage } from './modules/municipal/ReportIssuePage';
import { MyIssuesPage } from './modules/municipal/MyIssuesPage';
import { InteractiveMapPage } from './modules/municipal/InteractiveMapPage';
import { AreaStatsPage } from './modules/municipal/AreaStatsPage';
import { EmergencyServicesPage } from './modules/municipal/EmergencyServicesPage';
import { EducationDashboard } from './modules/education/EducationDashboard';
import { PostJobPage } from './modules/education/PostJobPage';
import { ApplyJobPage } from './modules/education/ApplyJobPage';
import { MyJobApplicationsPage } from './modules/education/MyJobApplicationsPage';
import { ResumeBuilderPage } from './modules/education/ResumeBuilderPage';
import { OnlineCoursesPage } from './modules/education/OnlineCoursesPage';
import { ScholarshipsPage } from './modules/education/ScholarshipsPage';
import './index.css';

function AppRoutes() {
  return (
    <Routes>
      {/* Root Redirect - must be before the catch-all */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <GuestGuard>
            <LoginPage />
          </GuestGuard>
        }
      />
      <Route
        path="/signup"
        element={
          <GuestGuard>
            <SignupPage />
          </GuestGuard>
        }
      />

      {/* Protected Routes with Layout */}
      <Route
        path="/*"
        element={
          <AuthGuard>
            <MainLayout>
              <Routes>
                {/* Main Dashboard */}
                <Route path="dashboard" element={<CivilianDashboard />} />
                <Route path="opportunities" element={<CivilianDashboard />} />
                <Route path="my-applications" element={<CivilianDashboard />} />

                {/* Healthcare Routes */}
                <Route path="healthcare" element={<HealthcareDashboard />} />
                <Route path="healthcare/camps" element={<HealthcareDashboard />} />
                <Route path="healthcare/camps/new" element={<CreateCampPage />} />
                <Route path="healthcare/camps/:id" element={<HealthcareDashboard />} />
                <Route path="healthcare/my-camps" element={<MyRegistrationsPage />} />
                <Route path="healthcare/my-registrations" element={<MyRegistrationsPage />} />
                <Route path="healthcare/volunteer/apply" element={<ApplyVolunteerPage />} />
                <Route path="healthcare/my-applications" element={<MyVolunteerApplicationsPage />} />
                <Route path="healthcare/blood-donation" element={<BloodDonationPage />} />
                <Route path="healthcare/doctors" element={<FindDoctorsPage />} />
                <Route path="healthcare/vaccination" element={<VaccinationPage />} />
                <Route path="healthcare/community" element={<CommunityChatPage />} />

                {/* Municipal Routes */}
                <Route path="municipal" element={<MunicipalDashboard />} />
                <Route path="municipal/issues" element={<MunicipalDashboard />} />
                <Route path="municipal/issues/assigned" element={<AssignedIssuesPage />} />
                <Route path="municipal/issues/new" element={<ReportIssuePage />} />
                <Route path="municipal/issues/:id" element={<MunicipalDashboard />} />
                <Route path="municipal/my-issues" element={<MyIssuesPage />} />
                <Route path="municipal/map" element={<InteractiveMapPage />} />
                <Route path="municipal/stats" element={<AreaStatsPage />} />
                <Route path="municipal/emergency" element={<EmergencyServicesPage />} />
                <Route path="municipal/community" element={<CommunityChatPage />} />

                {/* Education Routes */}
                <Route path="education" element={<EducationDashboard />} />
                <Route path="education/jobs" element={<EducationDashboard />} />
                <Route path="education/jobs/new" element={<PostJobPage />} />
                <Route path="education/jobs/apply" element={<ApplyJobPage />} />
                <Route path="education/jobs/:id" element={<EducationDashboard />} />
                <Route path="education/applications" element={<EducationDashboard />} />
                <Route path="education/my-applications" element={<MyJobApplicationsPage />} />
                <Route path="education/resume" element={<ResumeBuilderPage />} />
                <Route path="education/courses" element={<OnlineCoursesPage />} />
                <Route path="education/scholarships" element={<ScholarshipsPage />} />
                <Route path="education/community" element={<CommunityChatPage />} />

                {/* Community Chat Routes */}
                <Route path="community" element={<CommunityChatPage />} />
                <Route path="chat/:domain" element={<CommunityChatPage />} />

                {/* Profile & Settings */}
                <Route path="profile" element={<MyAccountPage />} />
                <Route path="settings" element={<MyAccountPage />} />

                {/* Unauthorized */}
                <Route
                  path="unauthorized"
                  element={
                    <div style={{ textAlign: 'center', padding: '4rem' }}>
                      <h2>Access Denied</h2>
                      <p>You don't have permission to access this page.</p>
                    </div>
                  }
                />

                {/* Default Redirect */}
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </MainLayout>
          </AuthGuard>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <PreferencesProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </PreferencesProvider>
    </BrowserRouter>
  );
}

export default App;
