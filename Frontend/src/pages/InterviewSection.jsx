import { useNavigate } from "react-router-dom";
import MainNavbar from "../components/global/MainNavbar";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  ArrowLeftCircle,
  PlayCircle,
  StopCircle,
  CheckCircle,
  Lightbulb,
  StepBack,
  Code,
  ChevronLeft,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { interviewStore } from "../components/store/InterviewStore";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { toast } from "sonner";
import { Line, Radar } from "react-chartjs-2";
import {
  Chart,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  RadialLinearScale,
  Filler,
  ArcElement,
} from "chart.js";
import Editor from "@monaco-editor/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

Chart.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  RadialLinearScale,
  Filler,
  ArcElement
);

export default function InterviewSection() {
  const [isRecording, setIsRecording] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [code, setCode] = useState("// Write your code here");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [response, setResponse] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timer, setTimer] = useState(180);
  const [faceExpression, setFaceExpression] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState(null);
  const [expressionHistory, setExpressionHistory] = useState([]);
  const [averageExpressions, setAverageExpressions] = useState({
    happy: 0,
    sad: 0,
    angry: 0,
    surprised: 0,
    neutral: 0,
  });

  const navigate = useNavigate();

  const videoRef = useRef(null);
  const faceLandmarkerRef = useRef(null);
  const detectionFrameRef = useRef({ last: 0, frameId: null });
  let streamRef = useRef(null);

  const {
    questions,
    details,
    addTranscript,
    getFeedback,
    transcriptsAnswers,
    loading,
  } = interviewStore();
  const interviewQuestions = questions;
  const currentQuestion = interviewQuestions?.[currentQuestionIndex] || {};

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  // Detect dark mode for Monaco theme
  const isDarkMode = document.documentElement.classList.contains("dark");
  const monacoTheme = isDarkMode ? "vs-dark" : "vs";

  // Suppress Mediapipe logs
  useEffect(() => {
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      if (!args[0]?.includes("vision_wasm_internal.js")) {
        originalConsoleLog(...args);
      }
    };
    return () => {
      console.log = originalConsoleLog;
    };
  }, []);

  // Sync response with transcript
  useEffect(() => {
    setResponse(transcript);
  }, [transcript]);

  // Handle case when no questions are available
  if (!questions || questions.length === 0) {
    return (
      <div className="bg-background min-h-screen text-foreground font-inter">
        <MainNavbar />
        <div className="container mx-auto px-5 py-8 md:py-12 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">
              Cannot access this route
            </h1>
            <p className="text-muted-foreground mb-6">
              Enter details then mock interview will start!
            </p>
            <Button
              onClick={() => navigate("/interview")}
              className="bg-secondary hover:bg-secondary/80 text-secondary-foreground"
            >
              <StepBack className="mr-2" />
              Go back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Load Mediapipe FaceLandmarker model
  useEffect(() => {
    const loadMediapipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm"
        );
        const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          },
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: false,
          runningMode: "VIDEO",
          numFaces: 1,
        });
        faceLandmarkerRef.current = faceLandmarker;
        setModelsLoaded(true);
        setLoadingError(null);
        console.log("Mediapipe model loaded successfully");
      } catch (error) {
        toast.error(`Failed to load Mediapipe model: ${error.message}`);
        setLoadingError(
          "Failed to load face detection model. Please check your network connection and try refreshing the page."
        );
      }
    };

    loadMediapipe();
  }, []);

  useEffect(() => {
    if (expressionHistory.length === 0) return;

    const totals = { happy: 0, sad: 0, angry: 0, surprised: 0, neutral: 0 };
    expressionHistory.forEach((e) => {
      if (totals[e.dominantExpression] !== undefined) {
        totals[e.dominantExpression] += e.confidence;
      }
    });

    const averages = {};
    Object.keys(totals).forEach((k) => {
      averages[k] = (totals[k] / expressionHistory.length).toFixed(2);
    });

    setAverageExpressions(averages);
  }, [expressionHistory]);

  // Start camera and detection
  useEffect(() => {
    if (!modelsLoaded || loadingError) return;

    const hasCamera = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices.some((device) => device.kind === "videoinput");
      } catch {
        return false;
      }
    };

    const startCameraAndDetection = async () => {
      if (!(await hasCamera())) {
        setLoadingError("No camera detected on this device.");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240 },
        });
        streamRef.current = stream; // Store the stream
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          video.addEventListener("loadeddata", () => {
            video
              .play()
              .then(() => {
                startDetection();
              })
              .catch((error) => {
                toast.error(`Failed to play video: ${error}`);
                setLoadingError(
                  "Failed to start video stream: " + error.message
                );
              });
          });
        } else {
          setLoadingError("Video element not found.");
        }
      } catch (error) {
        console.error("Camera access error:", error.name, error.message);
        if (error.name === "NotAllowedError") {
          setLoadingError(
            "Camera access denied. Please allow camera permissions."
          );
        } else if (error.name === "NotFoundError") {
          setLoadingError("No camera found on this device.");
        } else {
          setLoadingError("Camera access error: " + error.message);
        }
      }
    };

    const startDetection = () => {
      const video = videoRef.current;
      if (
        !video ||
        video.paused ||
        video.ended ||
        video.videoWidth === 0 ||
        video.videoHeight === 0
      ) {
        setTimeout(startDetection, 500);
        return;
      }

      const detect = async () => {
        try {
          const faceLandmarker = faceLandmarkerRef.current;
          const video = videoRef.current;
          const now = performance.now();

          // Skip frames to throttle to ~2s intervals
          if (
            detectionFrameRef.current.last &&
            now - detectionFrameRef.current.last < 2000
          ) {
            detectionFrameRef.current.frameId = requestAnimationFrame(detect);
            return;
          }
          detectionFrameRef.current.last = now;

          const results = await faceLandmarker.detectForVideo(video, now);

          if (results.faceBlendshapes?.length > 0) {
            const blendshapes = results.faceBlendshapes[0].categories;
            const expression = getExpressionFromBlendshapes(blendshapes);
            setFaceExpression(expression);

            // Save to history
            setExpressionHistory((prev) => [
              ...prev.slice(-30), // keep last 30 samples
              {
                timestamp: Date.now(),
                dominantExpression: expression?.expression || "neutral",
                confidence: expression?.confidence || 0,
                expressionScores: blendshapes.reduce((acc, b) => {
                  acc[b.categoryName] = b.score;
                  return acc;
                }, {}),
              },
            ]);
          }
        } catch (error) {
          console.error("Detection error:", error);
        }
        detectionFrameRef.current.frameId = requestAnimationFrame(detect);
      };

      detect();
    };

    startCameraAndDetection();

    // Cleanup function to stop camera and detection
    return () => {
      if (detectionFrameRef.current.frameId) {
        cancelAnimationFrame(detectionFrameRef.current.frameId);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null; // Clear the stream reference
      }
      if (faceLandmarkerRef.current) {
        faceLandmarkerRef.current.close();
      }
    };
  }, [modelsLoaded, loadingError]);

  // Custom logic to map blendshapes to expressions
  const getExpressionFromBlendshapes = (blendshapes) => {
    const expressionScores = {
      happy: 0,
      sad: 0,
      angry: 0,
      surprised: 0,
      neutral: 0,
    };

    blendshapes.forEach((blendshape) => {
      const { categoryName, score } = blendshape;
      if (
        categoryName.includes("smile") ||
        categoryName.includes("mouthSmile")
      ) {
        expressionScores.happy += score * 1.5;
      } else if (
        categoryName.includes("frown") ||
        categoryName.includes("mouthFrown") ||
        categoryName.includes("sad")
      ) {
        expressionScores.sad += score * 1.2;
      } else if (
        categoryName.includes("anger") ||
        categoryName.includes("browDown")
      ) {
        expressionScores.angry += score * 1.2;
      } else if (
        categoryName.includes("eyeWide") ||
        categoryName.includes("jawOpen") ||
        categoryName.includes("mouthPucker")
      ) {
        expressionScores.surprised += score * 1.3;
      } else if (categoryName.includes("neutral")) {
        expressionScores.neutral += score;
      }
    });

    const totalScore = Object.values(expressionScores).reduce(
      (sum, val) => sum + val,
      0
    );
    if (totalScore > 0) {
      Object.keys(expressionScores).forEach(
        (key) => (expressionScores[key] /= totalScore)
      );
    }

    const maxExpression = Object.entries(expressionScores).reduce(
      (max, [key, value]) => (value > max[1] ? [key, value] : max),
      ["neutral", 0]
    );

    return maxExpression[1] > 0.4
      ? { expression: maxExpression[0], confidence: maxExpression[1] }
      : null;
  };

  // Proceed to next question or results
  const proceedToNext = async () => {
    if (currentQuestionIndex < interviewQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setTimer(interviewQuestions[currentQuestionIndex + 1]?.timer || 180);
      resetTranscript();
      setResponse("");
      setShowEditor(false);
      setCode("// Write your code here");
      setSelectedLanguage("javascript");
    } else {
      try {
        await getFeedback(questions, transcriptsAnswers, details);
        if (!loading) {
          navigate("/interview/results");
        }
      } catch (error) {
        console.error("Feedback error:", error);
        alert("Failed to fetch feedback. Please try again.");
      }
    }
  };

  // Timer logic
  useEffect(() => {
    let interval = null;
    if ((isRecording || showEditor) && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          const newTimer = prev - 1;
          if (newTimer <= 0) {
            clearInterval(interval);
            if (isRecording) {
              handleStopRecording();
            } else if (showEditor) {
              const userCode =
                code.trim() !== "// Write your code here" ? code : "";
              addTranscript(currentQuestion.number, userCode);
              proceedToNext();
            }
            return 0;
          }
          return newTimer;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, showEditor, timer]);

  // Actions
  const handleStartRecording = async () => {
    if (showEditor) {
      toast.error("Use the code editor for coding questions.");
      return;
    }
    if (!currentQuestion.number) return;
    const hasMic = await navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(() => true)
      .catch(() => false);
    if (!hasMic) {
      alert(
        "Microphone access is required for speech recognition. Please allow permissions."
      );
      return;
    }
    setIsRecording(true);
    resetTranscript();
    SpeechRecognition.startListening({ continuous: true, language: "en-US" });
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    SpeechRecognition.stopListening();
    const userResponse = transcript || "";
    addTranscript(currentQuestion.number, userResponse);
    setResponse(userResponse);
  };

  const openEditor = () => {
    setShowEditor(true);
  };

  const closeEditor = () => {
    if (code.trim() !== "// Write your code here") {
      setResponse(code);
    }
    setShowEditor(false);
  };

  const handleNext = async () => {
    const userResponse = showEditor ? code : response;
    addTranscript(currentQuestion.number, userResponse);
    await proceedToNext();
  };

  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

  let buttonLabel, buttonIcon, buttonColor;
  if (showEditor) {
    buttonLabel = "Next Question";
    buttonIcon = <CheckCircle className="mr-2" />;
    buttonColor = "bg-blue-600 hover:bg-blue-700";
  } else if (isRecording) {
    buttonLabel = "Stop Recording";
    buttonIcon = <StopCircle className="mr-2" />;
    buttonColor = "bg-red-600 hover:bg-red-700";
  } else if (response) {
    buttonLabel = "Next Question";
    buttonIcon = <CheckCircle className="mr-2" />;
    buttonColor = "bg-blue-600 hover:bg-blue-700";
  } else {
    buttonLabel = "Start Recording";
    buttonIcon = <PlayCircle className="mr-2" />;
    buttonColor = "bg-green-600 hover:bg-green-700";
  }

  const isButtonDisabled =
    ((isRecording || showEditor) && timer === 0) ||
    (showEditor && code.trim() === "// Write your code here");

  if (!browserSupportsSpeechRecognition) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Speech Recognition Not Supported</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">
            Your browser does not support speech recognition. Please use Chrome
            or Edge.
          </p>
        </CardContent>
      </Card>
    );
  }

  const languageOptions = [
    { value: "javascript", label: "JavaScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" },
    { value: "typescript", label: "TypeScript" },
  ];

  const handleMainButtonClick = () => {
    if (showEditor) {
      handleNext();
    } else if (isRecording) {
      handleStopRecording();
    } else if (response) {
      handleNext();
    } else {
      handleStartRecording();
    }
  };

  const handleEditorChange = (value) => {
    setResponse(value || "");
  };

  return (
    <div className="bg-background min-h-screen text-foreground font-inter">
      <MainNavbar />
      <div className="container mx-auto px-4 lg:px-8 py-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center  mb-10">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
          <div className="text-center md:text-right mt-4 md:mt-0">
            <h1 className="font-bold text-xl md:text-2xl">
              {details.InterviewType || ""}
            </h1>
            <p className="text-muted-foreground text-sm">
              {details.JobRole} <Badge>{details.duration}</Badge>
            </p>
          </div>
        </div>

        {/* Main Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT — Camera Feed */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <Card className="shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Your Camera
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Ensure you’re well-lit and centered
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-video bg-gray-200 dark:bg-neutral-800 rounded-xl overflow-hidden border border-border">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  ></video>
                </div>
              </CardContent>
            </Card>

            {!details.isStrictMock && (
              <Card className="shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lightbulb className="mr-2 h-5 w-5 text-yellow-500" />{" "}
                    Helpful Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {currentQuestion.tips ? (
                    <ul className="list-disc list-inside space-y-2 text-sm">
                      {Object.entries(currentQuestion.tips).map(
                        ([key, value]) => (
                          <li key={key} className="text-muted-foreground">
                            <strong>{key}:</strong> {value}
                          </li>
                        )
                      )}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No tips available.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* CENTER — Question & Response */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <Card className="shadow-lg rounded-2xl border-primary/10">
              <CardHeader className="text-center space-y-2">
                <CardTitle className="text-lg font-semibold">
                  Question {currentQuestion.number || "?"} of{" "}
                  {interviewQuestions.length}
                </CardTitle>
                <CardDescription className="text-sm">
                  {details.DifficultyLevel}
                </CardDescription>
                <Badge variant="secondary" className="text-sm">
                  {minutes}:{seconds < 10 ? "0" : ""}
                  {seconds}
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-xl text-center mb-6 font-medium">
                  {currentQuestion.question || "No question available"}
                </p>
                <div className="bg-muted/40 p-4 rounded-md border min-h-[300px]">
                  {showEditor ? (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Select
                          value={selectedLanguage}
                          onValueChange={(val) => setSelectedLanguage(val)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            {languageOptions.map((lang) => (
                              <SelectItem key={lang.value} value={lang.value}>
                                {lang.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Editor
                        height="300px"
                        language={selectedLanguage}
                        value={response}
                        onChange={handleEditorChange}
                        theme={monacoTheme}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 16,
                          fontFamily: "'Fira Code', Consolas, monospace",
                          wordWrap: "on",
                          wordWrapColumn: 80,
                          wrappingIndent: "deepIndent",
                          lineHeight: 22,
                          fontLigatures: true,
                          automaticLayout: true,
                          scrollBeyondLastLine: false,
                        }}
                      />
                    </div>
                  ) : isRecording && !response ? (
                    <p className="text-sm italic animate-pulse text-muted-foreground">
                      Listening for your answer...
                    </p>
                  ) : !isRecording && !response ? (
                    <p className="text-sm text-muted-foreground">
                      No response yet.
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground break-words leading-relaxed">
                      {response}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="gap-6">
                <Button
                  className={`${buttonColor} w-full rounded-xl shadow-md`}
                  onClick={handleMainButtonClick}
                  disabled={isButtonDisabled}
                >
                  {buttonIcon} {buttonLabel}
                </Button>
                <Button
                  variant="outline"
                  onClick={showEditor ? closeEditor : openEditor}
                >
                  <Code className="mr-2" />{" "}
                  {showEditor ? "Close Editor" : "Write Code"}
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* RIGHT — Analytics (Charts) */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Real-time Feedback
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Emotional confidence from face tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingError ? (
                  <p className="text-sm text-red-600">{loadingError}</p>
                ) : modelsLoaded ? (
                  faceExpression ? (
                    expressionHistory.length > 0 ? (
                      <Line
                        data={{
                          labels: expressionHistory.map(
                            (e) =>
                              new Date(e.timestamp)
                                .toLocaleTimeString()
                                .split(" ")[0]
                          ),
                          datasets: [
                            {
                              label: "Confidence",
                              data: expressionHistory.map((e) =>
                                (e.confidence * 100).toFixed(1)
                              ),
                              borderWidth: 2,
                              tension: 0.4,
                              fill: true,
                              backgroundColor: "rgba(59,130,246,0.2)",
                              borderColor: "rgba(59,130,246,1)",
                              pointRadius: 0,
                            },
                          ],
                        }}
                        options={{
                          scales: { y: { beginAtZero: true, max: 100 } },
                          plugins: { legend: { display: false } },
                        }}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Waiting for data...
                      </p>
                    )
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No face detected. Ensure your camera is active.
                    </p>
                  )
                ) : (
                  <p className="text-sm text-muted-foreground animate-pulse">
                    Loading models...
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Average Expression Radar
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Overview of your dominant expressions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(averageExpressions).length > 0 ? (
                  <div className="relative w-48 h-48 mx-auto">
                    <Radar
                      data={{
                        labels: Object.keys(averageExpressions),
                        datasets: [
                          {
                            label: "Expression Intensity (%)",
                            data: Object.values(averageExpressions).map((v) =>
                              (v * 100).toFixed(1)
                            ),
                            backgroundColor: "rgba(239,68,68,0.3)",
                            borderColor: "rgba(239,68,68,1)",
                            borderWidth: 2,
                            pointBackgroundColor: "rgba(239,68,68,1)",
                          },
                        ],
                      }}
                      options={{
                        maintainAspectRatio: false,
                        scales: {
                          r: {
                            suggestedMin: 0,
                            suggestedMax: 100,
                            ticks: {
                              stepSize: 20,
                              color: "#999",
                              display: false,
                            },
                            pointLabels: { color: "#666", font: { size: 10 } },
                            grid: { color: "rgba(0,0,0,0.1)" },
                          },
                        },
                        plugins: { legend: { display: false } },
                      }}
                    />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Not enough data for radar chart yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
