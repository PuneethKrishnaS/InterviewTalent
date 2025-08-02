import { Routes, Route } from "react-router-dom";
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
import Resume from "./pages/resume";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/interview" element={<Interview />} />
        <Route path="/interview-section" element={<InterviewSection />} />
        <Route path="/interview-results" element={<InterviewResult />} />
        <Route path="/leetcode-profile" element={<Leetcode />} />
        <Route path="/github-profile" element={<Github />} />
        <Route path="/resume" element={<Resume />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
