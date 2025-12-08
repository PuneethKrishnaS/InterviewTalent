import { useNavigate } from "react-router-dom";
import MainNavbar from "../components/global/MainNavbar";
import { Button } from "../components/ui/button";
import {
  ChevronLeft,
  Share2,
  Download,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Target,
  ShieldAlert,
  Zap,
  BrainCircuit,
  Award
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { interviewStore } from "../components/store/InterviewStore";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function InterviewResult() {
  const { interviewFeedback } = interviewStore();
  const navigate = useNavigate();

  // Handle case where user navigates directly without data
  if (!interviewFeedback) {
     return (
        <div className="flex h-screen items-center justify-center flex-col gap-4 bg-background">
            <h1 className="text-2xl font-bold">No Result Data Available</h1>
            <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
        </div>
     );
  }

  const {
    interviewType,
    jobRole,
    difficultyLevel,
    questions,
    performanceScore,
    performanceSummary,
    averageInterviewConfidence 
  } = interviewFeedback;

  // Chart Data: Emotional Confidence Trend
  const confidenceData = {
    labels: questions?.map((_, i) => `Q${i + 1}`) || [],
    datasets: [
      {
        label: 'Emotional Confidence (%)',
        data: questions?.map((q) => q.emotionalData?.averageConfidence || 0) || [],
        borderColor: '#4f46e5', // Indigo
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 14 }
      }
    },
    scales: {
        y: { beginAtZero: true, max: 100, grid: { color: 'rgba(0,0,0,0.05)' } },
        x: { grid: { display: false } }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-foreground pb-20">
      <MainNavbar />
      
      <div className="container mx-auto px-4 lg:px-8 py-10 max-w-7xl">
        
        {/* Top Navigation */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <Button variant="ghost" className="pl-0 hover:bg-transparent" onClick={() => navigate('/dashboard')}>
            <ChevronLeft className="h-5 w-5 mr-1" /> Back to Dashboard
          </Button>
          <div className="flex gap-3">
             <Button variant="outline" size="sm"><Share2 className="w-4 h-4 mr-2" /> Share</Button>
          </div>
        </div>

        {/* --- HERO SECTION: SCORES --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            
            {/* Main Score Card */}
            <Card className="md:col-span-1 bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-none shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                <CardHeader className="pb-2">
                    <CardTitle className="text-indigo-100 text-sm font-medium uppercase tracking-wider flex items-center gap-2">
                        <Award className="w-4 h-4" /> Overall Score
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-6">
                    <div className="text-7xl font-black tracking-tighter mb-2">{performanceScore}</div>
                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-none px-4 py-1 text-base">
                        {performanceScore > 80 ? "Outstanding" : performanceScore > 60 ? "Good" : "Needs Work"}
                    </Badge>
                </CardContent>
            </Card>

            {/* Context & Summary */}
            <Card className="md:col-span-2 shadow-md border-slate-200 dark:border-slate-800">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-xl">Evaluation Summary</CardTitle>
                            <CardDescription>{interviewType} • {jobRole}</CardDescription>
                        </div>
                        <Badge variant="outline" className="text-xs uppercase">{difficultyLevel}</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                        {performanceSummary}
                    </p>
                    
                    <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-bold">Avg. Confidence</p>
                            <p className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400">
                                {Math.round(averageInterviewConfidence || 0)}%
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-bold">Questions</p>
                            <p className="text-2xl font-semibold">{questions?.length}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-bold">Duration</p>
                            <p className="text-2xl font-semibold">~{questions?.length * 3}m</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* --- ANALYTICS GRAPH --- */}
        <div className="grid grid-cols-1 gap-8 mb-12">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BrainCircuit className="w-5 h-5 text-indigo-500" />
                        Confidence Analysis
                    </CardTitle>
                    <CardDescription>How your AI-detected confidence fluctuated across questions.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <Line data={confidenceData} options={chartOptions} />
                </CardContent>
            </Card>
        </div>

        {/* --- DEEP DIVE: QUESTIONS & SWOT --- */}
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-500" /> Question Breakdown
        </h2>
        
        <div className="space-y-8">
            {questions?.map((q, index) => (
                <Card key={index} className="overflow-hidden border-l-4 border-l-indigo-500 shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 pb-4">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div>
                                <Badge variant="secondary" className="mb-2">Question {index + 1}</Badge>
                                <h3 className="text-lg font-semibold">{q.question}</h3>
                            </div>
                            <Badge className={`${
                                q.feedbackRating === 'Excellent' ? 'bg-green-600' : 
                                q.feedbackRating === 'Good' ? 'bg-blue-600' : 
                                q.feedbackRating === 'Average' ? 'bg-yellow-600' : 'bg-red-600'
                            }`}>
                                {q.feedbackRating}
                            </Badge>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="pt-6">
                        <div className="grid lg:grid-cols-2 gap-8">
                            
                            {/* Left Column: Answer & AI Feedback */}
                            <div className="space-y-6">
                                {/* User Answer */}
                                <div>
                                    <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2 flex items-center gap-2">
                                        <CheckCircle2 className="w-3 h-3" /> Your Answer
                                    </h4>
                                    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg text-sm border border-slate-200 dark:border-slate-700 italic text-foreground/80">
                                        "{q.answer || "No answer recorded."}"
                                    </div>
                                </div>
                                
                                {/* AI Critique */}
                                <div>
                                    <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">AI Critique</h4>
                                    <p className="text-sm leading-relaxed text-foreground">{q.feedback}</p>
                                </div>

                                {/* Expression Stats */}
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded border border-indigo-100 dark:border-indigo-800 flex items-center justify-between">
                                    <span className="text-sm font-medium text-indigo-900 dark:text-indigo-200">Emotional State:</span>
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className="capitalize bg-background">
                                            {q.emotionalData?.dominantExpression || "Neutral"}
                                        </Badge>
                                        <span className="text-sm font-bold text-indigo-700 dark:text-indigo-400">
                                            {q.emotionalData?.averageConfidence || 0}% Confident
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: SWOT Grid */}
                            <div>
                                <h4 className="text-xs font-bold uppercase text-muted-foreground mb-4">SWOT Analysis</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    
                                    {/* Strengths */}
                                    <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900">
                                        <div className="flex items-center gap-2 mb-2 text-green-700 dark:text-green-400 font-bold text-xs uppercase">
                                            <TrendingUp className="w-3 h-3" /> Strengths
                                        </div>
                                        <ul className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
                                            {q.swotAnalysis?.strengths?.map((item, i) => (
                                                <li key={i} className="list-disc list-inside">{item}</li>
                                            )) || <li>No specific strengths.</li>}
                                        </ul>
                                    </div>

                                    {/* Weaknesses */}
                                    <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900">
                                        <div className="flex items-center gap-2 mb-2 text-orange-700 dark:text-orange-400 font-bold text-xs uppercase">
                                            <AlertTriangle className="w-3 h-3" /> Weaknesses
                                        </div>
                                        <ul className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
                                            {q.swotAnalysis?.weaknesses?.map((item, i) => (
                                                <li key={i} className="list-disc list-inside">{item}</li>
                                            )) || <li>None detected.</li>}
                                        </ul>
                                    </div>

                                    {/* Opportunities */}
                                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900">
                                        <div className="flex items-center gap-2 mb-2 text-blue-700 dark:text-blue-400 font-bold text-xs uppercase">
                                            <Target className="w-3 h-3" /> Opportunities
                                        </div>
                                        <ul className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
                                            {q.swotAnalysis?.opportunities?.map((item, i) => (
                                                <li key={i} className="list-disc list-inside">{item}</li>
                                            )) || <li>Standard growth path.</li>}
                                        </ul>
                                    </div>

                                    {/* Threats */}
                                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900">
                                        <div className="flex items-center gap-2 mb-2 text-red-700 dark:text-red-400 font-bold text-xs uppercase">
                                            <ShieldAlert className="w-3 h-3" /> Threats
                                        </div>
                                        <ul className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
                                            {q.swotAnalysis?.threats?.map((item, i) => (
                                                <li key={i} className="list-disc list-inside">{item}</li>
                                            )) || <li>None detected.</li>}
                                        </ul>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
        
      </div>
    </div>
  );
}