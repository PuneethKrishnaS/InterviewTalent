import { useNavigate } from "react-router-dom";
import MainNavbar from "../components/global/MainNavbar";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  StopCircle,
  CheckCircle,
  Lightbulb,
  Code,
  ChevronLeft,
  Mic,
  Video,
  VideoOff,
  AlertCircle,
  Volume2,
  VolumeX,
  Activity,
  Sparkles
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { interviewStore } from "../components/store/InterviewStore";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { toast } from "sonner";
import { Line } from "react-chartjs-2";
import {
  Chart,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import Editor from "@monaco-editor/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

// Register Chart.js components
Chart.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function InterviewSection() {
  const [isRecording, setIsRecording] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [code, setCode] = useState("// Write your code here");
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [response, setResponse] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timer, setTimer] = useState(180);
  
  // Expression Analysis State
  const [faceExpression, setFaceExpression] = useState(null);
  const [liveFeedback, setLiveFeedback] = useState("Initializing AI Coach...");
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState(null);
  const [expressionHistory, setExpressionHistory] = useState(new Array(20).fill({ confidence: 0 })); // Init with empty data for graph stability
  
  const [currentQuestionExpressions, setCurrentQuestionExpressions] = useState([]);
  const [selectedSpeechLanguage, setSelectedSpeechLanguage] = useState("en-US");
  const [isSpeaking, setIsSpeaking] = useState(false);

  const navigate = useNavigate();
  const videoRef = useRef(null);
  const faceLandmarkerRef = useRef(null);
  const detectionFrameRef = useRef({ last: 0, frameId: null });
  let streamRef = useRef(null);
  const transcriptRef = useRef(""); 

  const {
    questions,
    details,
    addTranscript,
    getFeedback,
    transcriptsAnswers,
    loading,
  } = interviewStore();
  
  const currentQuestion = questions?.[currentQuestionIndex] || {};

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  // --- AI Voice ---
  const speakQuestion = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (currentQuestion?.question) {
      const timeout = setTimeout(() => speakQuestion(currentQuestion.question), 800);
      return () => clearTimeout(timeout);
    }
  }, [currentQuestionIndex]);

  // --- Robust Expression Detection ---
  const getExpressionFromBlendshapes = (blendshapes) => {
    const getScore = (name) => blendshapes.find(b => b.categoryName === name)?.score || 0;

    const smile = (getScore('mouthSmileLeft') + getScore('mouthSmileRight')) / 2;
    const frown = (getScore('mouthFrownLeft') + getScore('mouthFrownRight')) / 2;
    const browDown = (getScore('browDownLeft') + getScore('browDownRight')) / 2; // Focused/Angry
    const browUp = (getScore('browOuterUpLeft') + getScore('browOuterUpRight')) / 2; // Surprised
    const squint = (getScore('eyeSquintLeft') + getScore('eyeSquintRight')) / 2;

    let expression = "Neutral";
    let confidence = 0;

    // Prioritized logic
    if (smile > 0.4) { expression = "Happy"; confidence = smile; }
    else if (frown > 0.5) { expression = "Sad"; confidence = frown; }
    else if (browDown > 0.5) { expression = "Focused"; confidence = browDown; } // "Focused" is positive in interviews
    else if (browUp > 0.5) { expression = "Surprised"; confidence = browUp; }
    else if (squint > 0.5) { expression = "Suspicious"; confidence = squint; }
    else { 
        expression = "Neutral"; 
        confidence = 0.5; // Base confidence for neutral
    }

    return { expression, confidence };
  };

  // --- Real-time Feedback Logic ---
  const updateLiveFeedback = (expr, conf) => {
    if (expr === "Happy") setLiveFeedback("Great energy! Keep smiling.");
    else if (expr === "Focused") setLiveFeedback("You look locked in. Good focus.");
    else if (expr === "Sad" || expr === "Suspicious") setLiveFeedback("Try to relax your face. Look confident.");
    else if (expr === "Surprised") setLiveFeedback("Composed expressions convey certainty.");
    else if (conf < 0.3) setLiveFeedback("Speak up and engage more with the camera.");
    else setLiveFeedback("You're doing great. maintain eye contact.");
  };

  // --- Transcript Sync ---
  useEffect(() => {
    if (transcript) {
      transcriptRef.current = transcript;
      if (isRecording) setResponse(transcript);
    }
  }, [transcript, isRecording]);

  if (!questions || questions.length === 0) {
    return <div className="p-10 text-center">Loading Interview Data...</div>;
  }

  // --- Mediapipe Init ---
  useEffect(() => {
    const loadMediapipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm"
        );
        const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          },
          outputFaceBlendshapes: true,
          runningMode: "VIDEO",
          numFaces: 1,
        });
        faceLandmarkerRef.current = faceLandmarker;
        setModelsLoaded(true);
      } catch (error) {
        setLoadingError("AI Model Failed.");
      }
    };
    loadMediapipe();
  }, []);

  // --- Camera & Detection ---
  useEffect(() => {
    if (!modelsLoaded || loadingError) return;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 480, height: 360 } });
        streamRef.current = stream;
        if(videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
                videoRef.current.play().then(() => startDetection()).catch(console.error);
            };
        }
      } catch (error) {
        setLoadingError("Camera Denied");
      }
    };

    const startDetection = () => {
      const detect = async () => {
        const video = videoRef.current;
        if (!faceLandmarkerRef.current || !video || video.readyState < 2) {
             detectionFrameRef.current.frameId = requestAnimationFrame(detect);
             return;
        }
        
        const now = performance.now();
        if (now - detectionFrameRef.current.last < 100) { // Limit FPS
          detectionFrameRef.current.frameId = requestAnimationFrame(detect);
          return;
        }
        detectionFrameRef.current.last = now;

        try {
            const result = await faceLandmarkerRef.current.detectForVideo(video, now);
            
            if (result.faceBlendshapes && result.faceBlendshapes.length > 0) {
                const shapes = result.faceBlendshapes[0].categories;
                const { expression, confidence } = getExpressionFromBlendshapes(shapes);
                
                setFaceExpression({ expression, confidence });
                updateLiveFeedback(expression, confidence);
                
                const dataPoint = {
                    timestamp: now,
                    confidence: Math.round(confidence * 100),
                };

                // Update Graph (Keep array fixed size for smooth chart)
                setExpressionHistory(prev => {
                    const newHistory = [...prev.slice(1), dataPoint];
                    return newHistory;
                });

                setCurrentQuestionExpressions(prev => [...prev, { ...dataPoint, dominantExpression: expression }]);
            }
        } catch (e) {}
        detectionFrameRef.current.frameId = requestAnimationFrame(detect);
      };
      detect();
    };

    startCamera();

    return () => {
      if (detectionFrameRef.current.frameId) cancelAnimationFrame(detectionFrameRef.current.frameId);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      window.speechSynthesis.cancel();
    };
  }, [modelsLoaded, loadingError]);

  // --- Next & Finish ---
  const calculateQuestionMetrics = () => {
    if (currentQuestionExpressions.length === 0) return { averageConfidence: 50, dominantExpression: "Neutral" };
    
    const total = currentQuestionExpressions.reduce((sum, item) => sum + item.confidence, 0);
    const avg = Math.round(total / currentQuestionExpressions.length);
    
    const counts = {};
    currentQuestionExpressions.forEach(i => counts[i.dominantExpression] = (counts[i.dominantExpression] || 0) + 1);
    const dom = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, "Neutral");

    return { averageConfidence: avg, dominantExpression: dom };
  };

  const proceedToNext = async (explicitAnswer = null) => {
    const emotionalData = calculateQuestionMetrics();
    let finalAnswer = explicitAnswer !== null ? explicitAnswer : (showEditor ? code : (transcriptRef.current || response));

    addTranscript(currentQuestion.number, finalAnswer, emotionalData);

    setCurrentQuestionExpressions([]);
    // Don't reset expressionHistory to keep graph looking alive
    setResponse("");
    setCode("// Write your code here");
    transcriptRef.current = "";
    resetTranscript();
    setIsRecording(false);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimer(questions[currentQuestionIndex + 1]?.timer || 180);
    } else {
      handleFinishInterview();
    }
  };

  const handleFinishInterview = async () => {
    try {
      await getFeedback(questions, transcriptsAnswers, details);
      navigate("/interview/results");
    } catch (error) {
      toast.error("Analysis Failed. Please check console.");
    }
  };

  const handleNextClick = () => {
    let answerToSave = null;
    if (showEditor) {
        answerToSave = code;
    } else {
        if (isRecording) {
            SpeechRecognition.stopListening();
            setIsRecording(false);
            answerToSave = transcriptRef.current; 
        } else {
            answerToSave = response;
        }
    }
    proceedToNext(answerToSave);
  };

  const toggleRecording = () => {
    if (isRecording) {
        SpeechRecognition.stopListening();
        setIsRecording(false);
    } else {
        resetTranscript();
        transcriptRef.current = "";
        setIsRecording(true);
        SpeechRecognition.startListening({ continuous: true, language: selectedSpeechLanguage });
    }
  };

  // Timer
  useEffect(() => {
    if ((isRecording || showEditor) && timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => {
            if (prev <= 1) { clearInterval(interval); handleNextClick(); return 0; }
            return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isRecording, showEditor, timer]);

  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

  return (
    <div className="bg-background min-h-screen text-foreground font-inter">
      <MainNavbar />
      <div className="container mx-auto px-4 lg:px-8 py-20">
        
        {/* TOP BAR */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="self-start">
            <ChevronLeft className="h-4 w-4 mr-2" /> Quit Interview
          </Button>
          <div className="text-center md:text-right">
            <h1 className="font-bold text-xl text-primary">{details.InterviewType}</h1>
            <div className="flex items-center justify-center md:justify-end gap-2 text-sm text-muted-foreground mt-1">
               <Badge variant="outline">{details.JobRole}</Badge>
               <Badge variant={timer < 30 ? "destructive" : "secondary"} className="font-mono">
                 {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
               </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: Live Analysis Panel */}
          <div className="lg:col-span-3 flex flex-col gap-6 order-2 lg:order-1">
            
            {/* Camera Feed */}
            <Card className="overflow-hidden border-2 border-primary/20 shadow-lg">
                <div className="relative aspect-video bg-black">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-90 scale-x-[-1]" />
                    <div className="absolute top-2 left-2">
                        {isRecording && <Badge variant="destructive" className="animate-pulse">REC</Badge>}
                    </div>
                </div>
            </Card>

            {/* NEW: Live Coach & Stats */}
            <Card className="shadow-md border-t-4 border-t-primary">
                <CardHeader className="py-3 px-4 bg-muted/20">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Activity className="w-4 h-4 text-primary" /> Live Analysis
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-4">
                    
                    {/* Current Vibe */}
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-muted-foreground">Current Vibe</span>
                        <Badge className={`${
                            faceExpression?.expression === 'Happy' || faceExpression?.expression === 'Focused' 
                            ? 'bg-green-500' : 'bg-yellow-500'
                        } text-white`}>
                            {faceExpression?.expression || "Detecting..."}
                        </Badge>
                    </div>

                    {/* Confidence Meter */}
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Confidence</span>
                            <span className="font-bold">{faceExpression ? Math.round(faceExpression.confidence * 100) : 0}%</span>
                        </div>
                        <Progress value={faceExpression ? faceExpression.confidence * 100 : 0} className="h-2" />
                    </div>

                    {/* AI Coach Tip */}
                    <div className="bg-primary/5 p-3 rounded-lg border border-primary/10">
                        <div className="flex items-center gap-2 mb-1 text-primary text-xs font-bold uppercase">
                            <Sparkles className="w-3 h-3" /> AI Coach
                        </div>
                        <p className="text-xs leading-relaxed font-medium text-foreground/80">
                            "{liveFeedback}"
                        </p>
                    </div>

                    {/* Confidence Graph */}
                    <div className="h-32 w-full pt-2 border-t">
                        <p className="text-[10px] text-muted-foreground mb-1 uppercase font-bold text-center">Trend (Last 30s)</p>
                        <Line
                            data={{
                                labels: expressionHistory.map(() => ''),
                                datasets: [{
                                    data: expressionHistory.map(e => e.confidence * 100),
                                    borderColor: '#6366f1',
                                    borderWidth: 2,
                                    pointRadius: 0,
                                    tension: 0.4,
                                    fill: true,
                                    backgroundColor: (context) => {
                                        const ctx = context.chart.ctx;
                                        const gradient = ctx.createLinearGradient(0, 0, 0, 200);
                                        gradient.addColorStop(0, "rgba(99, 102, 241, 0.4)");
                                        gradient.addColorStop(1, "rgba(99, 102, 241, 0.0)");
                                        return gradient;
                                    },
                                }]
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                                scales: {
                                    x: { display: false },
                                    y: { min: 0, max: 100, display: false }
                                }
                            }}
                        />
                    </div>
                </CardContent>
            </Card>
          </div>

          {/* MIDDLE: Question & Answer Area */}
          <div className="lg:col-span-6 flex flex-col gap-6 order-1 lg:order-2">
            <Card className="border-primary/20 shadow-lg min-h-[500px] flex flex-col">
                <CardHeader className="bg-muted/20 pb-4">
                    <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className="bg-background">Question {currentQuestion.number}</Badge>
                        <div className="flex gap-2">
                             <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6" 
                                onClick={() => speakQuestion(currentQuestion.question)}
                             >
                                {isSpeaking ? <Volume2 className="h-4 w-4 animate-pulse text-primary" /> : <VolumeX className="h-4 w-4" />}
                             </Button>
                        </div>
                    </div>
                    <h2 className="text-xl font-semibold leading-relaxed tracking-tight">
                        {currentQuestion.question}
                    </h2>
                </CardHeader>
                
                <CardContent className="p-0 flex-1 relative">
                    {showEditor ? (
                        <div className="h-[400px] border-t border-border flex flex-col">
                             <div className="flex justify-end p-2 bg-muted/30 border-b">
                                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                                    <SelectTrigger className="w-[120px] h-8"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="javascript">JavaScript</SelectItem>
                                        <SelectItem value="python">Python</SelectItem>
                                        <SelectItem value="java">Java</SelectItem>
                                    </SelectContent>
                                </Select>
                             </div>
                             <div className="flex-1">
                                <Editor
                                    height="100%"
                                    language={selectedLanguage}
                                    value={code}
                                    onChange={(val) => setCode(val)}
                                    theme="vs-dark"
                                    options={{ minimap: { enabled: false }, fontSize: 14 }}
                                />
                             </div>
                        </div>
                    ) : (
                        <div className="h-[400px] p-6 overflow-y-auto bg-muted/5 relative">
                            {response || transcript ? (
                                <p className="text-lg leading-relaxed whitespace-pre-wrap text-foreground font-medium">
                                    {isRecording ? transcript : response}
                                </p>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                                    <Mic className="w-16 h-16 mb-4 stroke-1 text-primary/40" />
                                    <p>Tap "Record" and answer clearly...</p>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
                
                <CardFooter className="p-4 bg-background border-t flex gap-4 justify-between sticky bottom-0 z-10">
                    <Button variant="ghost" size="sm" onClick={() => setShowEditor(!showEditor)}>
                        <Code className="w-4 h-4 mr-2" />
                        {showEditor ? "Switch to Speech" : "Switch to Code"}
                    </Button>

                    <div className="flex gap-3">
                        {!showEditor && (
                            <Button 
                                variant={isRecording ? "destructive" : "secondary"}
                                onClick={toggleRecording}
                                className="w-32 transition-all shadow-sm"
                            >
                                {isRecording ? (
                                    <><StopCircle className="w-4 h-4 mr-2" /> Stop</>
                                ) : (
                                    <><Mic className="w-4 h-4 mr-2" /> Record</>
                                )}
                            </Button>
                        )}
                        <Button 
                            onClick={handleNextClick} 
                            disabled={loading} 
                            className="w-32 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                        >
                            {loading ? "Analyzing..." : "Next"} <CheckCircle className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </CardFooter>
            </Card>
          </div>

          {/* RIGHT: Tips */}
          <div className="lg:col-span-3 order-3">
             {!details.isStrictMock && currentQuestion.tips && (
                <Card className="bg-yellow-50/40 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800">
                    <CardHeader className="py-3">
                        <CardTitle className="flex items-center gap-2 text-sm text-yellow-700 dark:text-yellow-500 font-bold">
                            <Lightbulb className="w-4 h-4" /> Hints
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-4">
                        {Object.entries(currentQuestion.tips).map(([key, val], idx) => (
                            <div key={idx} className="bg-white/50 dark:bg-black/20 p-2 rounded">
                                <span className="font-bold block text-foreground mb-1">{key}</span>
                                <span className="text-muted-foreground text-xs leading-tight">{val}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
             )}
          </div>

        </div>
      </div>
    </div>
  );
}