import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, Suspense } from 'react';
import useAuthStore from './store/authStore';

// Layout
import AppLayout from './components/layout/AppLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import JudgeLoginPage from './pages/JudgeLoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import VerifyPage from './pages/VerifyPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import ResumeAnalyzerPage from './pages/ResumeAnalyzerPage';
import ProblemMatcherPage from './pages/ProblemMatcherPage';
import ProblemDetailPage from './pages/ProblemDetailPage';
import FindTeammatesPage from './pages/FindTeammatesPage';
import CollaborationPage from './pages/CollaborationPage';
import NotificationsPage from './pages/NotificationsPage';
import TeamPage from './pages/TeamPage';
import TeamWorkspacePage from './pages/TeamWorkspacePage';
import ChatPage from './pages/ChatPage';
import TasksPage from './pages/TasksPage';
import GitHubPage from './pages/GitHubPage';
import ProjectPage from './pages/ProjectPage';
import SubmissionPage from './pages/SubmissionPage';
import EvaluationPage from './pages/EvaluationPage';
import JudgeDashboard from './pages/JudgeDashboard';
import LeaderboardPage from './pages/LeaderboardPage';
import PrizesPage from './pages/PrizesPage';
import CertificatesPage from './pages/CertificatesPage';
import CertificateDetailPage from './pages/CertificateDetailPage';
import AdminDashboard from './pages/AdminDashboard';
import AboutPage from './pages/AboutPage';
import GlobalSearchPage from './pages/GlobalSearchPage';
import NotFoundPage from './pages/NotFoundPage';

// Spinner fallback
const Spinner = () => (
  <div className="h-screen w-screen flex items-center justify-center bg-[#050816]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      <span className="text-gray-400 text-sm">Loading HackMatch AI...</span>
    </div>
  </div>
);

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  const { loadUser } = useAuthStore();

  useEffect(() => {
    // Safe load — catches any error
    loadUser().catch(() => {});
  }, []);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/home" element={<LandingPage />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/judge/login" element={<JudgeLoginPage />} />
      <Route path="/judge-login" element={<JudgeLoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/verify/:id" element={<VerifyPage />} />
      <Route path="/about" element={<AboutPage />} />

      {/* Protected Routes inside AppLayout */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/resume" element={<ResumeAnalyzerPage />} />
        <Route path="/problems" element={<ProblemMatcherPage />} />
        <Route path="/problems/:id" element={<ProblemDetailPage />} />
        <Route path="/teammates" element={<FindTeammatesPage />} />
        <Route path="/collaboration" element={<CollaborationPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/workspace" element={<TeamWorkspacePage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/github" element={<GitHubPage />} />
        <Route path="/project" element={<ProjectPage />} />
        <Route path="/submit" element={<SubmissionPage />} />
        <Route path="/evaluation" element={<EvaluationPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/prizes" element={<PrizesPage />} />
        <Route path="/certificates" element={<CertificatesPage />} />
        <Route path="/certificates/:id" element={<CertificateDetailPage />} />
        <Route path="/search" element={<GlobalSearchPage />} />

        {/* Role Specific */}
        <Route path="/judge" element={<ProtectedRoute allowedRoles={['judge', 'admin']}><JudgeDashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
