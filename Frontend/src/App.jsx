import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/context/theme-provider";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Interview from "./pages/Interview";
import InterviewSection from "./pages/InterviewSection";
import InterviewResult from "./pages/InterviewResult";
import Leetcode from "./pages/Leetcode";
import Github from "./pages/Github";
import Resume from "./pages/Resume";
import { AuthContext } from "./components/context/AuthContext";
import { useContext } from "react";
import { useEffect } from "react";
import NotFound from "./pages/NotFound";
import VoiceInterview from "./pages/VoiceInterview";
import VoiceCall from "./pages/VoiceCall";
import { Ripple } from "./components/magicui/ripple";
import { LoadingScreen } from "./components/LoadingScreen";

function App() {
  const { getUser, authenticated } = useContext(AuthContext);

  useEffect(() => {
    getUser();
  }, []);
  const ProtectedRoute = ({ children }) => {
    const { user, authenticated, checkingAuth } = useContext(AuthContext); // Get checkingAuth state

    if (checkingAuth) {
      return <LoadingScreen />;
    }

    if (!user && !authenticated) {
      return <Navigate to="/login" replace />;
    }

    return children;
  };

  const RedirectRoute = ({ children }) => {
    if (!authenticated) {
      return children;
    }

    return <Navigate to="/dashboard" replace />;
  };

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Routes>
        <Route
          path="/"
          element={
            <RedirectRoute>
              <Index />
            </RedirectRoute>
          }
        />
        <Route
          path="/login"
          element={
            <RedirectRoute>
              <Login />
            </RedirectRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <RedirectRoute>
              <Signup />
            </RedirectRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview"
          element={
            <ProtectedRoute>
              <Interview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview/section"
          element={
            <ProtectedRoute>
              <InterviewSection />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview/results"
          element={
            <ProtectedRoute>
              <InterviewResult />
            </ProtectedRoute>
          }
        />

        <Route
          path="/leetcode-profile"
          element={
            <ProtectedRoute>
              <Leetcode />
            </ProtectedRoute>
          }
        />
        <Route
          path="/github-profile"
          element={
            <ProtectedRoute>
              <Github />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resume"
          element={
            <ProtectedRoute>
              <Resume />
            </ProtectedRoute>
          }
        />
        <Route
          path="/voice"
          element={
            <ProtectedRoute>
              <VoiceInterview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/voice/section"
          element={
            <ProtectedRoute>
              <VoiceCall />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
