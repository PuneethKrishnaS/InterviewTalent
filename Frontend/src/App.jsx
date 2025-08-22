import {
  Routes,
  Route,
  useNavigate,
  Navigate,
  replace,
} from "react-router-dom";
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

function App() {
  const { getUser, loading, user, checkingAuth, authenticated } =
    useContext(AuthContext);
  useEffect(() => {
    getUser();
  }, []);

  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return <div>loading</div>;
    }

    if (!user) {
      return <Navigate to="/login" replace />;
    }

    return children;
  };

  const RedirectRoute = ({ children }) => {
    if (loading) {
      return <div>Loading</div>;
    }

    if (user) {
      return <Navigate to="/dashboard" replace />;
    }

    return children;
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
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
          path="/interview-section"
          element={
            <ProtectedRoute>
              <InterviewSection />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview-results"
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
      </Routes>
    </ThemeProvider>
  );
}

export default App;
